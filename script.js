// =====================
// 기본 상태
// =====================
let money = 100;
let totalMoney = 100; // 총 누적 수익 추가
let prestigePoints = 0; // 환생 포인트 추가
let prestigeUpgrades = {
    dev_u: 0, dev_c: 0, dev_m: 0, dev_s: 0, dev_t: 0,
    mkt_u: 0, mkt_c: 0, mkt_m: 0, mkt_s: 0,
    des_u: 0, des_c: 0, des_t: 0, des_s: 0,
    mgmt_u: 0, mgmt_p: 0, mgmt_h: 0,
    pr_u: 0, pr_c: 0, pr_s: 0,
    dip_u: 0, dip_g: 0, dip_m: 0, dip_o: 0,
    evt_u: 0, evt_c: 0, evt_d: 0, evt_m: 0, evt_chain: 0,
    cmb_u: 0, cmb_k: 0, cmb_b: 0, cmb_ai: 0, cmb_j: 0, cmb_ex: 0,
    auto_u: 0, auto_spd: 0, auto_evt: 0, auto_inf: 0,
    mut_u: 0, mut_spd: 0, mut_evt: 0, mut_idle: 0,
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
    mgmt_u: { x: 0, y: 120, parent: 'core', cost: 2, name: "🤖 워크플로우 자동화", desc: "반복적인 결제 프로세스를 자동화합니다.", effect: "관리직 AI 기능을 해금합니다.", maxLevel: 1 },
    mgmt_p: { x: -60, y: 190, parent: 'mgmt_u', cost: 5, name: "💳 서버 용량 증설", desc: "AI가 더 많은 일을 처리하도록 합니다.", effect: "관리직의 한 틱당 최대 구매 횟수가 증가합니다.", maxLevel: 10 },
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
    
    // 자동화
    auto_u: { x: 0, y: 300, parent: 'mgmt_u', cost: 5, name: "🧠 자율 운영", desc: "AI가 독립적으로 판단합니다.", effect: "자동화 효율이 크게 증가합니다.", maxLevel: 1 },
    auto_spd: { x: -80, y: 370, parent: 'auto_u', cost: 10, name: "⚡ 고속 처리", desc: "AI 반응 속도가 향상됩니다.", effect: "AI 업그레이드 속도가 증가합니다.", maxLevel: 10 },
    auto_evt: { x: 0, y: 370, parent: 'auto_u', cost: 15, name: "🎲 이벤트 대응", desc: "AI가 기회를 놓치지 않습니다.", effect: "AI가 이벤트에도 반응합니다.", maxLevel: 1 },
    auto_inf: { x: 80, y: 370, parent: 'auto_u', cost: 25, name: "♾️ 무한 확장", desc: "AI는 멈추지 않습니다.", effect: "AI가 모든 업그레이드를 자동으로 관리합니다.", maxLevel: 1, type: 'transform' },
    
    // 변형
    mut_u: { x: 0, y: -520, parent: 'evt_chain', cost: 20, name: "⚠️ 시스템 재설계", desc: "기본 규칙을 다시 정의합니다.", effect: "게임 시스템 변형이 가능합니다.", maxLevel: 1 },
    mut_spd: { x: -80, y: -590, parent: 'mut_u', cost: 25, name: "⏩ 시간 압축", desc: "시간 흐름이 빨라집니다.", effect: "틱 속도가 2배가 되지만 기본 수익이 감소합니다.", maxLevel: 1, type: 'transform' },
    mut_evt: { x: 0, y: -590, parent: 'mut_u', cost: 25, name: "🎯 이벤트 집중", desc: "모든 것을 기회에 걸어봅니다.", effect: "기본 수익 제거, 이벤트 수익 극대화", maxLevel: 1, type: 'transform' },
    mut_idle: { x: 80, y: -590, parent: 'mut_u', cost: 25, name: "😴 완전 방치", desc: "모든 것을 자동에 맡깁니다.", effect: "클릭 효율 감소, AI 효율 극대화", maxLevel: 1, type: 'transform' }
};

const COUNTRIES = {
    japan: { name: "일본", cost: 1, duration: 30, color: "#ff4d4d" },
    china: { name: "중국", cost: 300, duration: 30, color: "#ffd700" },
    usa: { name: "미국", cost: 500, duration: 30, color: "#3b82f6" },
    nuclear: { name: "특수", cost: 1000000000, duration: 1, color: "#444" }
};

