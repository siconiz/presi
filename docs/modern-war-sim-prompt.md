# 현대전 데이터 기반 전쟁 시뮬레이션 설계 프롬프트

대상 코드: `claude/loving-brahmagupta-tgf0rd` 브랜치의 `world-leader.html` (커밋 `b4b6077`, 장군·전술·점령·전작권까지 구현된 상태).
아래 `---` 사이를 그대로 코딩 AI에게 전달한다.

---

## 역할과 목표

너는 브라우저 국정 시뮬레이션 `world-leader.html`의 전쟁 모듈을 **현대전 실측 자료에 맞게 재설계**하는 게임 시스템 디자이너 겸 개발자다.
지금 모듈은 전선 값 하나(−100~100)와 전력비로 승부를 내는 추상 모델이다. 이걸 2022년 이후 실제 전쟁에서 관찰된 패턴을 재현하는 모델로 바꾼다.
작업은 두 단계다. **1단계 설계안만 먼저 제출하고, 내가 승인하면 2단계 구현**에 들어간다.

## 먼저 읽을 기존 코드 (이름 바꾸지 말고 확장)

- 전쟁 상수: `MIL`, `milOf()`, `REGK`, `GIVE`, `JOIN`, `OUTCOME`, `LOSE_REG`, `WAR_PTS`, `ACTIVE_WARS`, `TAC`(전술 6종), `TRAITS`, `NO_OPCON`, `hasOpcon()`.
- 장군: `genOf()`, `aiPlan()`.
- 전투: `warStep(w, me)`. G에 의존하지 않아 `simWar()`에서도 재사용하는 구조이므로 **이 성질을 유지**한다.
- 점령: `occupy(w)` (국경에서 가까운 주부터, `pF`/`pM` = 점령 인구 비율).
- 흐름: `startWar()`, `endWar()`, `resolveWars()`(`nextQuarter()` 안에서 호출), `warHook()`(사건 선택지의 `war`/`wx`), `peace()`, `setTac()`, `warView()`.
- 공통: `applyFx()`, `applyRel()`, `EVENTS`, `t()`/`STR.ko`/`STR.en`, `genFeed()`, `checkEnd()`, `govPoints()`.
- 한 턴 = 1분기. 플레이어는 분기당 사건 1장 + 행동 2회.

## 현대전 자료 (설계의 근거. 수치는 출처와 함께 다시 검증하고, 검증 못 한 값은 "추정"으로 표시)

1. **두 종류의 전쟁이 공존한다.**
   - 단기 원거리 타격전: 인도·파키스탄(2025년 5월, 약 4일, 미사일·드론·방공 위주), 이스라엘·이란(2025년 6월, 12일), 태국·캄보디아 국경 충돌(2025년 7월, 5일, 사망 수십 명, 피란민 약 27만~30만 명, 말레이시아 중재 휴전). 영토 변화 거의 없이 1분기 안에 끝난다.
   - 장기 소모전: 러시아·우크라이나. 러시아의 2025년 영토 획득은 월평균 약 440km²(ISW 자료 기반 RussiaMatters 분석), 2025년 러시아군 사상자 약 42.5만 명(월 3.5만 명, CSIS 인용 보도). 전선은 거의 움직이지 않고 사상자와 산업력이 승부를 가른다.
2. **방어 우위와 투명한 전장.** 드론·위성 감시 때문에 집결과 돌파가 어렵다. 우크라이나 전선 사상자의 70~80%가 드론 때문이라는 추정이 있으나 주로 우크라이나 측 발표라 검증되지 않았다.
3. **병력비만으로 승부가 나지 않는다.** 흔히 쓰는 "공격 3:1 원칙"은 Dupuy가 역사 자료로 검증했을 때 근거를 찾지 못했다. 수적 우위는 수익이 체감한다. Dupuy의 QJM은 전투력비 `Pa/Pd`와 전투효율(CEV, 질적 요소)을 쓴다.
4. **탄약과 요격미사일 재고가 전쟁 지속력을 정한다.**
   - 러시아 포탄 생산 2025년 약 700만 발(에스토니아 정보청 추정), 2021년 40만 발. 서방(미국+유럽)은 2024년 약 120만 발, EU 목표 연 200만 발.
   - 이스라엘·이란 12일 전쟁: 이란 탄도미사일 574발·드론 1,084기, THAAD 요격미사일 1발 약 1,270만 달러(MDA FY2025), 소모분 보충에 3~8년(분석가 추정). 이스라엘 직접 손실 약 120억 달러(보도).
