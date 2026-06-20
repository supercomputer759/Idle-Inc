// =====================
// 기본 상태
// =====================
let money = 100;
let totalMoney = 100; // 총 누적 수익 추가
let prestigePoints = 0; // 환생 포인트 추가
let prestigeUpgrades = {
    core: 0,
    dev_u: 0, dev_c: 0, dev_m: 0, dev_s: 0, dev_t: 0,
    mkt_u: 0, mkt_c: 0, mkt_m: 0, mkt_s: 0,
    des_u: 0, des_c: 0, des_t: 0, des_s: 0,
    mgmt_u: 0, mgmt_p: 0, mgmt_h: 0,
    pr_u: 0, pr_c: 0, pr_s: 0,
    dip_u: 0, dip_g: 0, dip_m: 0, dip_o: 0,
    evt_u: 0, evt_c: 0, evt_d: 0, evt_m: 0, evt_chain: 0,
    cmb_u: 0, cmb_k: 0, cmb_b: 0, cmb_ai: 0, cmb_j: 0, cmb_ex: 0,
    fever_u: 0, dip_ex: 0, auto_m: 0, mut_quant: 0,
    auto_u: 0, auto_spd: 0, auto_evt: 0, auto_inf: 0,
    mut_u: 0, mut_spd: 0, mut_evt: 0, mut_idle: 0,
    infra_u: 0, infra_c: 0, infra_s: 0, infra_b: 0,
    corp_u: 0, corp_m: 0, corp_l: 0, corp_v: 0,
    space_u: 0, space_m: 0, space_mars: 0, space_deep: 0,
    rnd_u: 0, rnd_a: 0, rnd_p: 0, rnd_e: 0,
    // 추가 신규 스킬들
    ai_n: 0, ai_o: 0, ai_s: 0, ai_q: 0, ai_x: 0,
    gl_t: 0, gl_h: 0, gl_c: 0, gl_m: 0, gl_w: 0,
    sc_n: 0, sc_f: 0, sc_m: 0, sc_v: 0, sc_t: 0,
    cos_s: 0, cos_d: 0, cos_g: 0, cos_a: 0, cos_z: 0,
    fin_i: 0, fin_t: 0, fin_d: 0, fin_m: 0, fin_e: 0,
    rea_p: 0, rea_m: 0, rea_v: 0, rea_q: 0, rea_o: 0,
    companyType: 'startup'
};

let selectedNodeId = null;
// [드래그 상태 변수]
let isDraggingTree = false;
let panX = 0;
let panY = 0;
let treeScale = 1;
let startMouseX = 0;
let startMouseY = 0;
let activePointerId = null;
let treeMovedDuringPointer = false;
let suppressTreeClickUntil = 0;
let pointerDownNode = null;
let audioSettings = {
    fxMuted: localStorage.getItem('idleInc_fxMuted') === 'true',
    bgmMuted: localStorage.getItem('idleInc_bgmMuted') === 'true'
};

let uiState = {
    contractsCollapsed: localStorage.getItem('idleInc_contractsCollapsed') === 'true',
    achievementsCollapsed: localStorage.getItem('idleInc_achievementsCollapsed') === 'true'
};

