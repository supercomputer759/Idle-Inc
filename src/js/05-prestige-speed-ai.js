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
        runStats.rebirths += 1;
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
        evaluateContracts();
        runStats = createRunStats();
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
