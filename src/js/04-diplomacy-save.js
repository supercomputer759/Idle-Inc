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
            runStats.countriesActivated += 1;
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
        const isAutoClick = btn.dataset.autoClick === "true";
        const reward = getIncome() * 300 * (1 + prestigeUpgrades.cmb_j * 0.5); // 300틱 분량 수익
        money += reward;
        totalMoney += reward;
        comboCount += isAutoClick ? 2 : 5;
        if (!isAutoClick) runStats.goldenClicks += 1;
        extendFeverTime(isAutoClick ? 120 : 400, isAutoClick ? "auto" : "manual");
        showFloatingText(`JACKPOT! +${formatNumber(reward)}`, '#f59e0b', btn);
        playFX('jackpot');
        evaluateContracts();
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
        rs: runStats,
        cs: contractState,
        ach: achievementState,
        ui: uiState,
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
    if (!encoded) {
        generateContracts();
        return;
    }
    const data = decode(encoded);
    if (!data) {
        generateContracts();
        return;
    }

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
    runStats = { ...createRunStats(), ...(data.rs || {}) };
    contractState = { ...createContractState(), ...(data.cs || {}) };
    achievementState = { ...createAchievementState(), ...(data.ach || {}) };
    achievementState.unlocked = achievementState.unlocked || {};
    uiState = { ...uiState, ...(data.ui || {}) };
    contractState.contracts = Array.isArray(contractState.contracts) ? contractState.contracts : [];
    if (!contractState.nextRefreshAt || Date.now() >= contractState.nextRefreshAt || contractState.contracts.length === 0) {
        contractState.streak = contractState.contracts.length > 0 ? contractState.streak : 0;
        generateContracts();
    }

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