// [좌표 기반 스킬 트리 데이터]
const SKILL_DATA = {
    core: { x: 0, y: 0, parent: null, cost: 0, name: "🏢 명성 상점 해금", desc: "전문 경영인으로서의 첫걸음입니다.", effect: "명성 시스템 및 전략 지도를 활성화합니다.", maxLevel: 1 },
    
    // 개발팀
    dev_u: { x: -150, y: -80, parent: 'core', cost: 1, name: "💻 개발 인프라", desc: "최신형 워크스테이션을 도입합니다.", effect: "개발팀 관련 명성 연구가 가능해집니다.", maxLevel: 1 },
    dev_c: { x: -250, y: -150, parent: 'dev_u', cost: 2, name: "📉 모듈형 코딩", desc: "코드 재사용성을 높여 비용을 아낍니다.", effect: "개발팀 업그레이드 비용이 감소합니다.", maxLevel: 10 },
    dev_m: { x: -150, y: -150, parent: 'dev_u', cost: 3, name: "💰 수익 최적화", desc: "데이터 분석을 통해 수익 모델을 개선합니다.", effect: "개발팀 기본 수익이 증가합니다.", maxLevel: 20 },
    dev_s: { x: -50, y: -150, parent: 'dev_u', cost: 5, name: "🚀 시니어 개발자", desc: "경력직을 미리 섭외하여 시작합니다.", effect: "리브랜딩 시 개발팀이 레벨 2로 시작합니다.", maxLevel: 1 },
    dev_t: { x: -150, y: -220, parent: 'dev_u', cost: 10, name: "🔥 병렬 처리", desc: "수익 계산을 동시에 여러 번 수행합니다.", effect: "틱마다 확률적으로 수익이 5배 증가(크리티컬)합니다.", maxLevel: 10, type: 'transform' },
    
    // 마케팅팀
    mkt_u: { x: 150, y: -80, parent: 'core', cost: 1, name: "📢 타겟 광고", desc: "고객 맞춤형 광고 시스템을 구축합니다.", effect: "마케팅팀 관련 명성 연구가 가능해집니다.", maxLevel: 1 },
    mkt_c: { x: 50, y: -150, parent: 'mkt_u', cost: 2, name: "📉 광고 매체 최적화", desc: "가성비 좋은 매체를 선별하여 광고합니다.", effect: "마케팅팀 업그레이드 비용이 감소합니다.", maxLevel: 10 },
    mkt_m: { x: 150, y: -150, parent: 'mkt_u', cost: 3, name: "💰 바이럴 마케팅", desc: "폭발적인 입소문 전략을 사용합니다.", effect: "마케팅 수익 배수가 지수적으로 증가합니다.", maxLevel: 5 },
    mkt_s: { x: 250, y: -150, parent: 'mkt_u', cost: 5, name: "🚀 스타 마케터", desc: "유명 인플루언서를 팀장으로 고용합니다.", effect: "리브랜딩 시 마케팅팀이 레벨 2로 시작합니다.", maxLevel: 1 },
    
    // 설계팀
    des_u: { x: -150, y: 80, parent: 'core', cost: 1, name: "📐 디자인 시스템", desc: "회사 전반의 설계 표준을 정의합니다.", effect: "설계팀 관련 명성 연구가 가능해집니다.", maxLevel: 1 },
    des_c: { x: -250, y: 150, parent: 'des_u', cost: 2, name: "📉 자재 공급망", desc: "원자재 공급을 직거래로 전환합니다.", effect: "설계팀 업그레이드 비용이 감소합니다.", maxLevel: 10 },
    des_t: { x: -150, y: 150, parent: 'des_u', cost: 3, name: "⚡ 린 프로세스", desc: "불필요한 공정을 과감히 제거합니다.", effect: "설계팀 레벨에 따른 작업 속도 증가폭이 추가됩니다.", maxLevel: 10 },
    des_s: { x: -50, y: 150, parent: 'des_u', cost: 5, name: "🚀 수석 디자이너", desc: "거장의 감각으로 초기 설계를 시작합니다.", effect: "리브랜딩 시 설계팀이 레벨 2로 시작합니다.", maxLevel: 1 },
    
    // 관리직
    mgmt_u: { x: 0, y: 100, parent: 'core', cost: 2, name: "🤖 워크플로우 자동화", desc: "반복적인 결제 프로세스를 자동화합니다.", effect: "관리직 AI 기능을 해금합니다.", maxLevel: 1 },
    mgmt_p: { x: -60, y: 240, parent: 'mgmt_u', cost: 5, name: "💳 서버 용량 증설", desc: "AI가 더 많은 일을 처리하도록 합니다.", effect: "관리직의 한 틱당 최대 구매 횟수가 증가합니다.", maxLevel: 10 },
    mgmt_h: { x: 60, y: 190, parent: 'mgmt_u', cost: 10, name: "👑 재귀적 고용", desc: "AI가 자신을 스스로 업그레이드합니다.", effect: "관리직 AI가 관리직 자체를 업그레이드할 수 있게 됩니다.", maxLevel: 1 },
    
    // 홍보팀
    pr_u: { x: 150, y: 80, parent: 'core', cost: 1, name: "📣 브랜드 매니지먼트", desc: "회사의 긍정적인 이미지를 구축합니다.", effect: "홍보팀 관련 명성 연구가 가능해집니다.", maxLevel: 1 },
    pr_c: { x: 250, y: 80, parent: 'pr_u', cost: 2, name: "📉 언론사 제휴", desc: "보도자료 배포 비용을 절감합니다.", effect: "홍보팀 업그레이드 비용이 감소합니다.", maxLevel: 10 },
    pr_s: { x: 350, y: 80, parent: 'pr_c', cost: 5, name: "📺 황금시간대 광고", desc: "가장 영향력 있는 시간에 광고를 노출합니다.", effect: "홍보팀의 마케팅 시너지 효과가 강화됩니다.", maxLevel: 5 },
    
    // 외교팀
    dip_u: { x: 350, y: 160, parent: 'pr_s', cost: 10, name: "🌍 글로벌 오피스", desc: "해외 지사를 설립하여 외교를 시작합니다.", effect: "외교 시스템(국가별 버프)을 해금합니다.", maxLevel: 1 },
    dip_g: { x: 250, y: 230, parent: 'dip_u', cost: 15, name: "🌐 다국적 가치", desc: "회사의 글로벌 가치를 인정받습니다.", effect: "리브랜딩 시 획득하는 명성 포인트가 증가합니다.", maxLevel: 10 },
    dip_m: { x: 350, y: 230, parent: 'dip_u', cost: 15, name: "✈️ 무역 협정", desc: "여러 국가와 동시에 협력합니다.", effect: "여러 이벤트 효과가 동시에 중첩되어 발생할 수 있습니다.", maxLevel: 1 },
    dip_o: { x: 450, y: 230, parent: 'dip_u', cost: 20, name: "🏢 해외 R&D 센터", desc: "전 세계의 인재를 모아 개발합니다.", effect: "해외 국가 버프가 있을 때 개발팀 수익이 추가로 증가합니다.", maxLevel: 5 },
    dip_ex: { x: 550, y: 300, parent: 'dip_o', cost: 30, name: "🤝 문화 교류", desc: "현지 문화를 깊게 이해하여 협력 관계를 공고히 합니다.", effect: "외교 제휴 지속 시간이 증가합니다.", maxLevel: 10 },
    
    //////// 플레이 스타일 확장 트리 \\\\\\\\
    // 이벤트
    evt_u: { x: 0, y: -300, parent: 'core', cost: 3, name: "🎲 이벤트 엔진", desc: "예측 불가능한 기회를 만듭니다.", effect: "랜덤 이벤트 시스템을 강화합니다.", maxLevel: 1 },
    evt_c: { x: -80, y: -370, parent: 'evt_u', cost: 5, name: "⚡ 이벤트 가속", desc: "기회는 더 자주 옵니다.", effect: "이벤트 발생 확률이 증가합니다.", maxLevel: 10 },
    evt_d: { x: 0, y: -370, parent: 'evt_u', cost: 5, name: "⏳ 이벤트 연장", desc: "기회를 더 오래 붙잡습니다.", effect: "이벤트 지속 시간이 증가합니다.", maxLevel: 10 },
    evt_m: { x: 80, y: -370, parent: 'evt_u', cost: 8, name: "💥 대박 확률", desc: "가끔은 말도 안되는 일이 일어납니다.", effect: "이벤트 수익 배수가 크게 증가합니다.", maxLevel: 5 },
    evt_chain: { x: 0, y: -440, parent: 'evt_u', cost: 15, name: "🔗 연쇄 반응", desc: "하나의 성공이 또 다른 성공을 부릅니다.", effect: "이벤트 종료 시 확률적으로 새로운 이벤트가 즉시 발생합니다.", maxLevel: 1, type: 'transform' },
    
    // 콤보
    cmb_u: { x: -350, y: 0, parent: 'core', cost: 3, name: "🔥 콤보 시스템", desc: "연속 행동으로 보너스를 얻습니다.", effect: "콤보 시스템을 강화합니다.", maxLevel: 1 },
    cmb_k: { x: -430, y: -60, parent: 'cmb_u', cost: 5, name: "⏱️ 집중 유지", desc: "집중력이 쉽게 끊기지 않습니다.", effect: "콤보 유지 시간이 증가합니다.", maxLevel: 10 },
    cmb_b: { x: -350, y: -60, parent: 'cmb_u', cost: 5, name: "💰 누적 보너스", desc: "쌓일수록 강해집니다.", effect: "콤보당 수익 증가량이 상승합니다.", maxLevel: 10 },
    cmb_ai: { x: -270, y: -60, parent: 'cmb_u', cost: 8, name: "🤖 자동 유지", desc: "AI가 흐름을 이어갑니다.", effect: "관리직이 콤보를 더 효과적으로 유지합니다.", maxLevel: 5 },
    cmb_j: { x: -350, y: -120, parent: 'cmb_u', cost: 15, name: "🎰 잭팟 강화", desc: "결정적인 순간을 더 크게 만듭니다.", effect: "콤보 잭팟 보상이 크게 증가합니다.", maxLevel: 5 },
    cmb_ex: { x: -350, y: -180, parent: 'cmb_u', cost: 20, name: "💥 콤보 폭발", desc: "끝이 곧 시작입니다.", effect: "콤보 종료 시 누적 보너스 일부를 즉시 지급합니다.", maxLevel: 1, type: 'transform' },
    fever_u: { x: -450, y: -250, parent: 'cmb_ex', cost: 30, name: "⚡ 오버드라이브 진화", desc: "한계를 넘어선 시스템이 더 강력한 출력을 냅니다.", effect: "피버 모드(오버드라이브) 수익 배율이 증가합니다.", maxLevel: 5, type: 'transform' },
    
    // 자동화
    auto_u: { x: 0, y: 300, parent: 'mgmt_u', cost: 5, name: "🧠 자율 운영", desc: "AI가 독립적으로 판단합니다.", effect: "자동화 효율이 크게 증가합니다.", maxLevel: 1 },
    auto_spd: { x: -80, y: 370, parent: 'auto_u', cost: 10, name: "⚡ 고속 처리", desc: "AI 반응 속도가 향상됩니다.", effect: "AI 업그레이드 속도가 증가합니다.", maxLevel: 10 },
    auto_evt: { x: 0, y: 370, parent: 'auto_u', cost: 15, name: "🎲 이벤트 대응", desc: "AI가 기회를 놓치지 않습니다.", effect: "AI가 이벤트에도 반응합니다.", maxLevel: 1 },
    auto_inf: { x: 80, y: 370, parent: 'auto_u', cost: 25, name: "♾️ 무한 확장", desc: "AI는 멈추지 않습니다.", effect: "AI가 모든 업그레이드를 자동으로 관리합니다.", maxLevel: 1, type: 'transform' },
    auto_m: { x: 180, y: 440, parent: 'auto_inf', cost: 50, name: "🧬 AI 싱귤래리티", desc: "AI가 인간의 지능을 초월하여 비용을 최적화합니다.", effect: "관리직 고용 및 업그레이드 비용이 감소합니다.", maxLevel: 1, type: 'transform' },
    
    // 변형
    mut_u: { x: 0, y: -520, parent: 'evt_chain', cost: 20, name: "⚠️ 시스템 재설계", desc: "기본 규칙을 다시 정의합니다.", effect: "게임 시스템 변형이 가능합니다.", maxLevel: 1 },
    mut_spd: { x: -80, y: -590, parent: 'mut_u', cost: 25, name: "⏩ 시간 압축", desc: "시간 흐름이 빨라집니다.", effect: "틱 속도가 2배가 되지만 기본 수익이 감소합니다.", maxLevel: 1, type: 'transform' },
    mut_evt: { x: 0, y: -590, parent: 'mut_u', cost: 25, name: "🎯 이벤트 집중", desc: "모든 것을 기회에 걸어봅니다.", effect: "기본 수익 제거, 이벤트 수익 극대화", maxLevel: 1, type: 'transform' },
    mut_idle: { x: 80, y: -590, parent: 'mut_u', cost: 25, name: "😴 완전 방치", desc: "모든 것을 자동에 맡깁니다.", effect: "클릭 효율 감소, AI 효율 극대화", maxLevel: 1, type: 'transform' },
    mut_quant: { x: 0, y: -700, parent: 'mut_u', cost: 100, name: "🌌 양자 연산", desc: "확률의 파동을 제어하여 수익을 창출합니다.", effect: "기본 수익이 압도적으로 증가하지만, 속도가 소폭 감소합니다.", maxLevel: 1, type: 'transform' },

    // 신규: 인프라 분기 (Infrastructure)
    infra_u: { x: -450, y: 350, parent: 'core', cost: 15, name: "🏗️ 인프라 구축", desc: "회사의 물리적 자산을 확장합니다.", effect: "인프라 관련 연구가 해금됩니다.", maxLevel: 1 },
    infra_c: { x: -550, y: 450, parent: 'infra_u', cost: 25, name: "☁️ 클라우드 클러스터", desc: "전산망을 가상화하여 효율을 높입니다.", effect: "전략팀 비용 절감 효과가 강화됩니다.", maxLevel: 10 },
    infra_s: { x: -450, y: 450, parent: 'infra_u', cost: 30, name: "🤖 스마트 팩토리", desc: "모든 생산 공정을 자동화합니다.", effect: "설계팀의 속도 보너스가 추가 증가합니다.", maxLevel: 10 },
    infra_b: { x: -350, y: 450, parent: 'infra_u', cost: 50, name: "🏢 랜드마크 본사", desc: "상징적인 건물을 건설하여 신뢰를 얻습니다.", effect: "명성 획득량이 영구히 증가합니다.", maxLevel: 5 },

    // 신규: 기업 확장 분기 (Corporate Expansion)
    corp_u: { x: 450, y: 350, parent: 'core', cost: 15, name: "🤝 기업 인수합병", desc: "경쟁사들을 흡수하여 덩치를 키웁니다.", effect: "기업 확장 연구가 해금됩니다.", maxLevel: 1 },
    corp_m: { x: 350, y: 450, parent: 'corp_u', cost: 25, name: "📉 수직 계열화", desc: "원가 구조를 완전히 장악합니다.", effect: "모든 부서의 업그레이드 비용이 추가 감소합니다.", maxLevel: 10 },
    corp_l: { x: 450, y: 450, parent: 'corp_u', cost: 35, name: "⚖️ 법무팀 강화", desc: "규제를 우회하고 유리한 계약을 체결합니다.", effect: "외교 제휴 비용이 대폭 감소합니다.", maxLevel: 10 },
    corp_v: { x: 550, y: 450, parent: 'corp_u', cost: 50, name: "💰 벤처 캐피탈", desc: "유망 스타트업에 투자하여 배당을 얻습니다.", effect: "누적 수익에 비례하여 기본 수익이 추가됩니다.", maxLevel: 5 },

    // 신규: 연구 개발 분기 (R&D)
    rnd_u: { x: -550, y: 100, parent: 'dev_u', cost: 20, name: "🧪 차세대 R&D", desc: "미래 먹거리를 위한 연구를 시작합니다.", effect: "R&D 업그레이드가 해금됩니다.", maxLevel: 1 },
    rnd_a: { x: -650, y: 50, parent: 'rnd_u', cost: 40, name: "🧠 인공지능 연구", desc: "더 진보된 알고리즘을 개발합니다.", effect: "관리직 AI의 처리량이 증가합니다.", maxLevel: 10 },
    rnd_p: { x: -650, y: 150, parent: 'rnd_u', cost: 40, name: "🔋 신소재 개발", desc: "하드웨어의 한계를 돌파합니다.", effect: "개발팀 기본 수익 배율이 증가합니다.", maxLevel: 10 },
    rnd_e: { x: -750, y: 100, parent: 'rnd_u', cost: 100, name: "💡 특허 독점", desc: "핵심 기술을 독점하여 로열티를 받습니다.", effect: "이벤트 발생 시 추가 고정 수익을 얻습니다.", maxLevel: 1, type: 'transform' },

    // 신규: 엔드게임 우주 분기 (Space Age)
    space_u: { x: 0, y: -850, parent: 'mut_quant', cost: 150, name: "🚀 우주 개척", desc: "지구를 넘어 우주로 진출합니다.", effect: "우주 산업이 해금됩니다.", maxLevel: 1, type: 'transform' },
    space_m: { x: -180, y: -950, parent: 'space_u', cost: 250, name: "🌙 달 기지 건설", desc: "지구 궤도 자원을 채굴합니다.", effect: "모든 수익 배수가 5배 증가합니다.", maxLevel: 5 },
    space_mars: { x: 180, y: -950, parent: 'space_u', cost: 500, name: "🔴 화성 테라포밍", desc: "새로운 시장을 창조합니다.", effect: "수익 단위가 한 단계 도약합니다.", maxLevel: 3, type: 'transform' },
    space_deep: { x: 0, y: -1100, parent: 'space_u', cost: 1000, name: "🌌 성간 여행", desc: "은하계 전체를 우리 기업의 무대로 만듭니다.", effect: "게임의 모든 한계치가 해제됩니다.", maxLevel: 1, type: 'transform' },

    // AI Transcendence (From auto_m)
    ai_n: { x: 280, y: 500, parent: 'auto_m', cost: 150, name: "🧠 신경망 가속", desc: "AI의 연산 속도를 물리적으로 개선합니다.", effect: "AI 처리량이 레벨당 5회 추가됩니다.", maxLevel: 10 },
    ai_o: { x: 380, y: 550, parent: 'ai_n', cost: 250, name: "📉 자율 최적화", desc: "AI가 스스로 비용 구조를 재설계합니다.", effect: "모든 업그레이드 비용이 추가 감소합니다.", maxLevel: 10 },
    ai_s: { x: 280, y: 600, parent: 'ai_n', cost: 400, name: "🛡️ 자가 수복", desc: "시스템 버그를 실시간으로 탐지합니다.", effect: "AI 버그 발생 확률이 영구히 제거됩니다.", maxLevel: 1, type: 'transform' },
    ai_q: { x: 180, y: 650, parent: 'ai_s', cost: 800, name: "🔮 예측 알고리즘", desc: "미래의 시장 흐름을 시뮬레이션합니다.", effect: "이벤트 발생 시 수익 배율이 추가 증가합니다.", maxLevel: 5 },
    ai_x: { x: 280, y: 750, parent: 'ai_q', cost: 2000, name: "🤖 오메가 지능", desc: "인간의 이해를 넘어선 초지능입니다.", effect: "모든 관리직 관련 수치가 100% 증가합니다.", maxLevel: 1, type: 'transform' },

    // Global Logistics (From corp_v)
    gl_t: { x: 650, y: 550, parent: 'corp_v', cost: 200, name: "🚢 글로벌 물류망", desc: "전 세계를 잇는 거대 운송망을 구축합니다.", effect: "국가 제휴 효과가 강화됩니다.", maxLevel: 10 },
    gl_h: { x: 750, y: 500, parent: 'gl_t', cost: 350, name: "🏦 조세 피난처", desc: "세법의 맹점을 이용해 자금을 보호합니다.", effect: "명성 획득량이 증가합니다.", maxLevel: 5 },
    gl_c: { x: 750, y: 650, parent: 'gl_t', cost: 500, name: "💳 단일 통화권", desc: "우리 기업만의 통화를 전 세계에 보급합니다.", effect: "기본 수익이 지수적으로 증가합니다.", maxLevel: 10 },
    gl_m: { x: 850, y: 600, parent: 'gl_c', cost: 1000, name: "🗼 문화 패권", desc: "기업의 가치관을 전 인류에 주입합니다.", effect: "홍보팀 시너지 효과가 강화됩니다.", maxLevel: 1, type: 'transform' },
    gl_w: { x: 950, y: 700, parent: 'gl_m', cost: 5000, name: "🌐 세계 단일 정부", desc: "더 이상 국경은 의미가 없습니다.", effect: "모든 국가가 영구히 활성화됩니다.", maxLevel: 1, type: 'transform' },

    // Advanced Science (From rnd_e)
    sc_n: { x: -850, y: 50, parent: 'rnd_e', cost: 150, name: "🔬 나노 로봇", desc: "분자 단위에서 조립을 수행합니다.", effect: "기본 수익이 증가합니다.", maxLevel: 10 },
    sc_f: { x: -950, y: 0, parent: 'sc_n', cost: 300, name: "☢️ 상온 핵융합", desc: "무한에 가까운 에너지를 확보합니다.", effect: "설계팀 속도 보너스가 극대화됩니다.", maxLevel: 10 },
    sc_m: { x: -950, y: 150, parent: 'sc_n', cost: 500, name: "🧪 물질 합성", desc: "희귀 자원을 직접 연성합니다.", effect: "모든 비용이 추가 감소합니다.", maxLevel: 5 },
    sc_v: { x: -1050, y: 100, parent: 'sc_m', cost: 1200, name: "🌀 공허 추출", desc: "무(無)에서 유(有)를 창조합니다.", effect: "수익 계산 시 콤보 배수가 강화됩니다.", maxLevel: 1, type: 'transform' },
    sc_t: { x: -1150, y: 200, parent: 'sc_v', cost: 3000, name: "⌛ 시간 가변기", desc: "작업 시간을 마음대로 조절합니다.", effect: "게임 속도가 영구히 3배 빨라집니다.", maxLevel: 1, type: 'transform' },

    // Cosmic Ascension (From space_deep)
    cos_s: { x: 0, y: -1250, parent: 'space_deep', cost: 2000, name: "☀️ 다이슨 스피어", desc: "항성의 모든 에너지를 포집합니다.", effect: "모든 수익 배율이 압도적으로 증가합니다.", maxLevel: 5 },
    cos_d: { x: -150, y: -1350, parent: 'cos_s', cost: 5000, name: "🌌 차원 도약", desc: "다른 차원의 자원을 약탈합니다.", effect: "명성 획득량이 복리로 증가합니다.", maxLevel: 3, type: 'transform' },
    cos_g: { x: 150, y: -1350, parent: 'cos_s', cost: 10000, name: "🪐 은하계 의회", desc: "은하계 전체의 경제권을 장악합니다.", effect: "수익 단위가 크게 도약합니다.", maxLevel: 1, type: 'transform' },
    cos_a: { x: 0, y: -1500, parent: 'cos_g', cost: 50000, name: "✨ 우주의 중심", desc: "우리 기업이 곧 우주의 질서입니다.", effect: "모든 업그레이드 효율이 2배가 됩니다.", maxLevel: 1, type: 'transform' },
    cos_z: { x: 0, y: -1700, parent: 'cos_a', cost: 100000, name: "♾️ 불멸의 기업", desc: "시간과 공간을 초월한 존재가 됩니다.", effect: "모든 수치 제한이 해제됩니다.", maxLevel: 1, type: 'transform' },

    // 
    fin_i: { x: -450, y: 550, parent: 'infra_b', cost: 100, name: "🏦 투자 은행", desc: "자본을 굴려 자본을 만듭니다.", effect: "보유 자산에 비례한 추가 수익을 얻습니다.", maxLevel: 10 },
    fin_t: { x: -550, y: 650, parent: 'fin_i', cost: 250, name: "⚡ 고주파 매매", desc: "초단위로 시장 차익을 노립니다.", effect: "틱당 추가 고정 수익이 발생합니다.", maxLevel: 10 },
    fin_d: { x: -350, y: 650, parent: 'fin_i', cost: 400, name: "📈 파생 상품", desc: "복잡한 금융 상품으로 리스크를 수익화합니다.", effect: "이벤트 수익이 복리로 계산됩니다.", maxLevel: 5 },
    fin_m: { x: -450, y: 750, parent: 'fin_d', cost: 1000, name: "💰 통화 정책 제어", desc: "시장의 화폐 가치를 조절합니다.", effect: "모든 비용이 대폭 감소합니다.", maxLevel: 1, type: 'transform' },
    fin_e: { x: -450, y: 900, parent: 'fin_m', cost: 5000, name: "💹 경제 싱귤래리티", desc: "돈이 돈을 낳는 완벽한 구조입니다.", effect: "수익이 지수적으로 폭증합니다.", maxLevel: 1, type: 'transform' },

    // 현실 왜곡
    rea_p: { x: -150, y: -800, parent: 'mut_quant', cost: 500, name: "🌈 확률 조작", desc: "불가능한 기적을 일상으로 만듭니다.", effect: "잭팟 발생 확률이 크게 증가합니다.", maxLevel: 5 },
    rea_m: { x: 150, y: -800, parent: 'mut_quant', cost: 800, name: "🌑 암흑 물질", desc: "보이지 않는 힘으로 부를 축적합니다.", effect: "방치 중일 때 수익 보너스를 얻습니다.", maxLevel: 10 },
    rea_v: { x: 0, y: -950, parent: 'rea_p', cost: 1500, name: "🕹️ 시뮬레이션 해킹", desc: "이 세계가 가상임을 깨닫습니다.", effect: "클릭 수익이 압도적으로 강화됩니다.", maxLevel: 1, type: 'transform' },
    rea_q: { x: 100, y: -1050, parent: 'rea_v', cost: 4000, name: "🧩 인과율 붕괴", desc: "원인 없이 결과가 나타납니다.", effect: "콤보가 영구히 유지됩니다.", maxLevel: 1, type: 'transform' },
    rea_o: { x: -100, y: -1050, parent: 'rea_v', cost: 10000, name: "👁️ 관찰자 효과", desc: "보는 것만으로 가치가 결정됩니다.", effect: "자산 규모에 따른 수익 승수가 추가됩니다.", maxLevel: 1, type: 'transform' }
};

