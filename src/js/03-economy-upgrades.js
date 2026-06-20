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
  const investorMult = getInvestorRepBonus();

  let income = baseIncome * prBoost * strategyBoost * prestigeBonus * devSpecialBonus * comboBonus * eventMultiplier * feverBase * typeBonus * mktMult * countryIncomeMult * conditionalMult * dipOBonus * spaceMult * aiQMult * finMult * reaMult * investorMult * getAchievementIncomeBonus();

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
        if (isSilent) runStats.autoUpgrades++;
        else runStats.manualUpgrades++;
        
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
        evaluateContracts();
        evaluateContracts();
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
