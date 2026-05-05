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

    // Financial Monopoly (From infra_b)
    fin_i: { x: -450, y: 550, parent: 'infra_b', cost: 100, name: "🏦 투자 은행", desc: "자본을 굴려 자본을 만듭니다.", effect: "보유 자산에 비례한 추가 수익을 얻습니다.", maxLevel: 10 },
    fin_t: { x: -550, y: 650, parent: 'fin_i', cost: 250, name: "⚡ 고주파 매매", desc: "초단위로 시장 차익을 노립니다.", effect: "틱당 추가 고정 수익이 발생합니다.", maxLevel: 10 },
    fin_d: { x: -350, y: 650, parent: 'fin_i', cost: 400, name: "📈 파생 상품", desc: "복잡한 금융 상품으로 리스크를 수익화합니다.", effect: "이벤트 수익이 복리로 계산됩니다.", maxLevel: 5 },
    fin_m: { x: -450, y: 750, parent: 'fin_d', cost: 1000, name: "💰 통화 정책 제어", desc: "시장의 화폐 가치를 조절합니다.", effect: "모든 비용이 대폭 감소합니다.", maxLevel: 1, type: 'transform' },
    fin_e: { x: -450, y: 900, parent: 'fin_m', cost: 5000, name: "💹 경제 싱귤래리티", desc: "돈이 돈을 낳는 완벽한 구조입니다.", effect: "수익이 지수적으로 폭증합니다.", maxLevel: 1, type: 'transform' },

    // Reality Warping (From mut_quant)
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

// =====================
// FX & 사운드 세팅 (파일이 없을 경우 대비하여 예외처리)
// =====================
const sounds = {
    upgrade: new Audio("src/audio/upgrade.mp3"), // 업그레이드!!
    tick: new Audio("src/audio/pop.mp3"), // 돈들어온다🤑🤑
    fail: new Audio("src/audio/fail.mp3"), // 오류, 돈부족
    viral: new Audio("src/audio/ipo.mp3"), // SNS 대박
    ipo: new Audio("src/audio/ipo.mp3"),     // IPO/돈 관련
    fire: new Audio("src/audio/error.mp3"),   // 화재/위험
    fever: new Audio("src/audio/jackpot.mp3"), // 오버드라이브 진입
    jackpot: new Audio("src/audio/cash.mp3"), // 골든 버튼
    unlock: new Audio("src/audio/unlock.mp3"), // 업그레이드 해금
    bgm: new Audio()
};

// BGM 트랙 리스트 및 랜덤 재생 로직
const bgmTracks = [
    "src/music/bgm1.mp3",
    "src/music/bgm2.mp3",
    "src/music/bgm3.mp3",
    "src/music/bgm4.mp3",
    "src/music/bgm5.mp3"
];

function playRandomBGM() {
    if (audioSettings.bgmMuted) return;
    const randomTrack = bgmTracks[Math.floor(Math.random() * bgmTracks.length)];
    sounds.bgm.src = randomTrack;
    sounds.bgm.volume = 0.2;
    sounds.bgm.loop = false; // 곡이 끝나면 다음 랜덤 곡을 틀기 위해 개별 루프는 끕니다.
    sounds.bgm.play().catch(() => {});
}

// 곡이 종료되면 자동으로 다음 랜덤 트랙 재생
sounds.bgm.onended = playRandomBGM;

function updateAudioButtons() {
    const fxBtn = document.getElementById("toggleFxMuteBtn");
    const bgmBtn = document.getElementById("toggleBgmMuteBtn");
    const fxIcon = audioSettings.fxMuted ? "src/image/sound_off.png" : "src/image/sound_on.png";
    const bgmIcon = audioSettings.bgmMuted ? "src/image/bgm_off.png" : "src/image/bgm_on.png";

    if (fxBtn) {
        fxBtn.innerHTML = `<img id="toggleFxMuteIcon" src="${fxIcon}" alt="FX">`;
        fxBtn.setAttribute("aria-label", audioSettings.fxMuted ? "FX muted" : "FX enabled");
        fxBtn.title = "FX toggle";
    }
    if (bgmBtn) {
        bgmBtn.innerHTML = `<img id="toggleBgmMuteIcon" src="${bgmIcon}" alt="BGM">`;
        bgmBtn.setAttribute("aria-label", audioSettings.bgmMuted ? "BGM muted" : "BGM enabled");
        bgmBtn.title = "BGM toggle";
    }
}

function applyAudioSettings() {
    sounds.bgm.muted = audioSettings.bgmMuted;
    updateAudioButtons();
}

function toggleFxMute() {
    audioSettings.fxMuted = !audioSettings.fxMuted;
    localStorage.setItem('idleInc_fxMuted', String(audioSettings.fxMuted));
    updateAudioButtons();
}

function toggleBgmMute() {
    audioSettings.bgmMuted = !audioSettings.bgmMuted;
    localStorage.setItem('idleInc_bgmMuted', String(audioSettings.bgmMuted));
    applyAudioSettings();

    if (audioSettings.bgmMuted) {
        sounds.bgm.pause();
    } else if (!sounds.bgm.src) {
        playRandomBGM();
    } else {
        sounds.bgm.play().catch(() => {});
    }
}

// =====================
// 포맷팅 (K, M, B 단위)
// =====================
function formatNumber(num) {
    if (!isFinite(num) || isNaN(num)) return "0";
    if (num < 1000) return Math.floor(num).toLocaleString();
    
    // 단위를 확장하여 undefined 발생 방지 (K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc, Ud, Dd, Td)
    const units = ["", "k", "m", "b", "t", "qa", "qi", "sx", "sp", "oc", "no", "dc", "ud", "dd", "td"];
    const i = Math.floor(Math.log10(num) / 3);
    
    if (i >= units.length) return num.toExponential(2); // 범위를 넘어가면 지수 표기법 사용
    const value = (num / Math.pow(1000, i)).toFixed(2);
    return value + units[i];
}

function softcap(value, cap, power = 0.5) {
    if (value <= cap) return value;
    return cap * Math.pow(value / cap, power);
}

function recordPlayerAction() {
    lastPlayerActionAt = Date.now();
    if (isFeverMode) {
        feverTimeLeftMs = Math.min(feverTimeLeftMs + 400, 6000);
    }
}

function endFeverMode(applyPenalty = true) {
    if (!isFeverMode) return;
    isFeverMode = false;
    feverTimeLeftMs = 0;
    feverCooldownMs = 8000;
    document.body.classList.remove("fever-active");

    if (applyPenalty) {
        comboCount = Math.floor(comboCount * 0.3);
        comboTimer = Math.min(comboTimer, 4);
        addLog("⚡ 오버드라이브 종료: 콤보가 크게 감소했습니다.");
    } else {
        addLog("⚡ 오버드라이브 종료");
    }
}

