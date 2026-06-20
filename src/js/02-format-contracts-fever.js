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

function extendFeverTime(ms, source = "manual") {
    if (!isFeverMode || feverCooldownMs > 0) return;
    const multiplier = source === "manual" ? 1 : 0.25;
    feverTimeLeftMs = Math.min(7000, feverTimeLeftMs + ms * multiplier);
}

function recordPlayerAction() {
    lastPlayerActionAt = Date.now();
    extendFeverTime(400, "manual");
}

function getInvestorRepBonus() {
    const achievementBoost = ACHIEVEMENT_DATA
        .filter((achievement) => achievementState.unlocked[achievement.id] && achievement.id.startsWith("contracts_"))
        .reduce((sum, achievement) => sum + achievement.rewardValue, 0);
    return 1 + softcap(contractState.investorRep * 0.03 * (1 + achievementBoost), 2.5, 0.6);
}

function getAchievementIncomeBonus() {
    const incomeBonus = ACHIEVEMENT_DATA
        .filter((achievement) =>
            achievementState.unlocked[achievement.id] &&
            !achievement.id.startsWith("contracts_") &&
            !achievement.id.startsWith("global_")
        )
        .reduce((sum, achievement) => sum + achievement.rewardValue, 0);
    return 1 + incomeBonus;
}

function getAchievementPrestigeBonus() {
    const prestigeBonus = ACHIEVEMENT_DATA
        .filter((achievement) => achievementState.unlocked[achievement.id] && achievement.id.startsWith("global_"))
        .reduce((sum, achievement) => sum + achievement.rewardValue, 0);
    return 1 + prestigeBonus;
}

function evaluateAchievements() {
    let unlockedNow = 0;
    for (const achievement of ACHIEVEMENT_DATA) {
        if (achievementState.unlocked[achievement.id]) continue;
        if (!achievement.check()) continue;
        achievementState.unlocked[achievement.id] = true;
        achievementState.points += 1;
        unlockedNow++;
        addLog(`업적 달성: ${achievement.title} (${achievement.reward})`);
        showNews(`업적 해금: ${achievement.title}`, true);
    }
    return unlockedNow;
}

function renderAchievements() {
    const listEl = document.getElementById("achievementsList");
    const metaEl = document.getElementById("achievementsMeta");
    if (!listEl || !metaEl) return;

    const unlockedCount = ACHIEVEMENT_DATA.filter((achievement) => achievementState.unlocked[achievement.id]).length;
    metaEl.innerText = `해금 ${unlockedCount}/${ACHIEVEMENT_DATA.length} / 영구 수익 x${getAchievementIncomeBonus().toFixed(2)} / 명성 x${getAchievementPrestigeBonus().toFixed(2)}`;

    listEl.innerHTML = ACHIEVEMENT_DATA.map((achievement) => {
        const unlocked = !!achievementState.unlocked[achievement.id];
        return `
            <div class="contract-card ${unlocked ? 'done' : ''}">
                <div class="contract-topline">
                    <span class="contract-badge">업적</span>
                    <span>${unlocked ? '달성' : '진행 중'}</span>
                </div>
                <div class="contract-title">${achievement.title}</div>
                <div class="contract-desc">${achievement.desc}</div>
                <div class="contract-reward">보상: ${achievement.reward}</div>
            </div>
        `;
    }).join("");
}

function getContractTier() {
    if (totalMoney >= 1e9) return 3;
    if (totalMoney >= 1e6) return 2;
    return 1;
}