5. **해상전의 비대칭.** 해군이 거의 없는 우크라이나가 무인수상정으로 흑해함대의 상당 부분(약 1/3이라는 보도)을 격침·퇴출시켰다. 단, 흑해는 해협 통제로 제약이 큰 특수 전장이라 일반화에 주의.
6. **상륙 침공은 대부분 실패하고 비용이 막대하다.** CSIS 2023 대만 워게임(24회): 대부분의 시나리오에서 침공 실패, 미국·일본·대만도 함정 수십 척·항공기 수백 대 손실.
7. **경제 피해.** 전장 국가 산출은 수년간 약 10~30% 감소(Kiel Institute), 115개 분쟁 평균 실질 GDP −13%(NBER 2025), 인접국도 수% 파급.
8. **여론.** 개전 직후 결집 효과는 짧고, 사상자가 누적되면 1년 안팎 뒤부터 처벌로 바뀐다. 혼합 체제 지도자가 패전 시 실각 위험이 가장 크다(Goemans 2000).
9. **전쟁 지속 기간 분포.** CoW 국가 간 전쟁(1823~2003) 중앙값 약 139일, 평균 약 408일, 오른쪽으로 긴 꼬리.

## 1단계: 설계안에 반드시 들어갈 내용

### A. 전쟁 유형(규모) 분리
- `strike`(원거리 타격전), `border`(국경 충돌), `full`(전면전), `amph`(도서·해협 상륙전) 4종을 둔다.
- 유형은 개전 시 지리(`NEIGH`, `island` 태그, 해협 여부), 양측 능력, 전쟁 목표로 정해지고, 전쟁 중 **확전 사다리**로 한 단계씩 오를 수 있다(플레이어 선택 또는 AI). 단계마다 비용·국제 반응·핵 위험이 커진다.
- `strike`/`border`는 분기 내부를 며칠 단위 소단계로 돌려 대부분 1분기 안에 끝나게 한다.

### B. 국가 군사 능력 (MIL 하나를 영역별로 분해)
- `land`(지상), `air`(항공·미사일 타격), `ad`(방공), `sea`(해군), `uas`(드론·전자전), `ind`(방산 생산력), `stock`(초기 탄약·요격미사일 재고) 7개 값.
- 상위 30개국 정도만 근사치를 손으로 넣고, 나머지는 기존 `milOf()`·`ec`·인구·태그로 산출하는 규칙을 제시한다. 근거가 된 자료(SIPRI, Global Firepower, IISS Military Balance 등)를 값마다 밝힌다.

### C. 분기 해결 모델
- 전투력비는 `CP = 영역 능력 × CEV(장군·전술·사기·보급) × 재고계수`, 결과는 **체감 함수**(예: 로그 비율이나 시그모이드)로 바꿔 수적 우위가 선형으로 먹히지 않게 한다.
- 방어 우위 계수: 전선이 오래 고착될수록 방어 측 진지 보너스 누적(참호·지뢰·드론 감시).
- 소모: 탄약·요격미사일 재고가 분기마다 소비되고 `ind`와 동맹 지원으로 보충된다. 재고가 바닥나면 해당 영역 전투력 급감. 요격미사일이 고갈되면 상대의 타격이 민간·경제 피해로 바로 이어진다.
- 적응 주기: 한쪽이 새 전술·드론 우위를 쓰면 몇 분기에 걸쳐 상대가 적응해 효과가 감쇠한다.
- 영토: 전면전의 전선 이동 상한을 실측치 수준으로 둔다(소모전 국면에선 분기당 국토의 1% 미만). 돌파는 드물게, 상대 사기·재고 붕괴 같은 조건에서만.
- 해상: `sea` 대 상대 `uas`·`air`로 해상 통제 계산, 상륙전(`amph`)은 해상·항공 우세가 없으면 상륙 실패 확률이 높게.
- 사상자·피란민·경제 손실(`ec`, `fis`)·인접국 파급을 계산식으로 제시한다.

### D. 기존 요소와의 통합
- 장군 능력치·특성, 6가지 전술, 공세/방어 명령, 전작권(`hasOpcon`, 한국은 전작권 없이 시작)은 유지한다. 각 전술이 위 영역 중 어디에 효과를 주는지 표로 다시 정의한다(예: 소모전 → `uas`·`stock` 소비 효율, 종심 방어 → 방어 우위 계수).
- 국내 요소: 동원령(인력 증가 ↔ `ec`·`ap` 감소), 전시 경제 전환(`ind` 증가 ↔ `we` 감소), 제재, 무기 원조(동맹 관계에 따라 `stock` 보충).
- 종전: 협상 수락 확률을 전선·재고·지지도·사상자 추세로 계산. 휴전 후 재발 가능성(태국·캄보디아 사례처럼 휴전 위반) 포함.
- 핵: 핵보유국 상대 전선 상한은 유지. 확전 사다리 최상단은 "핵 위협 사건"까지만 두고 핵 사용 선택지는 만들지 않는다.

### E. 보정(캘리브레이션) 계획
- `simWar()`를 확장해 아래 기준 시나리오마다 수천 회 몬테카를로를 돌리고, 목표 범위에 들어오는지 표로 보고한다.

| 시나리오 | 유형 | 목표 |
|---|---|---|
| IND-PAK | strike | 90% 이상 1분기 안에 종료, 영토 변화 거의 없음 |
| ISR-IRN | strike | 1분기 안에 종료, 양측 요격 재고 크게 감소 |
| THA-KHM | border | 1분기 안에 휴전(중재), 일정 확률로 재발 |
| RUS-UKR | full | 장기화(4분기 이상이 다수), 분기당 영토 변화 매우 작음, 사상자 큼 |
| CHN-TWN | amph | 동맹 개입 시 침공 실패가 다수, 양측 막대한 손실 |
| KOR-PRK | full | 결과 분포와 전작권 유무에 따른 차이 |