// =====================
// 통합 공식 시스템 (밸런스 패치)
// =====================
function cost(level, type) {
  // 밸런스 패치: 후반부 비용 급상승 억제 (1.58 -> 1.52 / 1.22 -> 1.18)
  let baseCost = Math.floor(20 * Math.pow(1.52, Math.min(level, 100)) * Math.pow(1.18, Math.max(0, level - 100)));
  
  const countryDiscount = activeCountries.japan ? 0.9 : 1.0;
  const countryPenalty = activeCountries.china ? 1.2 : 1.0;
  const vietnamDiscount = activeCountries.vietnam ? 0.8 : 1.0;
  
  const discountKey = { dev: 'dev_c', marketing: 'mkt_c', design: 'des_c', pr: 'pr_c' }[type];
  const prestigeDiscount = Math.pow(0.90, prestigeUpgrades[discountKey] || 0);
  
  // 신규 스킬: 수직 계열화 (corp_m)
  const corpDiscount = Math.pow(0.95, (prestigeUpgrades.corp_m || 0) + (prestigeUpgrades.ai_o || 0));
  const finDiscount = prestigeUpgrades.fin_m > 0 ? 0.1 : 1.0;
  
  let strategyDiscount = 1 - (strategy * (0.03 + (prestigeUpgrades.infra_c || 0) * 0.01));
  
  if (type === 'management') {
      baseCost = Math.floor(120 * Math.pow(6, Math.min(level, 5)) * Math.pow(2.6, Math.max(0, level - 5)));
      if (prestigeUpgrades.auto_m > 0) baseCost *= 0.5;
  }

  const finalDiscount = Math.max(0.01, prestigeDiscount * strategyDiscount * corpDiscount * finDiscount);
  return Math.floor(baseCost * finalDiscount * countryDiscount * countryPenalty * vietnamDiscount);
}

function getIncome() {
  const prestigeBonus = 1 + (prestigePoints * 0.05);
  let typeBonus = prestigeUpgrades.companyType === 'startup' ? 1.2 : 1;

  const hasCountry = (id) => activeCountries[id] || (prestigeUpgrades.gl_w > 0 && id !== 'nuclear');

  let countryIncomeMult = 1;
  if (hasCountry('korea')) countryIncomeMult *= 1.8;
  if (hasCountry('china')) countryIncomeMult *= 1.5;
  if (hasCountry('usa')) countryIncomeMult *= 2.0;
  if (hasCountry('north')) countryIncomeMult *= 10.0;
  if (hasCountry('china') && hasCountry('usa')) countryIncomeMult *= 1.5;

  const dipEffBonus = 1 + (prestigeUpgrades.gl_t || 0) * 0.5;
  countryIncomeMult = 1 + (countryIncomeMult - 1) * dipEffBonus;

  const activeNonNuclearCount = Object.keys(activeCountries).filter(id => id !== 'nuclear').length;
  const dipOBonus = 1 + (activeNonNuclearCount * (prestigeUpgrades.dip_o || 0) * 0.5);

  let conditionalMult = 1;
  if (comboCount >= 50) conditionalMult *= 1.5;
  if (comboCount >= 100) conditionalMult *= 2;
  if (eventTimer > 0) conditionalMult *= 2;
  if (activeCountries.nuclear) conditionalMult *= 4;

  let devSpecialBonus = 1 + (prestigeUpgrades.dev_m * 0.5) + (prestigeUpgrades.rnd_p * 1.0);
  if (prestigeUpgrades.dev_t > 0 && Math.random() < (0.1 * prestigeUpgrades.dev_t)) {
      devSpecialBonus *= 5;
  }
  if (prestigeUpgrades.sc_n > 0) devSpecialBonus *= (1 + prestigeUpgrades.sc_n * 2.0);

  let baseIncome = (dev * 8) * Math.pow(marketing, 1.1) * (prestigeUpgrades.mut_evt > 0 ? 0.1 : 1) * (prestigeUpgrades.mut_spd > 0 ? 0.6 : 1);
  if (prestigeUpgrades.mut_quant > 0) baseIncome *= 10;
  if (prestigeUpgrades.gl_c > 0) baseIncome *= Math.pow(1.5, prestigeUpgrades.gl_c);

  const prBoost = softcap(1 + (pr * 0.18 * (prestigeUpgrades.gl_m > 0 ? 3 : 1)), 8, 0.55);
  const mktMult = softcap(Math.pow(1.8, prestigeUpgrades.mkt_m), 24, 0.45);
  const strategyBoost = softcap(1 + (strategy * 0.08), 10, 0.5);
  const comboBonus = softcap(1 + (comboCount * (0.012 + prestigeUpgrades.cmb_b * 0.006)) * (prestigeUpgrades.sc_v > 0 ? 5 : 1), 14, 0.5);
  let feverBase = isFeverMode ? (8 + (prestigeUpgrades.fever_u || 0) * 2) : 1;

  // 신규 스킬 적용
  const spaceMult = Math.pow(5, prestigeUpgrades.space_m || 0) 
                  * (prestigeUpgrades.space_mars > 0 ? 100 : 1)
                  * Math.pow(1000, prestigeUpgrades.cos_s || 0);

  const aiQMult = (eventTimer > 0) ? Math.pow(2, prestigeUpgrades.ai_q || 0) : 1;
  const finMult = (1 + (money * (prestigeUpgrades.fin_i || 0) * 0.00000000001)) * (prestigeUpgrades.fin_e > 0 ? 1000 : 1);
  const reaMult = prestigeUpgrades.rea_o > 0 ? (1 + Math.log10(totalMoney + 1)) : 1;

  let income = baseIncome * prBoost * strategyBoost * prestigeBonus * devSpecialBonus * comboBonus * eventMultiplier * feverBase * typeBonus * mktMult * countryIncomeMult * conditionalMult * dipOBonus * spaceMult * aiQMult * finMult * reaMult;

  if (prestigeUpgrades.cos_a > 0) income *= 2;

  if (prestigeUpgrades.cos_z > 0) return income; // 모든 소프트캡 해제

  income = softcap(income, 1e20, 0.8);
  income = softcap(income, 1e40, 0.7);
  income = softcap(income, 1e80, 0.6);
  return income;
}

// =====================
// 업그레이드
// =====================
// 단일 업그레이드 창구 (유저/AI 공용)
function tryUpgrade(type, isSilent = false, targetEl = null) {
    // 배경 음악 시작 (유저의 첫 클릭 상호작용 시 재생 시작)
    if (!audioSettings.bgmMuted && sounds.bgm.paused) {
        if (!sounds.bgm.src) {
            playRandomBGM();
        } else {
            sounds.bgm.play().catch(() => {});
        }
    }

    const levels = { dev, marketing, design, pr, strategy, management };
    const c = cost(levels[type], type);

    const cardId = type === 'management' ? 'card-management' : 'card-' + type;

    if (money >= c) {
        money -= c;
        if (type === 'dev') dev++;
        if (type === 'marketing') marketing++;
        if (type === 'design') {
            design++;
            updateTickSpeed();
        }
        if (type === 'pr') pr++;
        if (type === 'strategy') strategy++;
        if (type === 'management') management++;
        
        // [개선] 직접 클릭은 1, AI는 0.1만 상승 (무분별한 콤보 방지)
        let gain = isSilent ? (0.1 + prestigeUpgrades.cmb_ai * 0.1) : (prestigeUpgrades.mut_idle > 0 ? 0.2 : 1);
        comboCount += gain;
        if (isFeverMode) comboCount += gain; 
        
        // [수정] 콤보 유지 시간 보정: 최소 3초(3000ms) 정도는 유지되도록 틱 수 계산
        const minKeepTime = 3000; 
        comboTimer = Math.max(20, Math.floor(minKeepTime / tickSpeed)) * (1 + prestigeUpgrades.cmb_k * 0.2);

        // 시각 피드백: 마이너스 텍스트
        if (targetEl) {
            showFloatingText(`-${formatNumber(c)}`, '#ef4444', targetEl);
        }

        // FX 효과 (관리직 자동 구매 시 소리 제외)
        if (!isSilent) playFX('upgrade');
        
        if (isSilent) {
            // 관리직이 구매할 때는 보라색 오라 발생
            animateElement(cardId, 'pulse-purple');
        } else {
            animateElement(cardId, 'pulse-red');
        }
        
        updateUI();
        return true;
    } else {
        // 유저 클릭 시에만 실패 연출
        if (!isSilent && targetEl) {
            playFX('fail');
            animateElement(cardId, 'shake');
        }
        return false;
    }
}