function makeContract(type, slot = 0) {
    const tier = getContractTier();
    const scale = CONTRACT_TARGET_SCALE[Math.min(slot, CONTRACT_TARGET_SCALE.length - 1)] * Math.max(1, Math.pow(1.18, contractState.completed));
    const incomeBase = Math.max(2500, getIncome() * (20 + tier * 10));
    const rewardMoney = Math.max(2000, incomeBase * (1.6 + slot * 0.5));
    const rewardPrestige = Math.max(0, Math.floor((tier - 1) + slot / 2 + contractState.completed * 0.08));
    const rewardRep = 1 + (slot % 2);

    const templates = {
        income: {
            title: "매출 질주",
            desc: "이번 사이클에서 현금을 끌어모아 투자자를 만족시키세요.",
            target: Math.ceil(incomeBase * scale)
        },
        savings: {
            title: "절약 경영",
            desc: "현금을 일정 수준 이상 보유해 안정성을 증명하세요.",
            target: Math.ceil(Math.max(cost(dev, 'dev'), cost(marketing, 'marketing'), 5000) * (2 + slot) * scale)
        },
        upgrades: {
            title: "개발 파이프라인",
            desc: "시장이 식기 전에 업그레이드를 몰아 진행하세요.",
            target: Math.max(8, Math.ceil((8 + tier * 3) * scale))
        },
        automation: {
            title: "자동화 투자",
            desc: "관리직 역량을 키워 반복 업무를 줄이세요.",
            target: Math.max(1, tier + slot + 1)
        },
        branding: {
            title: "브랜드 캠페인",
            desc: "마케팅과 홍보 역량을 끌어올려 브랜드를 키우세요.",
            target: Math.max(10, Math.ceil((marketing + pr + 5) * 0.5 + (tier * 5) * scale))
        },
        research: {
            title: "연구 투자",
            desc: "개발팀을 성장시켜 미래 수익 기반을 확보하세요.",
            target: Math.max(15, Math.ceil((15 + tier * 10) * scale))
        },
        combo: {
            title: "화제성 시연",
            desc: "콤보를 끌어올려 제품 열기를 증명하세요.",
            target: Math.max(10, Math.ceil((10 + tier * 8) * scale))
        },
        events: {
            title: "헤드라인 메이커",
            desc: "시장 이벤트를 터뜨려 계속 화제의 중심에 서세요.",
            target: Math.max(2, Math.ceil((2 + tier) * scale))
        },
        countries: {
            title: "글로벌 확장",
            desc: "해외 협력을 발동해 사업 반경을 넓히세요.",
            target: Math.max(1, Math.ceil((1 + tier) * Math.max(1, scale * 0.7)))
        },
        management: {
            title: "운영 감사",
            desc: "관리 AI 역량을 키워 이사회를 안심시키세요.",
            target: Math.max(1, tier + slot)
        },
        rebirth: {
            title: "창업자 리셋",
            desc: "환생을 완료해 반복 성장 가능성을 증명하세요.",
            target: 1
        }
    };

    const base = templates[type] || templates.income;
    const start = getRawContractProgress(type);
    return {
        id: `${type}-${Date.now()}-${slot}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        title: base.title,
        desc: base.desc,
        start,
        target: base.target,
        rewardMoney: Math.ceil(rewardMoney),
        rewardPrestige,
        rewardRep,
        done: false
    };
}

function getAvailableContractTypes() {
    const available = ['income', 'savings', 'upgrades', 'combo'];
    if (management > 0 || prestigeUpgrades.mgmt_u > 0) available.push('automation', 'management');
    if (marketing >= 5 || pr > 0 || totalMoney >= 50000) available.push('branding');
    if (dev >= 10 || prestigeUpgrades.dev_u > 0) available.push('research');
    if (prestigeUpgrades.evt_u > 0 || pr > 0 || totalMoney >= 100000) available.push('events');
    if (prestigeUpgrades.dip_u > 0) available.push('countries');
    if (prestigePoints > 0 || totalMoney >= 1000000) available.push('rebirth');
    return available;
}

function generateContracts(resetTimer = true) {
    const pool = getAvailableContractTypes();
    const picks = [];
    const available = [...pool];
    while (picks.length < 3 && available.length > 0) {
        const idx = Math.floor(Math.random() * available.length);
        picks.push(available.splice(idx, 1)[0]);
    }
    while (picks.length < 3) {
        picks.push('income');
    }

    contractState.contracts = picks.map((type, index) => makeContract(type, index));
    if (resetTimer) {
        contractState.nextRefreshAt = Date.now() + CONTRACT_REFRESH_MS;
        contractState.rerollsUsed = 0;
    }
}

function getRawContractProgress(type) {
    switch (type) {
        case 'income':
            return runStats.runIncome;
        case 'savings':
            return money;
        case 'upgrades':
            return runStats.manualUpgrades + runStats.autoUpgrades;
        case 'automation':
            return management;
        case 'branding':
            return marketing + pr;
        case 'research':
            return dev;
        case 'combo':
            return runStats.highestCombo;
        case 'events':
            return runStats.eventsTriggered;
        case 'countries':
            return runStats.countriesActivated;
        case 'management':
            return management;
        case 'rebirth':
            return runStats.rebirths;
        default:
            return 0;
    }
}

function getContractProgress(contract) {
    return Math.max(0, getRawContractProgress(contract.type) - (contract.start || 0));
}

function grantContractReward(contract) {
    money += contract.rewardMoney;
    totalMoney += contract.rewardMoney;
    prestigePoints += contract.rewardPrestige;
    contractState.investorRep += contract.rewardRep;
    contractState.completed += 1;
    contractState.streak += 1;
    addLog(`계약 완료: ${contract.title} (+${formatNumber(contract.rewardMoney)}, +${contract.rewardPrestige}P, +${contract.rewardRep} 평판)`);
    showNews(`계약 완료: ${contract.title}`, true);
}

function evaluateContracts() {
    if (!contractState.contracts.length) {
        generateContracts();
        return;
    }

    let completedThisPass = 0;
    for (const contract of contractState.contracts) {
        if (contract.done) continue;
        if (getContractProgress(contract) >= contract.target) {
            contract.done = true;
            completedThisPass += 1;
            grantContractReward(contract);
        }
    }

    const allDone = contractState.contracts.length > 0 && contractState.contracts.every((contract) => contract.done);
    if (allDone) {
        addLog(`투자 계약 전부 완료. 연속 달성 x${contractState.streak}. 새 계약이 도착했습니다.`);
        generateContracts();
    } else if (completedThisPass === 0 && contractState.nextRefreshAt > 0 && Date.now() >= contractState.nextRefreshAt) {
        contractState.streak = 0;
        generateContracts();
    }
}

function getContractTypeLabel(type) {
    const labels = {
        income: "매출",
        savings: "절약",
        upgrades: "개발",
        automation: "자동화",
        branding: "브랜드",
        research: "연구",
        combo: "화제성",
        events: "미디어",
        countries: "글로벌",
        management: "운영",
        rebirth: "환생"
    };
    return labels[type] || "계약";
}

function getContractRerollCost() {
    return 1 + contractState.rerollsUsed;
}

function formatContractReward(contract) {
    const parts = [`$${formatNumber(contract.rewardMoney)}`];
    if (contract.rewardPrestige > 0) parts.push(`${contract.rewardPrestige}P`);
    parts.push(`${contract.rewardRep} 평판`);
    return parts.join(" / ");
}

function renderContracts() {
    const listEl = document.getElementById("contractsList");
    const metaEl = document.getElementById("contractsMeta");
    const rerollBtn = document.getElementById("rerollContractsBtn");
    if (!listEl || !metaEl || !rerollBtn) return;

    if (!contractState.contracts.length) {
        listEl.innerHTML = `<div class="contract-empty">아직 제안된 계약이 없습니다.</div>`;
        metaEl.innerText = "다음 투자 제안을 기다리는 중입니다.";
        rerollBtn.disabled = false;
        rerollBtn.innerText = "재협상";
        return;
    }

    const secondsLeft = Math.max(0, Math.ceil((contractState.nextRefreshAt - Date.now()) / 1000));
    const rerollCost = getContractRerollCost();
    metaEl.innerText = `평판 x${getInvestorRepBonus().toFixed(2)} / ${contractState.investorRep}점 / 연속 ${contractState.streak}회 / 갱신 ${secondsLeft}초`;
    rerollBtn.disabled = prestigePoints < rerollCost;
    rerollBtn.innerText = `재협상 (${rerollCost}P)`;

    listEl.innerHTML = contractState.contracts.map((contract) => {
        const progress = Math.min(contract.target, getContractProgress(contract));
        const percent = Math.max(0, Math.min(100, (progress / contract.target) * 100));
        return `
            <div class="contract-card ${contract.done ? 'done' : ''}">
                <div class="contract-topline">
                    <span class="contract-badge">${getContractTypeLabel(contract.type)}</span>
                    <span>${contract.done ? '완료' : '진행 중'}</span>
                </div>
                <div class="contract-title">${contract.title}</div>
                <div class="contract-desc">${contract.desc}</div>
                <div class="contract-progress">
                    <div class="contract-progress-bar" style="width: ${percent}%;"></div>
                </div>
                <div class="contract-progress-text">${formatNumber(progress)} / ${formatNumber(contract.target)}</div>
                <div class="contract-reward">보상: ${formatContractReward(contract)}</div>
            </div>
        `;
    }).join("");
}

function rerollContracts() {
    const rerollCost = getContractRerollCost();
    if (prestigePoints < rerollCost) {
        alert(`계약 재협상에는 명성 ${rerollCost}P가 필요합니다.`);
        return;
    }
    prestigePoints -= rerollCost;
    contractState.rerollsUsed += 1;
    contractState.streak = 0;
    generateContracts();
    updateUI();
    addLog(`투자 위원회가 새 계약을 제안했습니다. (-${rerollCost}P)`);
}

function endFeverMode(applyPenalty = true) {
    if (!isFeverMode) return;
    isFeverMode = false;
    feverTimeLeftMs = 0;
    feverCooldownMs = 10000;
    document.body.classList.remove("fever-active");

    if (applyPenalty) {
        comboCount = Math.floor(comboCount * 0.3);
        comboTimer = Math.min(comboTimer, 4);
        addLog("⚡ 오버드라이브 종료: 시스템이 식으며 콤보가 크게 감소했습니다.");
    } else {
        addLog("⚡ 오버드라이브 종료");
    }
}
