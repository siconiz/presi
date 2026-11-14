// Usage: node shorts/make.js shorts/briefs/ko.json [more briefs...]
// Needs: Node 18+, playwright (with Chromium), ffmpeg on PATH. Fonts load from Google Fonts.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const W = 1080, H = 1920, FPS = 30, FADE = 0.4;
const MIME = { ".html": "text/html; charset=utf-8", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png" };
const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\n/g, "<br>");

async function capture(browser, brief, sc, file) {
  const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 2.5 });
  await page.route("http://game.local/**", (r) => {
    const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname));
    fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: MIME[path.extname(f)] }) : r.abort();
  });
  await page.addInitScript((l) => localStorage.setItem("lang", JSON.stringify(l)), brief.lang);
  await page.goto(`http://game.local/${brief.game_file || "world-leader.html"}${sc.view || ""}`);
  await page.waitForTimeout(sc.wait || 3500);
  const el = page.locator(sc.focus || "body").first();
  const b = await el.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height }; });
  const maxH = sc.max_h || 760;
  await page.screenshot({ path: file, fullPage: true, clip: { x: b.x, y: b.y + (sc.offset || 0), width: b.width, height: Math.min(b.height - (sc.offset || 0), maxH) } });
  await page.close();
}

function frameHtml(brief, sc, i, shot) {
  const img = fs.readFileSync(shot).toString("base64");
  return `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500;700;900&display=swap">
<style>
*{box-sizing:border-box;margin:0}
body{width:${W}px;height:${H}px;overflow:hidden;font-family:"Noto Sans KR",sans-serif;color:#f4f1ea;
 background:radial-gradient(120% 70% at 50% 0%,#24413a 0%,#11181d 60%,#0b0f12 100%);display:flex;flex-direction:column;align-items:center;padding:110px 70px 120px}
.tag{font-size:34px;font-weight:700;letter-spacing:.06em;color:#e6b85c}
h1{margin-top:24px;font-size:${sc.size || 76}px;line-height:1.18;font-weight:900;text-align:center;text-wrap:balance}
.concept{margin-top:20px;font-size:36px;color:#b9c4c9;text-align:center;line-height:1.4}
.shot{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;margin:48px 0}
.shot img{max-width:900px;max-height:100%;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 3px rgba(255,255,255,.08)}
.req{font-size:40px;font-weight:700;text-align:center;line-height:1.35}
.url{margin-top:18px;font-size:36px;font-weight:700;color:#11181d;background:#e6b85c;padding:12px 34px;border-radius:999px}
</style>
<div class="tag">${esc(brief.title)}</div>
<h1>${esc(sc.caption)}</h1>
${i === 0 && brief.concept ? `<div class="concept">${esc(brief.concept)}</div>` : ""}
<div class="shot"><img src="data:image/png;base64,${img}"></div>
${brief.required_text ? `<div class="req">${esc(brief.required_text)}</div>` : ""}
${brief.game_url ? `<div class="url">${esc(brief.game_url)}</div>` : ""}`;
}

async function build(briefPath) {
  const brief = JSON.parse(fs.readFileSync(briefPath, "utf8"));
  const missing = ["lang", "game_url", "concept", "required_text"].filter((k) => !brief[k]);
  if (missing.length || !brief.scenes?.length) throw new Error(`${briefPath}: fill in ${missing.concat(brief.scenes?.length ? [] : ["scenes"]).join(", ")}`);
  const name = path.basename(briefPath, ".json");
  const tmp = fs.mkdtempSync(path.join(require("os").tmpdir(), "shorts-"));
  const browser = await chromium.launch();
  const frames = [];
  for (const [i, sc] of brief.scenes.entries()) {
    const shot = path.join(tmp, `s${i}.png`), frame = path.join(tmp, `f${i}.png`);
    await capture(browser, brief, sc, shot);
    const p = await browser.newPage({ viewport: { width: W, height: H } });
    await p.setContent(frameHtml(brief, sc, i, shot), { waitUntil: "networkidle" });
    await p.screenshot({ path: frame });
    await p.close();
    frames.push({ frame, sec: sc.sec || 3 });
  }
  await browser.close();

  // Each still gets a slow push-in, then clips are chained with crossfades.
  const args = ["-y", "-loglevel", "error"], f = [];
  frames.forEach(({ frame, sec }, i) => {
    args.push("-loop", "1", "-framerate", String(FPS), "-t", String(sec), "-i", frame);
    f.push(`[${i}:v]scale=${W * 1.5}:-1,zoompan=z='1+0.04*on/${sec * FPS}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=${W}x${H}:fps=${FPS},settb=AVTB,setpts=PTS-STARTPTS,format=yuv420p,setsar=1[v${i}]`);
  });
  let last = "v0", t = frames[0].sec;
  for (let i = 1; i < frames.length; i++) {
    f.push(`[${last}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${(t - FADE).toFixed(2)}[x${i}]`);
    last = `x${i}`; t += frames[i].sec - FADE;
  }
  args.push("-f", "lavfi", "-t", t.toFixed(2), "-i", "anullsrc=r=44100:cl=stereo");
  const out = path.join(__dirname, "out", `${name}.mp4`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  args.push("-filter_complex", f.join(";"), "-map", `[${last}]`, "-map", `${frames.length}:a`,
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", "-movflags", "+faststart", out);
  execFileSync("ffmpeg", args, { stdio: ["ignore", "ignore", "inherit"] });
  fs.copyFileSync(frames[0].frame, out.replace(/\.mp4$/, "-cover.png"));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`${out} (${t.toFixed(1)}s)`);
}

(async () => {
  const list = process.argv.slice(2);
  if (!list.length) return console.log("usage: node shorts/make.js shorts/briefs/<name>.json ...");
  for (const b of list) await build(b);
})().catch((e) => { console.error(e.message); process.exit(1); });