function buyPrestigeUpgrade(id) {
    const skill = SKILL_DATA[id];
    if (!skill) return;
    if (isSkillLocked(id)) {
        alert("스킬이 잠겨있습니다!");
        return;
    }

    // 최대 레벨 체크
    if (prestigeUpgrades[id] >= (skill.maxLevel || 1)) {
        alert("이미 최대 레벨에 도달했습니다!");
        return;
    }

    // 종속성 체크
    if (skill.parent && prestigeUpgrades[skill.parent] === 0) {
        alert("선행 스킬이 필요합니다!");
        return;
    }

    let actualCost = skill.cost;

    if (prestigePoints >= actualCost) {
        prestigePoints -= actualCost;
        prestigeUpgrades[id]++;
        
        playFX('unlock');
        addLog(`🌳 스킬 강화: [${skill.name}] Lv.${prestigeUpgrades[id]} 달성!`);
        renderSkillTree(); // 트리 재렌더링
        updateUI();
    } else {
        alert("명성 포인트가 부족합니다!");
    }
}

// [방사형 트리 렌더링 엔진]
function isSkillOwned(id) {
    return (prestigeUpgrades[id] || 0) > 0;
}

function isSkillLocked(id) {
    const skill = SKILL_DATA[id];
    if (!skill || id === 'core') return false;
    if (!skill.parent) return false;
    return !isSkillOwned(skill.parent);
}

function getPrestigeSkillCost(id) {
    const skill = SKILL_DATA[id];
    if (!skill) return 0;

    // 기본 비용에 레벨당 2배씩 증가 (여러 개 찍을수록 비싸지지만 효과는 강력)
    const level = prestigeUpgrades[id] || 0;
    if (level === 0) return skill.cost;
    return Math.floor(skill.cost * Math.pow(2.5, level));
}

function getChildSkills(parentId) {
    return Object.keys(SKILL_DATA).filter(id => SKILL_DATA[id].parent === parentId);
}

function renderSkillTree() {
    const container = document.getElementById("treeContainer");
    const svg = document.getElementById("treeSvg");
    if (!container || !svg) return;

    container.querySelectorAll(".tree-node").forEach(node => node.remove());
    if (!container.contains(svg)) {
        container.prepend(svg);
    }
    svg.innerHTML = "";

    Object.keys(SKILL_DATA).forEach(id => {
        const skill = SKILL_DATA[id];
        const isOwned = isSkillOwned(id);
        const isLocked = isSkillLocked(id);
        const isCore = id === 'core';

        // 1. 노드 엘리먼트 생성
        const node = document.createElement("div");
        node.className = `tree-node ${isOwned ? 'owned' : ''} ${isLocked ? 'locked' : ''} ${isCore ? 'core' : ''} ${skill.type === 'transform' ? 'transform' : ''}`;
        if (id === selectedNodeId) node.classList.add('selected');
        node.style.left = `${skill.x}px`;
        node.style.top = `${skill.y}px`;
        node.dataset.skillId = id;
        
        let levelTag = "";
        if (isOwned) {
            levelTag = `<div class="level-tag">Lv.${prestigeUpgrades[id]}</div>`;
        }
        node.innerHTML = `<span>${skill.name}</span>${levelTag}`;
        
        if (!isOwned && !isLocked) {
            const price = document.createElement("div");
            price.className = "price-tag";
            price.innerText = `${getPrestigeSkillCost(id)}P`;
            node.appendChild(price);
        }
        
        container.appendChild(node);

        // 2. 부모 노드와 선 연결 (SVG)
        if (skill.parent) {
            const parent = SKILL_DATA[skill.parent];
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", parent.x);
            line.setAttribute("y1", parent.y);
            line.setAttribute("x2", skill.x);
            line.setAttribute("y2", skill.y);
            line.setAttribute("stroke", isOwned ? "#f59e0b" : "#cbd5e1");
            line.setAttribute("stroke-width", isOwned ? "3" : "1");
            svg.appendChild(line);
        }
    });
    updateTreeTransform();
}

// [트리 위치 업데이트]
function updateTreeTransform() {
    const container = document.getElementById("treeContainer");
    if (container) {
        container.style.transform = `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${treeScale})`;
    }
}

// [드래그 이벤트 바인딩]
function initTreeDragging() {
    const viewport = document.getElementById("treeViewport");
    if (!viewport) return;

    viewport.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        isDraggingTree = true;
        activePointerId = e.pointerId;
        treeMovedDuringPointer = false;
        pointerDownNode = e.target.closest('.tree-node');
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        viewport.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    viewport.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        treeScale = Math.min(2, Math.max(0.3, treeScale * delta));
        updateTreeTransform();
    }, { passive: false });

    viewport.addEventListener('pointermove', (e) => {
        if (!isDraggingTree || e.pointerId !== activePointerId) return;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            treeMovedDuringPointer = true;
        }
        
        panX += dx;
        panY += dy;
        
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        updateTreeTransform();
    });

    const stopDragging = (e) => {
        const tappedNode = !treeMovedDuringPointer ? pointerDownNode : null;

        if (activePointerId !== null && e.pointerId === activePointerId && viewport.hasPointerCapture(e.pointerId)) {
            viewport.releasePointerCapture(e.pointerId);
        }
        if (treeMovedDuringPointer) {
            suppressTreeClickUntil = Date.now() + 150;
        }
        isDraggingTree = false;
        activePointerId = null;
        treeMovedDuringPointer = false;
        pointerDownNode = null;

        if (tappedNode && Date.now() >= suppressTreeClickUntil) {
            const skillId = tappedNode.dataset.skillId;
            if (skillId) {
                selectNode(skillId);
            }
        }
    };

    viewport.addEventListener('pointerup', stopDragging);
    viewport.addEventListener('pointercancel', stopDragging);
}

