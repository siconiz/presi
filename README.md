# 세계 지도자 5년 (World Leader: Five Years)

실제 163개국 중 하나를 골라 세계지도 위에서 국정을 운영하는 브라우저 게임입니다.
처음부터 지도자로 시작하거나, 평당원(권위주의 국가는 말단 당 간부)에서 출발해 경선과 선거를 거쳐 권좌에 오를 수 있습니다.

- 사건 카드 결재와 분기별 일정(정책·외교·뒷거래)
- 비리·은폐·폭로 시스템과 퇴임 후 결말(구속, 망명, 끝까지 안 들킴)
- 전쟁: 군사 위협 → 외교 위기(요구 수준 선택·상대 응답·중재) → 개전, 분기별 전선·전쟁 지지도·사상자, 동맹 참전·원조, 강화 협상, 체제별 패전 결과(혼합 체제는 실각 위험), 전쟁 지도 모드, 실제 진행 중인 분쟁(러시아–우크라이나)으로 시작하는 옵션
- 장군과 점령(Victoria 3 방식 참고): 양측 장군은 공격·방어 능력치(1~5)와 특성(과감·신중·병참통·백전노장)을 가지며, 명령(공세·방어)과 전술(정면 돌파·측면 기동·포위 섬멸·종심 방어·소모전·방어 후 역습)에 능력치가 반영됩니다. 전선이 밀린 만큼 국경에 가까운 주부터 점령되어 지도에 빗금으로 표시되고, 점령된 인구 비율만큼 경제와 전쟁 지지도가 깎입니다.
- 전시작전통제권: 전작권이 있으면 플레이어가 전선마다 전술을 직접 고르고(일정 소모 없음), 없으면 AI 장군이 고릅니다. 대한민국은 2026년 10월 기준 실제 상황에 맞춰 전작권이 한미연합사령관(미군)에게 있는 상태로 시작하며, 전환 사건으로 가져올 수 있습니다.
- 국정 점수 + 사익 점수 = 종합 점수, 공유 리더보드
- 가상 SNS 여론 피드와 다국어 번역(Claude 아티팩트의 `sample` 기능 사용). 10대부터 70대까지 연령대별 말투와 익명 커뮤니티 말투가 섞이며, 재난·사고 때는 희생자를 조롱하지 않는 애도·분노 반응만 나옵니다.
- 재난·사고: 지진·태풍·홍수·폭염과 여객선 침몰·인파 밀집·건물 붕괴·화재·폭발이 확률적으로 일어납니다. 자연재해 발생은 국가 태그와 계절, 지진 규모는 구텐베르크-리히터 분포(b≈1)를 따르고, 사망자는 소득·제도·부패 수준으로 달라집니다. 인재는 '안전 제도' 지수(자유도·경제·정치 안정, 비리, 안전 개혁)가 낮을수록 자주 일어납니다. 실제 참사를 재현하지 않고 같은 유형의 가상 사건으로 다룹니다.
- Victoria 스타일 지도: 지형 음영, 주(州) 경계, 곡선 국가명, 도시, 강. 남북한 주와 도시는 한국어 공식 명칭으로 표시하고, 광주·전남은 2026년 7월 출범한 전남광주통합특별시로 합쳐 표시합니다.
- 확대 지도: 30배까지 확대하면 1°당 64픽셀 음영기복 지형, 강, 마을, 산 정상(▲), 공항(✈, 군 공항은 붉은색), 항구(⚓)가 순서대로 나타납니다.
- 전투 부대: 전쟁 중 확대하면 양측 편제(보병·기갑·공격헬기·전투기 비율)에 맞춘 전차·보병 분대·헬기·전투기가 전선에 배치되고, 전진·후퇴와 전술(공세·방어)에 따라 위치가 바뀝니다. 헬기는 회전익이 돌고, 전투기는 전선 위를 선회하며, 전선에는 포연이 오릅니다.
- HOI식 도시 거점: 확대할수록 작은 도시까지 나오고, 도시마다 승점(VP)이 붙습니다. 점령된 도시는 점령국 색으로 바뀌고, 빼앗긴 승점 비율만큼 전쟁 지지도가 깎입니다.

## 파일

| 경로 | 내용 |
| --- | --- |
| `world-leader.html` | 게임 전체(HTML·CSS·JS 한 파일) |
| `atlas/relief.jpg` | 지형 음영 + 수심 (등장방형, 북위 80° ~ 남위 60°) |
| `atlas/pid.png` | 주 ID(R·G)와 국가 ID(B) 래스터, 4050×1575 |
| `atlas/atlas.json` | 국가 색·라벨 경로·인접국, 주 이름·인구·중심점, 도시, 강 |
| `atlas/hr/{x}_{y}.jpg` | 확대용 고해상도 음영기복 타일 16×8장(각 22.5°×17.5°, 1°당 64픽셀) |
| `atlas/places.json` | 마을·공항·항구·산 정상 (Natural Earth 10m) |
| `president-sim.html` | 초기 버전(가상 국가 '한별공화국') |

