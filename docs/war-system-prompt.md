# 전쟁 시스템 추가용 AI 프롬프트

아래 `---` 사이 내용을 그대로 코딩 AI에게 전달한다.

---

## 역할

너는 `world-leader.html`(HTML·CSS·JS 한 파일, 빌드 도구 없음)에 **국가 간 전쟁 시스템**을 추가하는 개발자다.
외부 라이브러리는 추가하지 않는다. 기존 바닐라 JS와 Canvas 2D만 쓴다.
코드를 쓰기 전에 아래 "기존 구조"에 적힌 함수를 직접 읽고 이름·시그니처를 확인한 뒤 작업한다.

## 기존 구조 (반드시 재사용)

- 국가 데이터: `RAW` 문자열 → `C[iso] = { gov, term, reg, bloc, ec, we, se, as, env, fr, debt, tags }`.
  - `tags`에 `nuke`(핵보유), `conflict`(분쟁 지역), `sanction`, `oil`, `island` 등이 있다.
- 관계: `G.rel[iso]`(−100~100), 기준값 `rel0(a,b)`, 적대 쌍 `HOSTILE`(예: `RUS-UKR: -90`, `KOR-PRK: -70`, `CHN-TWN: -60`), `pairKey()`.
- 인접국: `NEIGH[iso]` (atlas.json에서 로드, 실패 시 `fallbackNeighbors()`).
- 플레이어 상태 `G.s`: `ap`(지지율) `ec` `we` `se`(안보) `as`(의회/권력기반) `env` `fis`(재정) `fat`(피로). 모두 `applyFx(fx)`로만 바꾼다.
- 관계 변경: `applyRel(r)` (`nb`/`rv`/`al`/`O` 별칭 지원).
- 턴: `startTurn()` → `pickEvent()` → `choose(i)` → 행동 단계(`G.pc` 2회, `act()`/`dirty()`/`dip()`) → `nextQuarter()`.
- 사건 카드: `EVENTS` 배열. 필드 `id, dept, title, body, choices[{t, s, fx, r, risk, chain, flag, crime, log}]`, `cond(g)`, `only`, `chainOnly`, `w`, `repeat`. 연쇄는 `G.queue`.
- 외교 UI: `renderInspector()`의 `["summit","trade","aid","sanction"]` 버튼 → `dip(kind)`.
- 종료: `checkEnd()`, `finish(kind)`, 결말 키 `e_*`/`h_*`. 이미 `se <= 3`이면 `finish("war")`(안보 붕괴)가 있다.
- 점수: `score()`, `govPoints()`, `greedPoints()`.
- 문자열: `t(key, vars)`, `STR.ko`/`STR.en`. 그 밖의 언어는 `ensureUiTr()`·`ensureEventTr()`가 Claude `sample`로 번역한다.
- 여론 피드: `genFeed(kind, payload)`.
- 지도: `mapMode`(`pol, rel, ec, we, se, fr, env`), `colorFor()`, `rebuildPolitical()`, `updateMap()`, `drawMap()`.
- 체제: `regime(c)` → `dem | hyb | aut`. 선거 모드(`isCamp()`)에서는 전쟁 기능을 전부 끈다.

## 설계 근거 (조사 결과, 수치 조정의 출발점)

1. **개전은 바로 하지 않는다.** Victoria 3처럼 "외교 위기(Diplomatic Play) → 고조(escalation) → 개전" 단계를 둔다. 위기 단계에서 요구(전쟁 목표)를 많이 걸수록 동맹을 끌어오기 어렵다.
2. **전쟁 지지도와 피로.** Victoria 3는 사상자와 상대가 점령한 목표 비율로 전쟁 지지도가 깎이고, −100이 되면 항복한다. HOI4는 전쟁 기여도(점령, 전투, 사상자, 원조)에 비례해 강화 조건을 나눈다.
3. **지속 기간.** Correlates of War 국가 간 전쟁(1823~2003) 기준 중앙값 약 139일, 평균 약 408일로 오른쪽으로 긴 꼬리 분포다. 게임에서는 대부분 1~3분기에 끝나고 드물게 장기전이 되게 한다.
4. **경제 피해.** 연구별 편차가 크다. 전장 국가 산출은 수년에 걸쳐 약 10~30% 감소(Kiel Institute, NBER 2025 Benmelech·Monteiro 평균 −13%), 인접국도 수 % 피해. 국가 간 전쟁보다 내전 피해가 더 크다.
5. **여론(결집 효과).** 개전 직후 지지율이 오르지만 짧다. 사상자가 쌓이면 1년 안팎 뒤부터 오히려 처벌받고, 최근 연구는 무력 분쟁이 평균적으로 지지율을 깎는다고도 본다. 위기를 끝낸 지도자는 소폭 이득(평균 +3pt 수준).
6. **체제별 결과.** Goemans(2000): 혼합 체제(hyb) 지도자가 패전 시 실각·처벌 위험이 가장 크다. 민주국가는 이기지 못하는 전쟁에서 빨리 빠지려 한다.
7. **군사력 수치.** SIPRI 2025: 세계 군사비 약 2.89조 달러, 세계 GDP의 2.5%. 러시아 GDP 대비 7.5%, 우크라이나 약 40%. Global Firepower 2026 상위는 미국·러시아·중국 순(가중치 비공개). 국가별 군사력은 이 순위를 참고해 **0~100 근사치**로만 넣고, 출처를 README 데이터 출처에 추가한다.