// 노드 선택 로직
function selectNode(id) {
    selectedNodeId = id;
    renderSkillTree(); // 선택 상태 표시를 위해 재렌더링

    const skill = SKILL_DATA[id];
    const currentLv = prestigeUpgrades[id] || 0;
    const maxLv = skill.maxLevel || 1;
    
    // 동적 효과 텍스트 생성
    const getVal = (lv) => {
        switch(id) {
            case 'dev_c': case 'mkt_c': case 'des_c': case 'pr_c': return `${(100 - Math.pow(0.9, lv) * 100).toFixed(1)}% 할인`;
            case 'dev_m': return `수익 +${lv * 50}%`;
            case 'mkt_m': return `수익 x${Math.pow(2, lv)}`;
            case 'des_t': return `속도 보너스 +${(lv * 10)}%`;
            case 'mgmt_p': return `자동 구매 +${lv * 2}회`;
            case 'dip_g': return `명성 획득 +${lv * 20}%`;
            case 'dev_t': return `크리티컬 확률 ${lv * 10}%`;
            case 'pr_s': return `홍보 시너지 x${(1 + lv * 0.5).toFixed(1)}`;
            case 'dip_o': return `해외 추가 수익 +${lv * 100}%`;
            case 'evt_c': return `확률 보너스 +${lv * 10}%`;
            case 'evt_d': return `지속 시간 +${lv * 10}%`;
            case 'evt_m': return `수익 배수 +${lv * 50}%`;
            case 'cmb_k': return `유지 시간 +${lv * 20}%`;
            case 'cmb_b': return `콤보당 수익 +${lv * 1}%`;
            case 'cmb_ai': return `AI 콤보 획득 +${lv * 100}%`;
            case 'cmb_j': return `잭팟 보상 +${lv * 50}%`;
            case 'auto_spd': return `AI 행동량 +${lv * 2}회`;
            case 'dip_g': return `명성 획득 +${lv * 20}%`;
            case 'mut_spd': return `속도 2배 / 수익 -40%`;
            case 'mut_evt': return `기본수익 0 / 이벤트 극대화`;
            case 'fever_u': return `피버 배율 +${lv * 2}x`;
            case 'dip_ex': return `지속 시간 +${lv * 10}%`;
            case 'auto_m': return `관리직 비용 50% 할인`;
            case 'mut_quant': return `수익 x10 / 속도 -20%`;
            case 'infra_c': return `전략 할인 +${lv * 1}%`;
            case 'infra_s': return `속도 배율 +${lv * 10}%`;
            case 'infra_b': return `명성 획득 +${lv * 50}%`;
            case 'corp_m': return `전체 비용 -${(100 - Math.pow(0.95, lv)*100).toFixed(1)}%`;
            case 'corp_l': return `외교 비용 -${lv * 10}%`;
            case 'space_m': return `수익 x${Math.pow(5, lv)}`;
            case 'rnd_a': return `AI 처리량 +${lv * 5}회`;
            case 'rnd_p': return `기본 수익 +${lv * 100}%`;
            case 'ai_n': return `AI 행동 +${lv * 5}회`;
            case 'gl_t': return `외교 효과 +${lv * 50}%`;
            case 'gl_h': return `명성 포인트 +${lv * 100}%`;
            case 'sc_n': return `기본 수익 +${lv * 200}%`;
            case 'cos_s': return `전체 수익 x${Math.pow(1000, lv)}`;
            case 'ai_q': return `이벤트 수익 x${Math.pow(2, lv)}`;
            case 'ai_o': return `전체 비용 -${(100 - Math.pow(0.95, lv)*100).toFixed(1)}%`;
            case 'gl_c': return `기본 수익 x${Math.pow(1.5, lv).toFixed(1)}`;
            case 'sc_f': return `설계 효율 +${lv * 10}%`;
            case 'sc_m': return `전체 비용 -${lv * 5}%`;
            case 'cos_d': return `명성 포인트 +${lv * 100}%`;
            case 'fin_m': return `전체 비용 -90%`;
            case 'fin_e': return `수익 x1000`;
            case 'rea_v': return `클릭 수익 대폭 강화`;
            case 'rea_q': return `콤보 영구 유지`;
            case 'rea_o': return `자산 비례 수익 승수`;
            case 'gl_m': return `홍보 시너지 3배 고정`;
            case 'sc_v': return `콤보 배수 x5 강화`;
            case 'fin_i': return `자산 비례 수익 +${(lv * 0.1).toFixed(1)}%`;
            case 'fin_t': return `고정 수익 +${formatNumber(Math.pow(10, lv + 5))}`;
            case 'fin_d': return `이벤트 수익 복리 +${lv * 100}%`;
            case 'rea_p': return `잭팟 확률 +${lv * 10}%`;
            case 'rea_m': return `방치 수익 x${lv * 2}`;
            default: return lv > 0 ? "활성화됨" : "비활성화";
        }
    };

    const detailsDefault = document.getElementById("detailsDefault");
    const detailsContent = document.getElementById("detailsContent");
    
    detailsDefault.style.display = "none";
    detailsContent.style.display = "flex";

    document.getElementById("detailName").innerText = `${skill.name} (Lv.${currentLv}/${maxLv})`;
    document.getElementById("detailDesc").innerText = skill.desc;
    
    const effectText = currentLv >= maxLv ? 
        `현재: ${getVal(currentLv)} (최대)` : 
        `현재: ${getVal(currentLv)} ➔ 다음: ${getVal(currentLv + 1)}`;
    document.getElementById("detailEffect").innerText = `${skill.effect}\n[${effectText}]`;
    
    const isOwned = isSkillOwned(id);
    const isLocked = isSkillLocked(id);
    const btn = document.getElementById("detailBuyBtn");

    let actualCost = getPrestigeSkillCost(id);
    document.getElementById("detailCostValue").innerText = actualCost;

    if (isLocked) {
        btn.innerText = "잠김 (선행 연구 필요)";
        btn.disabled = true;
        btn.style.background = "#ccc";
    } else if (currentLv >= maxLv) {
        btn.innerText = "연구 완료 (MAX)";
        btn.disabled = true;
        btn.style.background = "#10b981";
    } else {
        const canAfford = prestigePoints >= actualCost;
        btn.innerText = canAfford ? (currentLv > 0 ? "추가 연구" : "연구 시작") : "포인트 부족";
        btn.disabled = !canAfford;
        btn.style.background = canAfford ? "#f59e0b" : "#ccc";
        btn.onclick = () => {
            buyPrestigeUpgrade(id);
            selectNode(id); // 구매 후 UI 갱신
        };
    }
}

// =====================
// 외교 시스템 실행
// =====================
function activateCountry(id) {
    if (!prestigeUpgrades.dip_u) {
        alert("설계 트리 Tier 3 [외교관] 스킬이 필요합니다!");
        return;
    }
    const country = COUNTRIES[id];
    if (money >= country.cost) {
        // 법무팀 할인 (corp_l)
        const dipDiscount = Math.pow(0.9, prestigeUpgrades.corp_l || 0);
        money -= (country.cost * dipDiscount);
        
        if (id === 'nuclear') {
            if (Math.random() < 0.5) {
                money *= 10;
                showNews("☢️ [초대박] 국가 기밀 사업이 성공하여 자산이 10배 폭증합니다!", true);
            } else {
                money *= 0.3;
                showNews("☢️ [재앙] 국가 부도 사태로 자산의 70%가 증발했습니다!");
            }
            playFX('fire');
        } else {
            // 문화 교류(dip_ex)에 따른 지속 시간 증가
            const durationBonus = 1 + (prestigeUpgrades.dip_ex || 0) * 0.1;
            activeCountries[id] = Math.floor(country.duration * durationBonus);
            showNews(`🌍 ${country.name} 제휴: ${country.desc} (${activeCountries[id]}초)`, true);
            playFX('ipo');
            if (id === 'germany') updateTickSpeed();
        }
        updateUI();
    } else {
        alert("외교 비용이 부족합니다!");
    }
}

function updateDiplomacyTimers() {
    const dt = tickSpeed / 1000; // 틱당 경과 시간(초)
    for (let id in activeCountries) {
        activeCountries[id] -= dt;
        if (activeCountries[id] <= 0) {
            const expiredId = id;
            delete activeCountries[id];
            addLog(`🌍 ${COUNTRIES[expiredId].name}와의 제휴 기간이 만료되었습니다.`);
            if (expiredId === 'germany') updateTickSpeed();
        }
    }
}

function spawnGoldenButton() {
    const layer = document.getElementById("clickEventLayer");
    if (!layer) return;

    const btn = document.createElement("div");
    btn.className = "golden-btn";
    btn.innerHTML = "💰";
    
    // 랜덤 위치 (화면 가장자리 제외)
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight - 100) + 50;
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;

    btn.onclick = () => {
        const reward = getIncome() * 300 * (1 + prestigeUpgrades.cmb_j * 0.5); // 300틱 분량 수익
        money += reward;
        totalMoney += reward;
        comboCount += 5;
        showFloatingText(`JACKPOT! +${formatNumber(reward)}`, '#f59e0b', btn);
        playFX('jackpot');
        btn.remove();
    };

    layer.appendChild(btn);
    setTimeout(() => { if (btn.parentNode) btn.remove(); }, 3000); // 3초 뒤 사라짐
}