const COUNTRIES = {
    japan: { name: "일본", cost: 100, duration: 30, color: "#ff4d4d", desc: "업그레이드 비용 10% 감소" },
    korea: { name: "남한", cost: 2000, duration: 45, color: "#3b82f6", desc: "IT 협력: 수익 80% 증가" },
    china: { name: "중국", cost: 10000, duration: 30, color: "#ffd700", desc: "수익 50%↑ / 비용 20%↑" },
    usa: { name: "미국", cost: 50000, duration: 30, color: "#3b82f6", desc: "수익 100% 증가" },
    germany: { name: "독일", cost: 250000, duration: 60, color: "#000000", desc: "공정 최적화: 속도 20% 가속" },
    vietnam: { name: "베트남", cost: 1000000, duration: 120, color: "#da251d", desc: "아웃소싱: 비용 20% 감소" },
    uk: { name: "영국", cost: 5000000, duration: 180, color: "#00247d", desc: "금융 허브: 명성 획득 50%↑" },
    north: { name: "북한", cost: 500000000, duration: 60, color: "#7d0000", desc: "군수물자: 수익 10배 폭증" },
    nuclear: { name: "특수", cost: 1000000000, duration: 1, color: "#444", desc: "자산 10배 혹은 70% 증발" }
};

const TREE_POSITION_SCALE = 1.85;
const skillDepthCache = {};