## 요구 사양

### 1. 데이터
- `MIL` 표: 전 163개국에 군사력 `mil`(0~100)을 넣는다. 상위국만 손으로 지정하고 나머지는 `ec`, `se`, 인구(atlas 주 인구 합), `nuke` 태그로 산출하는 함수 `milOf(iso)`를 둔다.
- 플레이어 상태에 `G.s.mil`(군사력), `G.war`(진행 중인 전쟁 배열, 최대 2개), `G.crisis`(진행 중인 외교 위기) 추가. 저장 구조가 바뀌면 기존 `newGame()` 초기화에 넣는다.
- 전쟁 객체 예시:
  `{ id, foe, side: "atk"|"def", goal, front: 0, sup: 60, foeSup: 60, cas: 0, q0, allies: [], foeAllies: [] }`
  - `front`: −100(완패)~+100(완승). `sup`/`foeSup`: 전쟁 지지도.

### 2. 개전 경로
- 인스펙터에 `"threat"`(위협) 버튼 추가. 조건: 관계 ≤ −40, 인접국이거나 `island`가 아닌 해상 접근 가능국, 행동력 1 소모.
- 위협 → `G.crisis` 생성. 다음 분기 사건 카드로 "상대의 응답"이 나온다: 양보 / 맞대응 / 제3국 중재. 플레이어가 요구 강도(전쟁 목표: `border` 국경 분쟁, `regime` 정권 압박, `humbl` 굴복 요구)를 고른다. 목표가 클수록 상대 양보 확률 ↓, 우방 참전 확률 ↓.
- 상대가 맞대응하면 플레이어가 "개전 / 철회"를 고른다. 철회 시 `ap`·`as` 하락(체면 손실).
- **방어전**: `nextQuarter()`에서 `HOSTILE` 쌍과 관계 ≤ −60, 상대 `mil`이 내 `mil`보다 큰 경우 낮은 확률(분기당 기본 1~3%, `conflict` 태그 시 가산)로 AI가 먼저 위기를 건다. 실제 진행 중인 분쟁(예: RUS-UKR)은 첫 분기부터 전쟁 상태로 시작할 수 있게 옵션을 둔다.

### 3. 분기별 전쟁 해결
- `nextQuarter()` 안, 기존 지표 갱신 뒤 `resolveWars()` 호출.
- 전력비 `p = myPow / (myPow + foePow)`. `pow = mil × (0.6 + 0.4 × se/100) × 보급계수(fis 낮으면 감소)` + 참전 동맹 `mil`의 일부.
- `front += (p − 0.5) × 40 + rand(−12, 12)` 정도에서 시작해 튜닝. 방어 측 지형 보너스 소폭.
- 사상자 `cas`는 전선 변동 절댓값과 전력 규모에 비례해 누적.
- 지지도 감소: 사상자, 경과 분기, 전선이 불리할수록, 재정(`fis`) 고갈. 체제별 계수: `dem` 가장 민감, `hyb` 중간, `aut` 둔감(대신 `as` 하락이 쿠데타로 연결).
- 지표 효과(분기마다): `ec` −1~−4, `fis` −3~−8, `se` 변동(전선 따라), `env` 소폭 하락. 인접국은 관계와 무관하게 `ec`가 약간 하락(파급 효과)하는 것을 로그로만 알린다.
- 지지율: 개전 첫 분기 +3~+8(결집), 그 뒤 매 분기 감쇠하고 사상자 누적 시 음수로 전환.

### 4. 종전
- 자동 종료: `front` ≥ 80(승리), ≤ −80(패배), 또는 어느 한쪽 지지도 ≤ 0(항복).
- 협상: 행동 단계에 `"peace"` 행동 추가. 현재 `front`와 양측 지지도로 상대 수락 확률 계산. 결과: `white`(현상 유지), `win`(목표 달성), `lose`(양보).
- 강화 효과: 승리 시 `se`·`as`·`ap` 상승 및 관계 변화, 패배 시 하락. 휴전 후 4분기 동안 같은 상대와 재개전 불가.
- 패전 결말: `checkEnd()`에 체제별 분기 추가.
  - `hyb` 대패: 높은 확률로 실각(`e_defeat` 신규).
  - `aut` 대패: `as` 급락으로 기존 `coup` 경로.
  - `dem` 대패: 즉시 종료 대신 `ap` 대폭 하락(선거·탄핵 경로로 처리).

### 5. 동맹·국제 반응
- 관계 ≥ 60인 국가는 참전 확률, 40~60은 물자 원조(`fis` 보전), `bloc`이 같은 강대국(USA/CHN/RUS)은 상대 편 지원 가능.
- 침략자 측(`atk`)은 제3국 관계가 전반적으로 하락, `sanction` 위험. 방어자는 원조 확률 상승.
- `nuke` 태그 보유국 상대로 개전 시 경고 사건 카드와 함께 `front` 상한을 둔다(완승 불가, 확전 위험 사건). 핵 사용 선택지는 만들지 않는다.