// =====================
// 세이브 시스템 (난독화 및 통합 관리)
// =====================
function getSaveData() {
    return {
        v: 1, // 버전
        m: money,
        tm: totalMoney,
        pp: prestigePoints,
        pu: prestigeUpgrades,
        d: dev,
        mk: marketing,
        ds: design,
        pr: pr,
        st: strategy,
        mg: management,
        p: priority,
        t: Date.now()
    };
}

function encode(data) {
    const raw = JSON.stringify(data);
    // 1. Base64 인코딩
    let out = btoa(unescape(encodeURIComponent(raw)));
    // 2. 뒤집기
    out = out.split("").reverse().join("");
    // 3. 노이즈 추가
    const n = Math.random().toString(36).substring(2, 6);
    return n + out + n + "!END!";
}

function decode(str) {
    try {
        str = str.replace("!END!", "");
        str = str.slice(4, -4);
        str = str.split("").reverse().join("");
        const raw = decodeURIComponent(escape(atob(str)));
        return JSON.parse(raw);
    } catch (e) {
        console.error("세이브 파싱 실패:", e);
        return null;
    }
}

function saveGame() {
    if (isResetting) return;
    const data = getSaveData();
    localStorage.setItem("idleIncSave", encode(data));
    addLog("💾 시스템 데이터가 자동 저장되었습니다.");
}

function loadGame() {
    const encoded = localStorage.getItem("idleIncSave");
    if (!encoded) return;
    const data = decode(encoded);
    if (!data) return;

    money = data.m;
    totalMoney = data.tm || data.m;
    prestigePoints = data.pp || 0;
    prestigeUpgrades = { ...prestigeUpgrades, ...data.pu }; // 새 스킬 대응을 위한 병합
    dev = data.d;
    marketing = data.mk;
    design = data.ds;
    pr = data.pr || 0;
    strategy = data.st || 0;
    management = data.mg || 0;
    priority = data.p || "auto";

    // 오프라인 수익 계산
    const now = Date.now();
    const diff = (now - data.t) / 1000;
    if (diff > 60) {
        const offlineRate = 0.1; 
        const earnings = getIncome() * diff * offlineRate;
        if (earnings > 1) {
            money += earnings;
            totalMoney += earnings;
            setTimeout(() => {
                document.getElementById("offlineEarnings").innerText = formatNumber(earnings);
                document.getElementById("offlineModal").style.display = "flex";
            }, 500);
        }
    }
    updateTickSpeed();
    renderSkillTree();
    updateUI();
}

function exportSave() {
    const code = encode(getSaveData());
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            alert("세이브 코드가 클립보드에 복사되었습니다. 안전한 곳에 보관하세요!");
        }).catch(err => {
            prompt("복사 실패. 아래 코드를 직접 복사하세요:", code);
        });
    } else {
        prompt("아래 코드를 복사하여 보관하세요:", code);
    }
}

function importSave() {
    const code = prompt("세이브 코드를 입력해주세요:");
    if (!code) return;
    const data = decode(code);
    if (data) {
        isResetting = true; // 새로고침 시 이전 데이터가 덮어씌워지는 것을 방지
        localStorage.setItem("idleIncSave", code);
        location.reload();
    } else {
        alert("유효하지 않은 코드입니다.");
    }
}

function resetGame() {
    if (confirm("정말로 모든 데이터를 삭제하시겠습니까? 명성 스킬을 포함한 모든 진행도가 초기화됩니다.")) {
        isResetting = true;
        localStorage.removeItem("idleIncSave");
        location.reload();
    }
}

function closeOfflineModal() {
    document.getElementById("offlineModal").style.display = "none";
}

function playFX(key) {
    if (audioSettings.fxMuted) return;
    if (sounds[key]) {
        sounds[key].currentTime = 0;
        sounds[key].play().catch(() => {}); // 유저 인터랙션 전 재생 방지
    }
}

function animateElement(id, className) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // 리플로우 강제 발생
    el.classList.add(className);
    
    // 애니메이션 종료 후 클래스 제거 (색상 고정 방지)
    setTimeout(() => el.classList.remove(className), 600);
}

function showFloatingText(text, color, targetEl) {
    const rect = targetEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    const el = document.createElement("div");
    el.className = "floating-text";
    el.innerText = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.color = color;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function addLog(msg) {
    const logEl = document.getElementById("log");
    if (!logEl) return;
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logEl.prepend(entry);
    if (logEl.children.length > 5) logEl.lastChild.remove();
}

// 기존 함수들을 tryUpgrade로 래핑 (HTML onclick 호환성 유지)
function upgradeDev(el) { tryUpgrade('dev', false, el); }
function upgradeMarketing(el) { tryUpgrade('marketing', false, el); }
function upgradeDesign(el) { tryUpgrade('design', false, el); }
function upgradePr(el) { tryUpgrade('pr', false, el); }
function upgradeStrategy(el) { tryUpgrade('strategy', false, el); }
function upgradeManagement(el) { tryUpgrade('management', false, el); }

// =====================
// 환생 (Rebirth) 시스템
// =====================
function getPotentialPrestige() {
    const progress = Math.max(0, Math.log10(totalMoney + 1) - 7);
    let gain = progress <= 0 ? 0 : Math.floor(3 * Math.pow(progress, 2));
    if (gain > 2500) gain = Math.floor(2500 * Math.pow(gain / 2500, 0.55));
    if (prestigeUpgrades.dip_g > 0) gain = Math.floor(gain * (1 + prestigeUpgrades.dip_g * 0.15));
    if (activeCountries.uk) gain = Math.floor(gain * 1.5); // 영국: 명성 획득 50% 보너스
    return gain;
}

function rebirth() {
    let gain = getPotentialPrestige();
    
    if (gain < 1) {
        alert(`기업 규모가 너무 작습니다!\n최소 1P(누적 수익 1,000만 원) 이상일 때 리브랜딩이 가능합니다.`);
        return;
    }

    // 화려한 연출을 위해 오버레이 생성
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.inset = "0";
    flash.style.background = "white";
    flash.style.zIndex = "10000";
    flash.style.opacity = "0";
    flash.style.transition = "opacity 0.5s";
    flash.style.pointerEvents = "none";
    document.body.appendChild(flash);

    setTimeout(() => flash.style.opacity = "1", 10);
    setTimeout(() => {
        flash.style.opacity = "0";
        setTimeout(() => flash.remove(), 500);
    }, 600);

    if (confirm(`환생하시겠습니까?\n현재 누적 수익으로 ${gain} 포인트를 얻습니다.\n(모든 부서 레벨과 현재 돈이 초기화되지만, 수익 승수는 유지됩니다.)`)) {
        prestigePoints += gain;
        money = 100;
        totalMoney = 0; 
        activeCountries = {};
        comboCount = 0;
        comboTimer = 0;
        isFeverMode = false;
        dev = 1 + (prestigeUpgrades.dev_s > 0 ? 1 : 0);
        marketing = 1 + (prestigeUpgrades.mkt_s > 0 ? 1 : 0);
        design = 1 + (prestigeUpgrades.des_s > 0 ? 1 : 0);
        pr = 0;
        strategy = 0;
        management = 0;
        managementActive = false; // 환생 후에는 직접 다시 켜야 함
        updateTickSpeed();
        addLog(`환생 성공! 명성 포인트 ${gain}을 획득하여 회사가 더 강력해졌습니다.`);
        playFX('cash');
        updateUI();
    }
}

// =====================
// 속도 시스템
// =====================
function updateTickSpeed() {
  let designEffect = 0.2 + (prestigeUpgrades.des_t * 0.1) + (prestigeUpgrades.infra_s * 0.05) + (prestigeUpgrades.sc_f * 0.1);
  let speedMult = activeCountries.germany ? 0.8 : 1.0; // 독일: 20% 가속
  let quantPenalty = prestigeUpgrades.mut_quant > 0 ? 1.2 : 1.0; // 양자 연산: 20% 감속
  let spacePenalty = prestigeUpgrades.space_mars > 0 ? 1.5 : 1.0; // 화성: 50% 감속
  let scBonus = prestigeUpgrades.sc_t > 0 ? 0.33 : 1.0; // 시간 가변기 (3배 가속)

  tickSpeed = (1000 / (1 + design * designEffect)) * (prestigeUpgrades.mut_spd > 0 ? 0.5 : 1) * speedMult * quantPenalty * spacePenalty * scBonus;
  startLoop(); // 속도 변경 시 루프 재시작
}

function startLoop() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
        gameLoop();
    }, tickSpeed);
}

