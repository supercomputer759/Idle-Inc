// =====================
// 게임 루프
// =====================
function gameLoop() {
  updateDiplomacyTimers();
  runStats.highestCombo = Math.max(runStats.highestCombo, Math.floor(comboCount));

  if (comboCount > 0 && prestigeUpgrades.rea_q === 0) {
    if (comboTimer > 0) {
        comboTimer--;
    } else {
        // [개선] 타이머가 끝나면 콤보가 지속적으로 감쇠됨
        const decayRate = prestigeUpgrades.mkt_m > 0 ? 0.95 : 0.8; 
        comboCount *= decayRate;
        
        if (comboCount < 0.5) comboCount = 0;
        
        if (isFeverMode && comboCount < 20) {
            endFeverMode(false);
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
  if (isFeverMode) baseEventProb *= 1.35; // 피버 중 확률은 짧고 강하게만 보정

  // 피버 중 확률 보정
  if (Math.random() < (isFeverMode ? 0.025 : 0.01)) spawnGoldenButton();
  
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
          runStats.eventsTriggered += 1;
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
      runStats.runIncome += income;
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
  evaluateContracts();
  evaluateAchievements();
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
  renderContracts();
  renderAchievements();

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

    return Math.floor(gain * infraBonus * globalBonus * cosDBonus * getAchievementPrestigeBonus());
}

// =====================
// 초기 실행
// =====================
applyAudioSettings();
document.getElementById("toggleFxMuteBtn")?.addEventListener("click", toggleFxMute);
document.getElementById("toggleBgmMuteBtn")?.addEventListener("click", toggleBgmMute);

loadGame(); // 저장된 데이터 불러오기
setupCollapsiblePanels(); // 접기/펼치기 UI 상태 적용
startLoop(); // 게임 루프 시작
setInterval(saveGame, 10000); // 10초마다 자동 저장
window.addEventListener("beforeunload", saveGame); // 창 닫을 때 저장

renderSkillTree(); // 초기 트리 렌더링
initTreeDragging(); // 드래그 활성화

if (contractState.contracts.length === 0) generateContracts();
setInterval(() => {
    updateUI();
}, 50);