### 6. 사건 카드
- 새 `EVENTS` 항목 8~12개: 동원령, 징집 반발, 민간인 피해 보도, 포로 교환, 중재 제안, 전시 국채, 군 지휘부 교체, 전쟁 특수 비리(`crime`로 연결), 반전 시위 등.
- 모두 `cond: (g) => g.war && g.war.length`처럼 전쟁 중에만 등장. 기존 `fx/r/risk/chain/crime` 형식을 그대로 쓴다. 전쟁 상대는 새 별칭 `{F}`(이름)과 `r`의 `"F"` 키로 지정할 수 있게 `fill()`·`applyRel()`·`resolveCtx()`를 확장한다.

### 7. UI·지도
- 상단 지표 영역에 전쟁 카드: 상대, 분기 수, 전선 막대(−100~100), 양측 지지도, 누적 사상자.
- 지도 모드에 `"war"` 추가: 교전국 빨강, 동맹 참전국 주황, 원조국 노랑. 범례는 `updateMap()` 기존 방식대로.
- 교전국 사이 국경을 강조 표시(`AT.edge` 활용, 성능 저하 없게 `rebuildPolitical()` 캐시 서명에 전쟁 상태 포함).
- 결말·점수 화면에 전쟁 이력(상대, 결과, 기간) 표시. `govPoints()`: 방어전 승리 가산, 침략전은 승리해도 가산 작게, 패전 감산.
- `genFeed("war", …)`로 개전·종전 시 SNS 여론 생성.

### 8. 데모·테스트
- `#demowar` 해시: 전쟁 중인 상태로 바로 시작(예: 아무 국가 + 인접 적대국과 2분기째 전쟁).
- 개발용 함수 `simWar(a, b, n)`를 콘솔에서 돌려 결과 분포(승/패/무승부 비율, 평균 분기 수)를 출력하고, 분포가 "대부분 1~3분기, 드물게 6분기 이상"이 되게 계수를 맞춘다. 배포 전 제거하거나 `DEMO`일 때만 노출.

## 제약

- 문자열 규칙: 사용자에게 보이는 문구는 **반드시** `STR.ko`·`STR.en`(UI)이나 `EVENTS`(사건) 안에만 넣는다. 로직 코드에 한글 리터럴을 직접 쓰지 않는다. 키 이름은 영어.
- 새로 추가한 `EVENTS`도 기존 번역 파이프라인(`ensureEventTr`)을 그대로 타야 한다.
- 실존 현직 지도자 이름을 쓰지 않는다(`LEADERS`, `isBlocked()` 규칙 유지). 실제 진행 중인 분쟁은 중립적으로 서술하고 특정 국가를 일방적으로 악마화하지 않는다.
- 핵무기 사용, 대량 학살, 민간인 표적 공격을 플레이어 선택지로 만들지 않는다.
- 기존 함수 이름·동작을 바꾸지 말고 확장만 한다. 기존 결말 `war`(안보 붕괴)는 유지.
- 코드는 짧게. 비슷한 분기는 표(객체)로 묶는다. 새 함수는 10개 안쪽.
- 다크 모드 색은 기존 CSS 토큰 방식(`--r-hostile` 등)으로 추가.

## 산출물

1. 수정된 `world-leader.html`.
2. README의 기능 목록과 데이터 출처(SIPRI, Global Firepower 근사치) 갱신.
3. 변경 요약: 추가한 상태 필드, 함수, 사건 id 목록, 튜닝한 계수와 `simWar` 결과.

---

## 조사 출처

- Victoria 3 전쟁 시스템: https://exputer.com/guides/victoria-3-war-system-explained/ , https://gameplay.tips/guides/victoria-3-ending-wars-guide.html , https://admin-forum.paradoxplaza.com/forum/developer-diary/victoria-3-dev-diary-23-fronts-and-generals.1497106
- HOI4 강화 회의·기여도: https://guildorder.com/games/hoi4/wiki/peace-conferences-and-war-score
- 전쟁 지속 기간(CoW): https://freerangestats.info/blog/2026/05/13/war-durations
- 전쟁의 경제 비용: https://www.nber.org/papers/w34389 , https://mutschler.eu/files/papers/Price_of_War_2024_Kiel_Policy_Brief.pdf
- 결집 효과: https://www.wikiwand.com/en/articles/Rally_'round_the_flag_effect , https://www.hks.harvard.edu/centers/cid/publications/rally-around-flag-effects-russian-ukrainian-war
- 체제와 패전 지도자: https://ideas.repec.org/a/sae/jocore/v44y2000i5p555-579.html , https://www.cambridge.org/core/journals/american-political-science-review/article/regime-type-the-fate-of-leaders-and-war/2E1922242069EB89B98FA7E0889810A6
- 군사비: https://www.sipri.org/sites/default/files/Military%20Expenditure%202025.pdf
- 군사력 순위: https://thecsrjournal.in/global-military-strength-rankings-2026-released/
