# 세계 지도자 5년 (World Leader: Five Years)

실제 163개국 중 하나를 골라 세계지도 위에서 국정을 운영하는 브라우저 게임입니다.
처음부터 지도자로 시작하거나, 평당원(권위주의 국가는 말단 당 간부)에서 출발해 경선과 선거를 거쳐 권좌에 오를 수 있습니다.

- 사건 카드 결재와 분기별 일정(정책·외교·뒷거래)
- 비리·은폐·폭로 시스템과 퇴임 후 결말(구속, 망명, 끝까지 안 들킴)
- 국정 점수 + 사익 점수 = 종합 점수, 공유 리더보드
- 가상 SNS 여론 피드와 다국어 번역(Claude 아티팩트의 `sample` 기능 사용)
- Victoria 스타일 지도: 지형 음영, 주(州) 경계, 곡선 국가명, 도시, 강

## 파일

| 경로 | 내용 |
| --- | --- |
| `world-leader.html` | 게임 전체(HTML·CSS·JS 한 파일) |
| `atlas/relief.jpg` | 지형 음영 + 수심 (등장방형, 북위 80° ~ 남위 60°) |
| `atlas/pid.png` | 주 ID(R·G)와 국가 ID(B) 래스터, 4050×1575 |
| `atlas/atlas.json` | 국가 색·라벨 경로·인접국, 주 이름·인구·중심점, 도시, 강 |
| `president-sim.html` | 초기 버전(가상 국가 '한별공화국') |

## 실행

`world-leader.html`은 같은 폴더의 `atlas/` 파일을 `fetch`로 읽으므로, 파일을 직접 여는 대신 로컬 서버로 여세요.

```bash
python -m http.server 8000
```

그다음 브라우저에서 `http://localhost:8000/world-leader.html`을 엽니다.
리더보드 공유, 여론 피드, 번역은 Claude 아티팩트(`db`, `user`, `sample` 기능) 안에서만 동작합니다. 그 밖에서는 브라우저에 저장된 내 기록과 기본 반응 문구로 대체됩니다.
`#demo`, `#democamp`, `#demoend`를 주소 끝에 붙이면 미리 진행된 화면을 볼 수 있습니다.

## 데이터 출처

- 국가 출발 수치: IMF WEO, World Bank WDI, Freedom House 2026, Global Peace Index 2026, EPI 2026, WGI 공개값을 0~100으로 근사한 게임 수치입니다.
- 지도(`atlas/`): Atlas 프로젝트 데이터를 가공했습니다.
  - Natural Earth (public domain)
  - NOAA ETOPO 2022 (public domain, doi:10.25921/fd45-gt74)
  - GHS-POP R2023A, European Commission JRC (CC BY 4.0)
- 지도 글꼴: IM Fell English (SIL OFL 1.1, Google Fonts)

플레이어 지도자는 가상 인물이며, 현직·최근 주요 지도자 이름은 쓸 수 없습니다.