function getSkillDepth(id) {
    if (skillDepthCache[id] !== undefined) return skillDepthCache[id];
    const skill = SKILL_DATA[id];
    if (!skill || !skill.parent) {
        skillDepthCache[id] = 0;
        return 0;
    }
    const depth = 1 + getSkillDepth(skill.parent);
    skillDepthCache[id] = depth;
    return depth;
}

Object.keys(SKILL_DATA).forEach((id) => {
    const skill = SKILL_DATA[id];
    skill.x = Math.round(skill.x * TREE_POSITION_SCALE);
    skill.y = Math.round(skill.y * TREE_POSITION_SCALE);

    if (id === "core") return;

    const depth = getSkillDepth(id);
    const depthMultiplier = Math.pow(1.9, depth);
    const transformMultiplier = skill.type === "transform" ? 1.65 : 1;
    const repeatableMultiplier = (skill.maxLevel || 1) > 1 ? 1.2 : 1;
    skill.cost = Math.max(1, Math.ceil(skill.cost * depthMultiplier * transformMultiplier * repeatableMultiplier));
});

let activeCountries = {}; // { id: timer }
let comboCount = 0;
let comboTimer = 0;
let isFeverMode = false;
let feverTimer = 0;
let lastPlayerActionAt = 0;
let feverTimeLeftMs = 0;
let feverCooldownMs = 0;
let moneyAccumulator = 0; // 소리 발생을 위한 누적 계산기