function toggleManagement() {
  managementActive = !managementActive;
}

// 긴급 뉴스 표시 함수
function showNews(text, isPositive = false) {
    const banner = document.getElementById("newsBanner");
    if (!banner) return;
    
    banner.innerText = "🚨 [긴급 속보] " + text;
    banner.classList.add("active");
    if (isPositive) banner.classList.add("positive");
    else banner.classList.remove("positive");

    setTimeout(() => {
        banner.classList.remove("active");
    }, 4000);
}

// =====================
// AI 관리직
// =====================
function autoManage() {
  // [버그 수정] 관리직 레벨이 0이면 상점 업그레이드가 있어도 작동하지 않음
  const isBugged = isAiBugged && prestigeUpgrades.ai_s === 0;
  if (!managementActive || isBugged || (management <= 0 && prestigeUpgrades.mgmt_u === 0)) return;

  // [명성 상점: 서버(ai1)] + [전략기획팀] 효과로 AI 처리량 계산
  let aiCapacity = (management + (prestigeUpgrades.mgmt_p * 2) + Math.floor(strategy * 0.15) + (prestigeUpgrades.auto_spd * 2) + (prestigeUpgrades.rnd_a * 5) + (prestigeUpgrades.ai_n * 5)) * (prestigeUpgrades.mut_idle > 0 ? 2 : 1);
  if (prestigeUpgrades.ai_x > 0) aiCapacity *= 2;
  
  // [관리직 제한] 무제한 스킬이 없으면 15회로 제한 (상향)
  if (prestigeUpgrades.auto_inf === 0) aiCapacity = Math.min(aiCapacity, 15);

  for (let i = 0; i < aiCapacity; i++) {
    // 루프 내부에서 타겟을 갱신하여 즉각적인 연쇄 업그레이드 방지
    let targets = [
      { name: "dev", cost: cost(dev, 'dev') },
      { name: "marketing", cost: cost(marketing, 'marketing') },
      { name: "design", cost: cost(design, 'design') },
      { name: "pr", cost: cost(pr, 'pr'), unlocked: totalMoney >= 100000 },
      { name: "strategy", cost: cost(strategy, 'strategy'), unlocked: totalMoney >= 1000000 },
      { name: "management", cost: cost(management, 'management'), unlocked: prestigeUpgrades.mgmt_h > 0 }
    ];

    // 해금된 타겟만 필터링
    targets = targets.filter(t => t.unlocked !== false);

    if (priority !== "auto") {
      targets = targets.filter(t => t.name === priority);
    }

    targets.sort((a, b) => a.cost - b.cost);

    let t = targets[0];
    if (tryUpgrade(t.name, true)) {
        const nameMap = { dev: "개발팀", marketing: "마케팅팀", design: "설계팀", pr: "홍보팀", strategy: "전략팀" };
        addLog(`🤖 AI: [${nameMap[t.name]}] 지능형 업그레이드 수행 완료.`);
    } else {
        break;
    }
  }
}

// =====================
// 지시
// =====================
function setPriority(p) {
  priority = p;
}