## 실행

`world-leader.html`은 같은 폴더의 `atlas/` 파일을 `fetch`로 읽으므로, 파일을 직접 여는 대신 로컬 서버로 여세요.

```bash
python -m http.server 8000
```

그다음 브라우저에서 `http://localhost:8000/world-leader.html`을 엽니다.
리더보드 공유, 여론 피드, 번역은 Claude 아티팩트(`db`, `user`, `sample` 기능) 안에서만 동작합니다. 그 밖에서는 브라우저에 저장된 내 기록과 기본 반응 문구로 대체됩니다.
`#demo`, `#democamp`, `#demoend`, `#demowar`(대한민국이 북한과 2분기째 전쟁 중)를 주소 끝에 붙이면 미리 진행된 화면을 볼 수 있습니다.
`#demo…` 해시로 열면 브라우저 콘솔에서 `simHaz("KOR", 20)`(20분기 동안의 재난·사고 수와 사망자 분포)와 `simWar("KOR", "PRK", 2000)` 또는 전술을 고정한 `simWar("KOR", "PRK", 2000, "encircle")`처럼 전쟁 결과 분포(승·패·휴전 수, 평균·중앙값 분기, 3분기 이하·6분기 이상 비율)를 확인할 수 있습니다.

## 데이터 출처

- 국가 출발 수치: IMF WEO, World Bank WDI, Freedom House 2026, Global Peace Index 2026, EPI 2026, WGI 공개값을 0~100으로 근사한 게임 수치입니다.
- 군사력(0~100): SIPRI Military Expenditure 2025와 Global Firepower 2026 순위를 참고한 근사치입니다. GFP는 가중치를 공개하지 않으므로 공식 수치가 아닙니다. 표에 없는 나라는 경제·안보 수치, 인구, 핵보유 여부로 산출합니다.
- 전쟁 계수의 근거: 전쟁 지속 기간(Correlates of War 1823~2003, 중앙값 약 139일), 전쟁의 경제 비용(NBER w34389, Kiel Institute 2024), 결집 효과 연구, Goemans(2000)·Debs & Goemans(APSR)의 체제별 패전 지도자 연구. 설계 메모는 `docs/war-system-prompt.md`.
- 재난·사고 계수의 근거: Kahn(2005, 소득·민주주의·제도가 재난 사망을 줄임), Ambraseys & Bilham(2011, 지진 건물 붕괴 사망의 83%가 부패가 심한 나라), EM-DAT 2024(자연재해 393건, 사망 16,753명), Lloyd's Register Foundation(여객선 사고 사망의 대부분이 아시아·아프리카 국내 항로, 규제 집행 실패), Feliciani 외(2023, 인파 사고 세계 평균 월 1회). 발생 확률과 사망 분포 계수 자체는 게임용 추정치입니다.
- 지도(`atlas/`): Atlas 프로젝트 데이터를 가공했습니다.
  - Natural Earth (public domain)
  - NOAA ETOPO 2022 (public domain, doi:10.25921/fd45-gt74)
  - GHS-POP R2023A, European Commission JRC (CC BY 4.0)
- 확대 지형(`atlas/hr/`, `atlas/relief.jpg`): Mapzen Terrain Tiles(AWS Open Data, Terrarium z7)로 음영기복을 새로 계산했습니다. 원 데이터 출처 표기:
  - United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey
  - Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration
  - ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681, 1559691, and 1542736
  - Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017
  - Austria terrain data © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich
  - Canada terrain data contains information licensed under the Open Government Licence – Canada
  - Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers
  - Mexico terrain data source: INEGI, Continental relief, 2016
  - New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government
  - Norway terrain data © Kartverket
  - United Kingdom terrain data © Environment Agency copyright and/or database right 2015
- 마을·공항·항구·산(`atlas/places.json`): Natural Earth 10m (public domain). 한국어 이름은 Natural Earth의 `name_ko`를 쓰되 확인된 오류(평산·장연·지리산·개성)는 고쳤습니다.
- 지도 글꼴: IM Fell English (SIL OFL 1.1, Google Fonts)

플레이어 지도자는 가상 인물이며, 현직·최근 주요 지도자 이름은 쓸 수 없습니다.