function createRunStats() {
    return {
        runIncome: 0,
        manualUpgrades: 0,
        autoUpgrades: 0,
        eventsTriggered: 0,
        countriesActivated: 0,
        goldenClicks: 0,
        rebirths: 0,
        highestCombo: 0,
        feverActivations: 0
    };
}

function createContractState() {
    return {
        investorRep: 0,
        completed: 0,
        streak: 0,
        rerollsUsed: 0,
        nextRefreshAt: 0,
        contracts: []
    };
}

function createAchievementState() {
    return {
        unlocked: {},
        points: 0
    };
}

let runStats = createRunStats();
let contractState = createContractState();
let achievementState = createAchievementState();
const CONTRACT_REFRESH_MS = 12 * 60 * 1000;
const CONTRACT_TARGET_SCALE = [1, 1.35, 1.75];
const ACHIEVEMENT_DATA = [
    { id: "money_1", title: "첫 투자 유치", desc: "누적 수익 10만 달성", target: 100000, reward: "수익 +2%", rewardValue: 0.02, check: () => totalMoney >= 100000 },
    { id: "money_2", title: "유니콘 조짐", desc: "누적 수익 1000만 달성", target: 10000000, reward: "수익 +3%", rewardValue: 0.03, check: () => totalMoney >= 10000000 },
    { id: "combo_1", title: "입소문 폭발", desc: "최고 콤보 25 달성", target: 25, reward: "수익 +2%", rewardValue: 0.02, check: () => runStats.highestCombo >= 25 },
    { id: "combo_2", title: "광란의 성장", desc: "최고 콤보 75 달성", target: 75, reward: "수익 +3%", rewardValue: 0.03, check: () => runStats.highestCombo >= 75 },
    { id: "combo_3", title: "광고판 점령", desc: "최고 콤보 150 달성", target: 150, reward: "수익 +4%", rewardValue: 0.04, check: () => runStats.highestCombo >= 150 },
    { id: "contracts_1", title: "이사회 단골", desc: "계약 5개 완료", target: 5, reward: "투자 평판 효율 +10%", rewardValue: 0.1, check: () => contractState.completed >= 5 },
    { id: "contracts_2", title: "월가의 총아", desc: "계약 20개 완료", target: 20, reward: "투자 평판 효율 +15%", rewardValue: 0.15, check: () => contractState.completed >= 20 },
    { id: "contracts_3", title: "계약왕", desc: "계약 50개 완료", target: 50, reward: "투자 평판 효율 +10%", rewardValue: 0.1, check: () => contractState.completed >= 50 },
    { id: "global_1", title: "해외 진출", desc: "국가 협력 3회 체결", target: 3, reward: "명성 획득 +5%", rewardValue: 0.05, check: () => runStats.countriesActivated >= 3 },
    { id: "global_2", title: "세계 무대", desc: "국가 협력 10회 체결", target: 10, reward: "명성 획득 +6%", rewardValue: 0.06, check: () => runStats.countriesActivated >= 10 },
    { id: "rebirth_1", title: "두 번째 창업", desc: "환생 1회 달성", target: 1, reward: "수익 +4%", rewardValue: 0.04, check: () => runStats.rebirths >= 1 },
    { id: "rebirth_2", title: "재창업 전문가", desc: "환생 5회 달성", target: 5, reward: "명성 획득 +8%", rewardValue: 0.08, check: () => runStats.rebirths >= 5 },
    { id: "golden_1", title: "황금 감각", desc: "잭팟 버튼 5회 클릭", target: 5, reward: "수익 +2%", rewardValue: 0.02, check: () => runStats.goldenClicks >= 5 },
    { id: "fever_1", title: "오버드라이브 입문", desc: "오버드라이브 1회 진입", target: 1, reward: "수익 +2%", rewardValue: 0.02, check: () => runStats.feverActivations >= 1 },
    { id: "fever_2", title: "폭주 기업", desc: "오버드라이브 10회 진입", target: 10, reward: "수익 +3%", rewardValue: 0.03, check: () => runStats.feverActivations >= 10 },
    { id: "automation_1", title: "첫 자동화", desc: "관리직 1레벨 달성", target: 1, reward: "수익 +2%", rewardValue: 0.02, check: () => management >= 1 },
    { id: "automation_2", title: "자동화 기업", desc: "관리직 5레벨 달성", target: 5, reward: "수익 +3%", rewardValue: 0.03, check: () => management >= 5 },
    { id: "research_1", title: "개발 집착", desc: "개발팀 50레벨 달성", target: 50, reward: "수익 +3%", rewardValue: 0.03, check: () => dev >= 50 },
    { id: "marketing_1", title: "광고 천재", desc: "마케팅팀 25레벨 달성", target: 25, reward: "수익 +3%", rewardValue: 0.03, check: () => marketing >= 25 },
    { id: "design_1", title: "설계 장인", desc: "설계팀 50레벨 달성", target: 50, reward: "수익 +3%", rewardValue: 0.03, check: () => design >= 50 },
    { id: "space_1", title: "우주 기업", desc: "우주 개척 업그레이드 해금", target: 1, reward: "명성 획득 +5%", rewardValue: 0.05, check: () => prestigeUpgrades.space_u > 0 }
];