// =====================
// 게임 루프
// =====================
function gameLoop() {
  updateDiplomacyTimers();

  if (comboCount > 0 && prestigeUpgrades.rea_q === 0) {
    if (comboTimer > 0) {
        comboTimer--;
    } else {
        // [개선] 타이머가 끝나면 콤보가 지속적으로 감쇠됨
        const decayRate = prestigeUpgrades.mkt_m > 0 ? 0.95 : 0.8; 
        comboCount *= decayRate;
        
        if (comboCount < 0.5) comboCount = 0;
        
        if (isFeverMode && comboCount < 20) {
            isFeverMode = false;
            addLog("🧊 오버드라이브가 종료되었습니다.");
            document.body.classList.remove("fever-active");
        }
        comboTimer = 5; // [수정] 감쇠 주기를 조금 더 늦춤
        
        // 콤보 폭발 (cmb_ex)
        if (prestigeUpgrades.cmb_ex > 0 && comboCount < 0.5) {
            const exBonus = getIncome() * 50; 
            money += exBonus;
            showNews("💥 콤보 폭발 보너스 획득!", true);
        }
    }
  }

  // 오버드라이브 진입 체크 (콤보 30 이상)
  if (!isFeverMode && comboCount >= 30) {
      isFeverMode = true;
      showNews("🔥 OVERDRIVE: 시스템이 한계를 넘어 폭주합니다!", true);
      document.body.classList.add("fever-active");
      playFX('fever');
  }
  
  // AI 이벤트 자동 대응 (auto_evt)
  if (prestigeUpgrades.auto_evt > 0 && Math.random() < 0.1) {
      const golden = document.querySelector('.golden-btn');
      if (golden) golden.click();
  }

  // [NaN/Infinity 방어] 수치가 깨졌을 경우 즉시 복구
  if (!isFinite(money) || isNaN(money)) {
      money = 0;
      addLog("⚠️ 시스템 오류 감지: 재화 데이터가 안전하게 복구되었습니다.");
  }

  // [콤보 2.0] 이벤트 발생 확률 보정
  // 마케팅 해금 보너스 + 미국 버프 (+30%)
  let mktBoost = 1 + (prestigeUpgrades.mkt_u > 0 ? 0.5 : 0);
  let countryEventBoost = activeCountries.usa ? 1.3 : 1.0;

  let comboProbBoost = 1 * mktBoost * countryEventBoost * (1 + prestigeUpgrades.evt_c * 0.1);
  if (prestigeUpgrades.mut_evt > 0) comboProbBoost *= 3;
  if (comboCount >= 20) comboProbBoost = 4;
  else if (comboCount >= 10) comboProbBoost = 2.5;
  else if (comboCount >= 5) comboProbBoost = 1.5;

  let baseEventProb = (0.005 + (prestigeUpgrades.marketing * 0.005) + (comboCount * 0.001)) * comboProbBoost;
  if (isFeverMode) baseEventProb *= 2; // 피버 중에는 확률 2배 더 증가

  // 피버 중 확률 보정
  if (Math.random() < (isFeverMode ? 0.05 : 0.01)) spawnGoldenButton();
  
  // 외교 다국적 홍보 (dip_m) 가 있으면 중첩 발생 가능
  const canOverlap = prestigeUpgrades.dip_m > 0;

  if (eventTimer > 0 && !canOverlap) {
      eventTimer--;
      if (eventTimer === 0) {
          eventMultiplier = 1;
          isAiBugged = false;
          addLog("📢 이벤트가 종료되었습니다. 시스템이 정상화됩니다.");
          document.body.style.filter = "none";
      }
  } else {
      if (eventTimer > 0) eventTimer--; // 중첩 허용 시에도 타이머는 깎임
      
      if (Math.random() < baseEventProb) {
          const rand = Math.random();
          if (rand < 0.15 && pr > 0) { // 바이럴 대폭발 (강화)
              const mult = 50 * (1 + prestigeUpgrades.evt_m * 1.0); // 바이럴 효과 극대화 (10x -> 50x)
              // 중첩 시 배수 곱연산
              if (canOverlap && eventTimer > 0) eventMultiplier *= mult;
              else eventMultiplier = mult;
              
              eventTimer = 50 * (1 + prestigeUpgrades.evt_d * 0.1); 
              showNews("🔥 [초특급 바이럴] 전 세계가 우리 제품을 검색하고 있습니다!", true);
              comboCount += 20;
              document.body.style.filter = "sepia(0.5) hue-rotate(-30deg) saturate(2)";
              playFX('viral');
          } else if (rand < 0.25) { // IPO 성공
              const ipoBonus = getIncome() * (prestigeUpgrades.mkt_m > 0 ? 10000 : 5000); // IPO 보상 대폭 상향
              money += ipoBonus;
              totalMoney += ipoBonus;
              showNews("🚀 [IPO 성공] 상장 직후 주가가 폭등하며 거액의 자본이 확보되었습니다!", true);
              playFX('ipo');
              comboCount += 50;
          } else if (rand < 0.45 && management > 0) { // AI 폭주 (신규 긍정 이벤트)
              eventTimer = 40;
              showNews("AI 관리 시스템이 자아를 각성하여 초효율 모드에 진입했습니다!", true);
              document.body.style.filter = "hue-rotate(250deg) brightness(1.1)";
          } else if (rand < 0.55) { // 서버 화재 (위험)
              if (canOverlap && eventTimer > 0) eventMultiplier *= 0.1;
              else eventMultiplier = 0;
              eventTimer = 20;
              showNews("🔥 [서버실 화재] 모든 서비스가 중단되었습니다! 수익이 발생하지 않습니다!");
              document.body.style.filter = "contrast(2) grayscale(1)";
              playFX('fire');
          } else if (rand < 0.8) { // 투자 유치
              const bonus = getIncome() * 100;
              money += bonus;
              totalMoney += bonus;
              showNews(`실리콘밸리의 거물 투자자가 우리 기업에 ${formatNumber(bonus)}원을 쏟아붓습니다!`, true);
              showFloatingText(`+${formatNumber(bonus)}`, '#22c55e', document.getElementById("money"));
              animateElement("card-dev", "flash");
              playFX('upgrade');
          } else if (management > 0) { // AI 버그
              isAiBugged = true;
              eventTimer = 40;
              showNews("중앙 서버실에 화재가 발생하여 AI 관리 기능이 먹통이 되었습니다!");
              document.body.style.filter = "invert(0.1)";
              playFX('fail');
          }

          // 연쇄 반응 (evt_chain)
          if (prestigeUpgrades.evt_chain > 0 && Math.random() < 0.2) {
              setTimeout(() => addLog("🔗 연쇄 반응 발생: 새로운 기회가 즉시 찾아옵니다!"), 500);
              // 다음 루프에서 이벤트가 다시 터질 확률을 높임
          }
      }
  }

  // 시간 기준 수익 보정
  let income = getIncome() * (tickSpeed / 1000);
  
  // Financial: fin_t (고정 수익)
  const finTIncome = prestigeUpgrades.fin_t > 0 ? Math.pow(10, prestigeUpgrades.fin_t + 5) : 0;
  income += finTIncome;

  if (income > 0) {
      money += income;
      totalMoney += income; // 누적 수익 기록
      moneyAccumulator += income; // 소리용 누적
      
      // [수정] 시각적 과부하 감소: 애니메이션 및 텍스트 빈도 조절
      if (Math.random() < 0.1) {
          animateElement('money', 'bounce');
          showFloatingText(`+${formatNumber(income)}`, '#22c55e', document.getElementById("money"));
      }

      // 일정 단위(예: 100원)마다 소리 발생
      const SOUND_THRESHOLD = 100; 
      if (moneyAccumulator >= SOUND_THRESHOLD) {
          playFX('tick');
          moneyAccumulator = 0; // 소리 재생 후 리셋
      }
  }
  
  autoManage();
  updateBG();
}

function updateBG() {
    if (money > 1000000) document.body.style.background = "#fff3e8";
    else if (money > 100000) document.body.style.background = "#e8fff3";
    else document.body.style.background = "#f3f6ff";
}

// =====================
// UI 업데이트
// =====================
let lastState = {}; // 이전 상태 저장용