- 전체 분포가 CoW 지속 기간(짧은 전쟁이 다수, 긴 꼬리)과 비슷해야 한다.
- 각 계수에 대해 민감도 분석(±20% 변경 시 결과 변화)을 짧게 보고한다.

### F. UI
- 전쟁 카드에 유형, 확전 단계, 영역별 우열(막대 5개), 탄약·요격 재고, 적응 상태를 추가. 정보가 많으니 접기/펼치기.
- 지도는 기존 점령 빗금과 교전 국경 강조를 유지하고, `strike` 유형은 피격 지점만 표시.

### G. 설계안 형식
1. 기존 모델의 한계 진단(코드 근거 포함, 5줄 이내 항목들)
2. 새 상태 구조(필드 목록)
3. 수식과 상수표
4. 기준 시나리오별 예상 결과
5. 구현 단계 계획(작은 커밋 단위)과 위험 요소
6. 자료 출처 목록(URL), 검증 못 한 값 표시

## 2단계: 구현 규칙 (승인 후)

- 외부 라이브러리 없이 바닐라 JS. 코드는 짧게, 비슷한 분기는 표로 묶는다.
- `warStep`은 계속 G에 의존하지 않게 해서 `simWar`와 같은 함수를 쓴다.
- 사용자에게 보이는 문구는 `STR.ko`·`STR.en`·`EVENTS` 안에만 쓴다. 로직 코드에 한글 리터럴 금지. 키는 영어.
- 실존 현직 지도자 이름 금지(`isBlocked` 규칙 유지). 실제 진행 중인 분쟁은 중립적으로 서술.
- 핵 사용, 민간인 표적 공격, 대량 학살을 플레이어 선택지로 만들지 않는다. 민간 피해는 결과로만 보여준다.
- 기존 데모(`#demo`, `#democamp`, `#demoend`, `#demowar`)와 전쟁 흐름이 깨지지 않는지 헤드리스 브라우저로 확인하고, 콘솔 오류 0건을 보고한다.
- 보정 결과표를 커밋 메시지나 README에 남긴다.

---

## 조사 출처

- 러시아 영토 획득(ISW 기반): https://www.russiamatters.org/node/40685
- 러시아 사상자(CSIS 인용): https://odessa-journal.com/csis-russian-forces-have-suffered-nearly-12-million-casualties-more-losses-than-any-major-power-in-any-war-since-world-war-ii
- 드론 사상자 비중: https://www.army-technology.com/news/drones-now-account-for-80-of-casualties-in-ukraine-russia-war/ , https://gigafact.org/?p=16251 (검증 한계)
- 3:1 원칙·QJM: https://dupuyinstitute.org/tag/3-1-rule/ , https://orion.journals.ac.za/pub/article/download/455/365
- 포탄 생산: https://euromaidanpress.com/2026/02/11/russian-shell-production-reaches-7-million-annually-17-times-pre-invasion-levels-estonian-intelligence/ , https://www.rferl.org/a/russia-nato-weapons-production-us-germany/33482927.html
- 이스라엘·이란 요격 소모: https://jinsa.org/findings-from-the-12-day-war/ , https://www.armscontrolwonk.com/archive/1220527/exhaustion-and-inflection-estimating-interceptor-expenditures-in-the-israel-iran-conflict/ , https://www.newarab.com/news/israel-faces-12-billion-losses-after-12-day-war-iran
- 인도·파키스탄 2025: https://breakingdefense.com/2025/05/what-air-defense-lessons-can-be-learned-from-the-india-pakistan-conflict/ , https://www.walterladwig.com/Articles/Ladwig,%20Battlefield%20Lessons%20of%20Operation%20Sindoor%20(final%20revised).pdf
- 태국·캄보디아 2025: https://www.aljazeera.com/video/newsfeed/2025/7/28/thailand-cambodia-ceasefire-ends-days-of-deadly-border-clashes , https://gulfnews.com/world/asia/thailand-cambodia-clash-displaces-170000-is-peace-still-possible-1.500213312
- 흑해 해상 드론: https://www.defenseone.com/ideas/2024/07/how-navy-less-ukrainians-defeated-russias-black-sea-fleet/398185/ , https://engelsbergideas.com/notebook/learning-the-right-lessons-from-ukraines-naval-war/
- CSIS 대만 워게임: https://www.csis.org/analysis/first-battle-next-war-wargaming-chinese-invasion-taiwan
- 경제 비용: https://www.nber.org/papers/w34389 , https://mutschler.eu/files/papers/Price_of_War_2024_Kiel_Policy_Brief.pdf
- 전쟁 지속 기간: https://freerangestats.info/blog/2026/05/13/war-durations
- 패전과 지도자: https://ideas.repec.org/a/sae/jocore/v44y2000i5p555-579.html