let dev = 1;
let marketing = 1;
let design = 1;
let pr = 0;
let strategy = 0;
let management = 0;

let managementActive = true;
let priority = "auto";
let tickSpeed = 1000;
let lastTickTime = Date.now();
let intervalId = null;

let eventMultiplier = 1; // [추가] 이벤트 배수 (SNS 대박 등)
let eventTimer = 0;      // [추가] 이벤트 지속 시간
let isAiBugged = false;  // AI 반란/버그 상태
let isResetting = false; // 초기화 중 세이브 방지 플래그

// 기업 등급 정의
const RANKS = [
    { minM: 0, name: "구멍가게", color: "#666" },
    { minM: 10000, name: "동네 상점", color: "#3b82f6" },
    { minM: 500000, name: "유망 스타트업", color: "#10b981" },
    { minM: 10000000, name: "중견 기업", color: "#f59e0b" },
    { minM: 100000000, name: "나라 대표기업", color: "#a855f7" },
    { minM: 100000000000, name: "글로벌 대기업", color: "#ef4444" },
    { minM: 10000000000000, name: "태양계 대표기업", color: "#44a8ef" },
    { minM: 1000000000000000, name: "은하계 대기업", color: "#181895", bg: "gold" },
    { minM: 100000000000000000, name: "초은하단 대표기업", color: "#00ff00", bg: "aqua" },
    { minM: 10000000000000000000, name: "전우주 독점기업", color: "#000000", bg: "red" },
];

function getCurrentRank() {
    return [...RANKS].reverse().find(r => totalMoney >= r.minM) || RANKS[0];
}