function updateUI() {
  // 변경된 값만 업데이트하여 DOM 부하 감소
  const currentState = {
    money: formatNumber(money),
    dev, marketing, design, management,
    tickSpeed: tickSpeed.toFixed(2),
    managementActive, priority
  };

  // 해금 로직
  if (document.getElementById("card-pr")) 
    document.getElementById("card-pr").style.display = totalMoney >= 100000 ? "block" : "none";
  if (document.getElementById("card-strategy")) 
    document.getElementById("card-strategy").style.display = totalMoney >= 1000000 ? "block" : "none";

  // 기업 등급 및 시각화 업데이트
  const rank = getCurrentRank();
  const rankEl = document.getElementById("corporateRank");
  const title = document.getElementById("title");
  title.innerText = rank.name + ": 유휴 주식회사";
  rankEl.innerText = rank.name;
  rankEl.style.color = rank.color;
  if (rank.bg) rankEl.style.textShadow = `0 0 10px ${rank.bg}`;

  // 명성 진행도 바
  const nextPointAt = Math.pow(getPotentialPrestige() + 1, 2) * 1000000;
  const progress = (totalMoney / nextPointAt) * 100;
  document.getElementById("prestigeProgress").style.width = Math.min(100, progress) + "%";
  document.getElementById("potentialGain").innerText = getPotentialPrestige();

  // [개선] 콤보 UI 및 게이지 업데이트
  const displayCombo = Math.floor(comboCount);
  document.getElementById("comboCount").innerText = displayCombo;
  document.getElementById("comboCount").style.fontSize = Math.min(2, 1 + displayCombo * 0.05) + "em";
  
  const gaugeWidth = comboCount > 0 ? (comboTimer / 20) * 100 : 0;
  document.getElementById("comboGauge").style.width = gaugeWidth + "%";

  const feverStatus = document.getElementById("feverStatus");
  if (feverStatus) feverStatus.style.display = isFeverMode ? "inline" : "none";

  if (lastState.money !== currentState.money) {
    document.getElementById("money").innerText = currentState.money + "원";
  }
  
  // 이벤트 UI 업데이트
  const eventEl = document.getElementById("eventDisplay");
  if (eventMultiplier > 1) eventEl.innerText = `🔥 SNS 대박 (x${eventMultiplier.toFixed(1)})!`;
  else if (eventMultiplier < 1) eventEl.innerText = `💀 광고 실패 (x${eventMultiplier.toFixed(1)})...`;
  else eventEl.innerText = "";

  // 관리직 해금 여부에 따른 UI 노출 제어
  const hasMgmt = management > 0;
  const mgmtControls = document.getElementById("mgmtControls");
  const mgmtStatusContainer = document.getElementById("mgmtStatusContainer");
  const statMgmtContainer = document.getElementById("statMgmtContainer");

  if (mgmtControls) mgmtControls.style.display = hasMgmt ? "block" : "none";
  if (mgmtStatusContainer) mgmtStatusContainer.style.display = hasMgmt ? "block" : "none";
  if (statMgmtContainer) statMgmtContainer.style.display = hasMgmt ? "list-item" : "none";

  // 외교 패널 업데이트
  const diplomacyPanel = document.getElementById("diplomacyPanel");
  if (diplomacyPanel) {
      const isDipUnlocked = prestigeUpgrades.dip_u > 0;
      diplomacyPanel.style.display = isDipUnlocked ? "block" : "none";
      
      if (isDipUnlocked) {
          // 외교 비용 및 버튼 상태 업데이트
          for (let id in COUNTRIES) {
              const costEl = document.getElementById(`${id}Cost`);
              if (costEl) {
                  const c = COUNTRIES[id].cost;
                  costEl.innerText = formatNumber(c) + "원";
                  costEl.style.color = money >= c ? "#10b981" : "#ef4444"; // 살 수 있으면 초록색, 부족하면 빨간색
              }
          }

          // 상단 활성 국가 아이콘 업데이트
          const indicatorContainer = document.getElementById("countryIndicators");
          if (indicatorContainer) {
              const countryEmojis = { japan: "🇯🇵", korea: "🇰🇷", china: "🇨🇳", usa: "🇺🇸", germany: "🇩🇪", vietnam: "🇻🇳", uk: "🇬🇧", north: "🇰🇵", nuclear: "☢️" };
              let html = "";
              for (let id in activeCountries) {
                  const country = COUNTRIES[id];
                  const timeLeft = activeCountries[id];
                  const totalTime = country.duration * (1 + (prestigeUpgrades.dip_ex || 0) * 0.1);
                  const percent = (timeLeft / totalTime) * 100;
                  
                  html += `
                      <div class="country-badge" style="background: ${country.color}; position: relative; overflow: hidden; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(0,0,0,0.1);">
                          <span>${countryEmojis[id]}</span>
                          <span style="font-size: 10px;">${Math.ceil(timeLeft)}s</span>
                          <div style="position: absolute; bottom: 0; left: 0; height: 3px; background: rgba(255,255,255,0.6); width: ${percent}%;"></div>
                      </div>
                  `;
              }
              indicatorContainer.innerHTML = html;
          }

          const buffEl = document.getElementById("activeBuffs");
          const activeNames = Object.keys(activeCountries).map(id => COUNTRIES[id].name);
          buffEl.innerText = activeNames.length > 0 ? "활성: " + activeNames.join(", ") : "진행 중인 제휴 없음";
      }
  }

  // 관리직 상세 정보 업데이트
  if (hasMgmt && document.getElementById("statMgmt")) {
    document.getElementById("statMgmt").innerText = management + "회 업글/틱";
  }

  // 관리직 버튼 텍스트 변경
  const mgmtBtn = document.getElementById("mgmtBtn");
  if (mgmtBtn) {
    mgmtBtn.innerText = managementActive ? "관리직 AI 중지" : "관리직 AI 가동";
  }

  // 새 메뉴/정보창 데이터 업데이트
  if (document.getElementById("totalIncome")) {
    // "/틱" 중복 제거
    document.getElementById("totalIncome").innerText = formatNumber(getIncome());
  }

  if (document.getElementById("statTotalMoney")) {
    document.getElementById("statTotalMoney").innerText = formatNumber(totalMoney) + "원";
  }

  if (document.getElementById("statPrestige")) {
    document.getElementById("statPrestige").innerText = prestigePoints + " P";
    document.getElementById("prestigeBonus").innerText = "+" + (prestigePoints * 10) + "%";
    document.getElementById("prestigeBonus").innerText = "+" + (prestigePoints * 5) + "%";
  }

  // 상세 스탯 정보
  if (document.getElementById("statDev")) {
    document.getElementById("statDev").innerText = dev + " 단계";
    document.getElementById("statMark").innerText = "x" + Math.pow(1.15, marketing).toFixed(2);
    document.getElementById("statSpeed").innerText = (1000 / tickSpeed).toFixed(2) + "x";
    
    if (pr > 0) {
        document.getElementById("statPrContainer").style.display = "list-item";
        document.getElementById("statPr").innerText = "x" + (1 + pr * 0.1).toFixed(1);
        document.getElementById("statPr").innerText = "x" + (1 + pr * 0.18).toFixed(2);
    }
    if (strategy > 0) {
        document.getElementById("statStratContainer").style.display = "list-item";
        document.getElementById("statStrat").innerText = "x" + Math.pow(1.25, strategy).toFixed(2);
    }
  }

  // 현재 설정 상태
  if (document.getElementById("currentPriority")) {
    const pMap = { auto: "자동", dev: "개발", marketing: "마케팅", design: "설계", pr: "홍보", strategy: "전략" };
    document.getElementById("currentPriority").innerText = pMap[priority] || "자동";
  }
  if (document.getElementById("mgmtStatus")) {
    document.getElementById("mgmtStatus").innerText = managementActive ? "가동 중" : "정지됨";
    document.getElementById("mgmtStatus").style.color = managementActive ? "#10b981" : "#ef4444";
  }

  document.getElementById("devLevel").innerText = dev;
  document.getElementById("marketingLevel").innerText = marketing;
  document.getElementById("designLevel").innerText = design;
  document.getElementById("prLevel").innerText = pr;
  document.getElementById("strategyLevel").innerText = strategy;
  document.getElementById("managementLevel").innerText = management;

  document.getElementById("devCost").innerText = formatNumber(cost(dev, 'dev'));
  document.getElementById("marketingCost").innerText = formatNumber(cost(marketing, 'marketing'));
  document.getElementById("designCost").innerText = formatNumber(cost(design, 'design'));
  document.getElementById("prCost").innerText = formatNumber(cost(pr));
  document.getElementById("strategyCost").innerText = formatNumber(cost(strategy));
  document.getElementById("prCost").innerText = formatNumber(cost(pr, 'pr'));
  document.getElementById("strategyCost").innerText = formatNumber(cost(strategy, 'strategy'));
  document.getElementById("managementCost").innerText = formatNumber(cost(management, 'management'));

  lastState = currentState;
}

function getPotentialPrestige() {
    const progress = Math.max(0, Math.log10(totalMoney + 1) - 7);
    let gain = progress <= 0 ? 0 : Math.floor(3 * Math.pow(progress, 2));
    if (gain > 2500) gain = Math.floor(2500 * Math.pow(gain / 2500, 0.55));
    
    // 신규 스킬: 랜드마크 본사 (infra_b)
    const infraBonus = 1 + (prestigeUpgrades.infra_b * 0.5);
    const globalBonus = 1 + (prestigeUpgrades.gl_h * 1.0);
    
    if (prestigeUpgrades.dip_g > 0) gain = Math.floor(gain * (1 + prestigeUpgrades.dip_g * 0.15));
    if (activeCountries.uk) gain = Math.floor(gain * 1.5);

    // Cosmic: cos_d (명성 획득량 보너스)
    const cosDBonus = 1 + (prestigeUpgrades.cos_d || 0) * 1.0;

    return Math.floor(gain * infraBonus * globalBonus * cosDBonus);
}

// =====================
// 초기 실행
// =====================
applyAudioSettings();
document.getElementById("toggleFxMuteBtn")?.addEventListener("click", toggleFxMute);
document.getElementById("toggleBgmMuteBtn")?.addEventListener("click", toggleBgmMute);

loadGame(); // 저장된 데이터 불러오기
startLoop(); // 게임 루프 시작
setInterval(saveGame, 10000); // 10초마다 자동 저장
window.addEventListener("beforeunload", saveGame); // 창 닫을 때 저장

renderSkillTree(); // 초기 트리 렌더링
initTreeDragging(); // 드래그 활성화

setInterval(() => {
    updateUI();
}, 50);
