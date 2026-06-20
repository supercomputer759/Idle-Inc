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


function saveUiState() {
    localStorage.setItem('idleInc_contractsCollapsed', String(uiState.contractsCollapsed));
    localStorage.setItem('idleInc_achievementsCollapsed', String(uiState.achievementsCollapsed));
}

function setPanelCollapsed(panelName, collapsed) {
    const isContracts = panelName === "contracts";
    const body = document.getElementById(isContracts ? "contractsBody" : "achievementsBody");
    const btn = document.getElementById(isContracts ? "toggleContractsBtn" : "toggleAchievementsBtn");
    if (!body || !btn) return;

    body.classList.toggle("collapsed", collapsed);
    btn.innerText = isContracts
        ? (collapsed ? "계약 펼치기" : "계약 접기")
        : (collapsed ? "업적 펼치기" : "업적 접기");

    if (isContracts) uiState.contractsCollapsed = collapsed;
    else uiState.achievementsCollapsed = collapsed;

    saveUiState();
}

function toggleContractsPanel() {
    setPanelCollapsed("contracts", !uiState.contractsCollapsed);
}

function toggleAchievementsPanel() {
    setPanelCollapsed("achievements", !uiState.achievementsCollapsed);
}

function setupCollapsiblePanels() {
    setPanelCollapsed("contracts", uiState.contractsCollapsed);
    setPanelCollapsed("achievements", uiState.achievementsCollapsed);
}