let activeCountries = {}; // { id: timer }
let comboCount = 0;
let comboTimer = 0;
let isFeverMode = false;
let feverTimer = 0;
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

// 기업 등급 정의
const RANKS = [
    { minP: 0, name: "구멍가게", color: "#666" },
    { minP: 5, name: "동네 상점", color: "#3b82f6" },
    { minP: 20, name: "유망 스타트업", color: "#10b981" },
    { minP: 100, name: "중견 기업", color: "#f59e0b" },
    { minP: 500, name: "유니콘 기업", color: "#a855f7" },
    { minP: 2000, name: "글로벌 대기업", color: "#ef4444" },
    { minP: 10000, name: "은하계 독점기업", color: "#000", bg: "gold" }
];

function getCurrentRank() {
    return [...RANKS].reverse().find(r => prestigePoints >= r.minP) || RANKS[0];
}

// =====================
// FX & 사운드 세팅 (파일이 없을 경우 대비하여 예외처리)
// =====================
const sounds = {
    upgrade: new Audio("src/audio/upgrade.mp3"),
    tick: new Audio("src/audio/pop.mp3"),
    fail: new Audio("src/audio/fail.mp3"),
    viral: new Audio("src/audio/ipo.mp3"), // SNS 대박
    ipo: new Audio("src/audio/ipo.mp3"),     // IPO/돈 관련
    fire: new Audio("src/audio/error.mp3"),   // 화재/위험
    fever: new Audio("src/audio/jackpot.mp3"), // 오버드라이브 진입
    jackpot: new Audio("src/audio/cash.mp3"), // 골든 버튼
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

    if (fxBtn) {
        fxBtn.innerText = `효과음: ${audioSettings.fxMuted ? '꺼짐' : '켜짐'}`;
    }
    if (bgmBtn) {
        bgmBtn.innerText = `BGM: ${audioSettings.bgmMuted ? '꺼짐' : '켜짐'}`;
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
// 비용 공식
// =====================
function cost(level, type) {
  let baseCost = Math.floor(20 * Math.pow(1.5, level));
  
  // 외교 버프 (일본: 비용 -10%)
  let countryDiscount = activeCountries.japan ? 0.9 : 1.0;
  // 중국 버프 (생산 증가 대신 비용 +20%)
  let countryPenalty = activeCountries.china ? 1.2 : 1.0;

  // 부서별 할인 명성 스킬 적용
  const discountKey = { dev: 'dev_c', marketing: 'mkt_c', design: 'des_c', pr: 'pr_c' }[type];
  let prestigeDiscount = Math.pow(0.90, prestigeUpgrades[discountKey] || 0);
  
  let strategyDiscount = 1 - (strategy * 0.03); // 레벨당 3% 할인 (전략팀 버프)
  
  // 관리직 비용은 별도 스케일링
  if (type === 'management') baseCost = Math.floor(100 * Math.pow(10, level));

  // 최소 할인 한도 10% 설정
  let finalDiscount = Math.max(0.1, prestigeDiscount * strategyDiscount);
  return Math.floor(baseCost * finalDiscount * countryDiscount * countryPenalty);
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

// =====================
// 수익 공식
// =====================
function getIncome() {
  // 지수 성장 + 명성 + [홍보/전략 시너지] + [이벤트 배수] 통합 공식 (레벨당 명성 보너스 강화)
  // SKILL_DATA에 전략(str) 관련 명성 스킬이 없으므로 기본값 0.05 사용
  const prestigeMult = 0.05;
  const prestigeBonus = 1 + (prestigePoints * prestigeMult);
  
  // [회사 방향 보너스]
  let typeBonus = 1;
  if (prestigeUpgrades.companyType === 'startup') typeBonus = 1.2; // 스타트업은 기본수익 +20%

  // [외교 보너스]
  let countryIncomeMult = 1;
  if (activeCountries.china) countryIncomeMult *= 1.5;
  if (activeCountries.usa) countryIncomeMult *= 1.2;
  // [국가 시너지] 중국 + 미국 = 생산 폭발 (추가 x1.5)
  if (activeCountries.china && activeCountries.usa) countryIncomeMult *= 1.5;

  // 개발 특화 보너스
  let devSpecialBonus = 1 + (prestigeUpgrades.dev_m * 0.5);
  
  // 크리티컬 확률 (Dev Tier 2)
  if (prestigeUpgrades.dev_t > 0 && Math.random() < (0.1 * prestigeUpgrades.dev_t)) {
      devSpecialBonus *= 5;
  }
  
  // [밸런스 패치] 마케팅 효과 너프 (지수 성장에서 선형 성장으로 변경하여 폭주 방지)
  let baseIncome = (dev * 8) * (1 + marketing * 0.2) * (prestigeUpgrades.mut_evt > 0 ? 0 : 1) * (prestigeUpgrades.mut_spd > 0 ? 0.6 : 1); 

  // 홍보팀 & 마케팅 스킬 시너지
  let prBoost = 1 + (pr * 0.25);
  const mktMult = Math.pow(2, prestigeUpgrades.mkt_m); // 마케팅 Tier 2 효과 (중첩 시 2배씩 증가)

  let strategyBoost = 1 + (strategy * 0.1); // 전략팀: 전체 효율 (레벨당 10%)

  // 콤보 보너스 (1콤보당 2%)
  let comboBonus = 1 + (comboCount * (0.02 + prestigeUpgrades.cmb_b * 0.01));
  
  // 피버 모드 시 추가 5배 보너스
  let feverBase = isFeverMode ? 5 : 1;
  // AI 폭주 스킬 (ai3)
  if (isFeverMode && prestigeUpgrades.mgmt_h > 0) feverBase *= 2;

  let income = baseIncome * prBoost * strategyBoost * prestigeBonus * devSpecialBonus * comboBonus * eventMultiplier * feverBase * typeBonus * mktMult * countryIncomeMult;
  
  // [수익 소프트 캡] 수익이 10억(1e9)을 넘어가면 성장 속도를 0.75제곱으로 감쇠
  return income > 1e9 ? 1e9 * Math.pow(income / 1e9, 0.75) : income;
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
        alert("??");
        return;
    }

    // 최대 레벨 체크
    if (prestigeUpgrades[id] >= (skill.maxLevel || 1)) {
        alert("이미 최대 레벨에 도달했습니다!");
        return;
    }

    // 종속성 체크
    if (skill.parent && skill.parent !== 'core' && prestigeUpgrades[skill.parent] === 0) {
        alert("선행 스킬이 필요합니다!");
        return;
    }

    let actualCost = skill.cost;

    if (prestigePoints >= actualCost) {
        prestigePoints -= actualCost;
        prestigeUpgrades[id]++;
        
        addLog(`🌳 스킬 강화: [${skill.name}] Lv.${prestigeUpgrades[id]} 달성!`);
        renderSkillTree(); // 트리 재렌더링
        updateUI();
    } else {
        alert("명성 포인트가 부족합니다!");
    }
}

// [방사형 트리 렌더링 엔진]
function isSkillOwned(id) {
    return id === 'core' || prestigeUpgrades[id] > 0;
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
        if (isOwned && !isCore) {
            levelTag = `<div class="level-tag">Lv.${prestigeUpgrades[id]}</div>`;
        }
        node.innerHTML = `<span>${skill.name}</span>${levelTag}`;
        
        if (!isOwned && !isLocked && !isCore) {
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
    if (id === 'core') return;
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
            selectNode(selectedNodeId || id); // 구매 후 UI 갱신
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
        money -= country.cost;
        
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
            activeCountries[id] = country.duration;
            showNews(`🌍 ${country.name}와(과) 전략적 제휴를 체결했습니다! (30초)`, true);
            playFX('ipo');
        }
        updateUI();
    } else {
        alert("외교 비용이 부족합니다!");
    }
}

function updateDiplomacyTimers() {
    for (let id in activeCountries) {
        activeCountries[id]--;
        if (activeCountries[id] <= 0) {
            delete activeCountries[id];
            addLog(`🌍 ${COUNTRIES[id].name}와의 제휴 기간이 만료되었습니다.`);
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
// 오프라인 수익
// =====================
function handleOfflineEarnings() {
    const now = Date.now();
    const lastSave = localStorage.getItem('idleInc_lastSave') || now;
    const diff = (now - lastSave) / 1000; // 초 단위

    if (diff > 60) { // 1분 이상 부재 시
        const offlineRate = 0.1; // 기본 10% 적립
        const earnings = getIncome() * diff * offlineRate;
        if (earnings > 0) {
            money += earnings;
            totalMoney += earnings;
            document.getElementById("offlineEarnings").innerText = formatNumber(earnings);
            document.getElementById("offlineModal").style.display = "flex";
        }
    }
    
    // 저장 루프 시작
    setInterval(() => {
        localStorage.setItem('idleInc_lastSave', Date.now());
    }, 5000);
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
    let gain = Math.floor(Math.sqrt(totalMoney / 10000000));
    if (prestigeUpgrades.dip_g > 0) gain = Math.floor(gain * (1 + prestigeUpgrades.dip_g * 0.2));
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
  let designEffect = 0.2 + (prestigeUpgrades.des_t * 0.1);
  tickSpeed = (1000 / (1 + design * designEffect)) * (prestigeUpgrades.mut_spd > 0 ? 0.5 : 1);
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
  if (!managementActive || isAiBugged || (management <= 0 && prestigeUpgrades.mgmt_u === 0)) return;

  // [명성 상점: 서버(ai1)] + [전략기획팀] 효과로 AI 처리량 계산
  let aiCapacity = (management + (prestigeUpgrades.mgmt_p * 2) + Math.floor(strategy * 0.15) + (prestigeUpgrades.auto_spd * 2)) * (prestigeUpgrades.mut_idle > 0 ? 2 : 1);
  // [관리직 제한] 한 틱당 최대 행동을 10회로 제한하여 경제 붕괴 방지
  if (prestigeUpgrades.auto_inf === 0) aiCapacity = Math.min(aiCapacity, 10);

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

  if (comboCount > 0) {
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
          const mult = 10 * (1 + prestigeUpgrades.evt_m * 0.5);
          // 중첩 시 배수 곱연산
          if (canOverlap && eventTimer > 0) eventMultiplier *= mult;
          else eventMultiplier = mult;
          
          eventTimer = 50 * (1 + prestigeUpgrades.evt_d * 0.1); 
          showNews("🔥 [초특급 바이럴] 전 세계가 우리 제품을 검색하고 있습니다!", true);
          comboCount += 20;
          document.body.style.filter = "sepia(0.5) hue-rotate(-30deg) saturate(2)";
          playFX('viral');
      } else if (rand < 0.25) { // IPO 성공
          const ipoBonus = getIncome() * (prestigeUpgrades.mkt_m > 0 ? 2000 : 1000);
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
  }

  // 시간 기준 수익 보정
  let income = getIncome() * (tickSpeed / 1000);
  
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
  if (eventMultiplier > 1) eventEl.innerText = `🔥 SNS 대박 (x5.0)!`;
  else if (eventMultiplier < 1) eventEl.innerText = `💀 광고 실패 (x0.2)...`;
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
          // 외교 비용 실시간 업데이트 및 버튼 상태 제어
          for (let id in COUNTRIES) {
              const costEl = document.getElementById(`${id}Cost`);
              if (costEl) {
                  const c = COUNTRIES[id].cost;
                  costEl.innerText = formatNumber(c) + "원";
                  costEl.style.color = money >= c ? "#10b981" : "#ef4444"; // 살 수 있으면 초록색, 부족하면 빨간색
              }
          }

          // 활성화된 버프 표시
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
  }

  // 상세 스탯 정보
  if (document.getElementById("statDev")) {
    document.getElementById("statDev").innerText = dev + " 단계";
    document.getElementById("statMark").innerText = "x" + Math.pow(1.15, marketing).toFixed(2);
    document.getElementById("statSpeed").innerText = (1000 / tickSpeed).toFixed(2) + "x";
    
    if (pr > 0) {
        document.getElementById("statPrContainer").style.display = "list-item";
        document.getElementById("statPr").innerText = "x" + (1 + pr * 0.1).toFixed(1);
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
  document.getElementById("managementCost").innerText = formatNumber(cost(management, 'management'));

  lastState = currentState;
}

// =====================
// 초기 실행
// =====================
applyAudioSettings();
document.getElementById("toggleFxMuteBtn")?.addEventListener("click", toggleFxMute);
document.getElementById("toggleBgmMuteBtn")?.addEventListener("click", toggleBgmMute);
startLoop();
handleOfflineEarnings();
renderSkillTree(); // 초기 트리 렌더링
initTreeDragging(); // 드래그 활성화

// [수정] UI 업데이트는 로직과 별개로 항상 빠르게(0.05초마다) 실행
// 돈이 실시간으로 흐르는 것처럼 보이게 하고, 클릭 반응성을 극대화합니다.
setInterval(() => {
    updateUI();
}, 50);
