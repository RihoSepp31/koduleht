document.addEventListener("DOMContentLoaded", () => {
  console.log("JavaScript laetud!");
  
  let categories = [], questions = {}, answers = {}, scores = {};
  let usedQuestions = 0, totalQuestions = 0;
  let finalQuestion = "", finalAnswer = "";
  let currentBuzzerTeam = null;
  let questionTimer = null;
  let timeLeft = 10;
  let finalWagers = {};

  // Leiame kõik elemendid
  const setupSection = document.getElementById("setupSection");
  const rulesSection = document.getElementById("rulesSection");
  const startGameBtn = document.getElementById("startGameBtn");
  const showRulesBtn = document.getElementById("showRulesBtn");
  const loadTestQuestionsBtn = document.getElementById("loadTestQuestionsBtn");
  const gameBoard = document.getElementById("gameBoard");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const modal = document.getElementById("questionModal");
  const modalCategory = document.getElementById("modalCategory");
  const modalQuestion = document.getElementById("modalQuestion");
  const modalAnswer = document.getElementById("modalAnswer");
  const modalTeams = document.getElementById("modalTeams");
  const correctBtn = document.getElementById("correctBtn");
  const wrongBtn = document.getElementById("wrongBtn");
  const noAnswerBtn = document.getElementById("noAnswerBtn");
  const showAnswerBtn = document.getElementById("showAnswerBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const finalSection = document.getElementById("finalSection");
  const winnerDisplay = document.getElementById("winnerDisplay");
  const timerDisplay = document.getElementById("timerDisplay");

  // Event listenerid
  if (startGameBtn) startGameBtn.addEventListener("click", setupGame);
  if (showRulesBtn) showRulesBtn.addEventListener("click", showRules);
  if (correctBtn) correctBtn.addEventListener("click", () => evaluateAnswer(true));
  if (wrongBtn) wrongBtn.addEventListener("click", () => evaluateAnswer(false));
  if (noAnswerBtn) {
    noAnswerBtn.addEventListener("click", () => evaluateAnswer(null));
    console.log("noAnswerBtn leitud ja event listener lisatud:", noAnswerBtn);
    console.log("noAnswerBtn praegune stiil:", noAnswerBtn.style.display);
  } else {
    console.log("VIGA: noAnswerBtn elementi ei leitud!");
  }
  if (showAnswerBtn) showAnswerBtn.addEventListener("click", showAnswer);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  // Testküsimuste laadimine
  window.loadQuestionsFromJSON = function() {
    console.log("Laen testküsimused...");
    
    const testData = {
      "categories": [
        {
          "name": "Ajalugu",
          "questions": [
            { "q": "Mis aastal lõppes Teine maailmasõda?", "a": "1945" },
            { "q": "Kes oli esimene Eesti president?", "a": "Konstantin Päts" },
            { "q": "Millal toimus Prantsuse revolutsioon?", "a": "1789" },
            { "q": "Mis riik ründas Poolat 1939?", "a": "Saksamaa" },
            { "q": "Mis sündmus algas 1914. aastal?", "a": "Esimene maailmasõda" }
          ]
        },
        {
          "name": "Geograafia",
          "questions": [
            { "q": "Mis on maailma kõrgeim mägi?", "a": "Everest" },
            { "q": "Mis on Eesti pealinn?", "a": "Tallinn" },
            { "q": "Kui palju mandrit on maailmas?", "a": "7" },
            { "q": "Mis jõgi vooleb läbi Pariisi?", "a": "Seine" },
            { "q": "Mis meri ümbritseb Eestit?", "a": "Läänemeri" }
          ]
        },
        {
          "name": "Teadus",
          "questions": [
            { "q": "Mis keemiline element on H?", "a": "Vesinik" },
            { "q": "Kui palju kromosoome on inimesel?", "a": "46" },
            { "q": "Mis planeet on Päikesesüsteemi suurim?", "a": "Jupiter" },
            { "q": "Kes avastas gravitatsiooni?", "a": "Newton" },
            { "q": "Mis on vee keemiline valem?", "a": "H2O" }
          ]
        },
        {
          "name": "Sport",
          "questions": [
            { "q": "Kui mitu mängijat on jalgpalliväljal ühes tiimis?", "a": "11" },
            { "q": "Mis spordiala on Wimbledon?", "a": "Tennis" },
            { "q": "Kui sageli toimuvad olümpiamängud?", "a": "4 aastat" },
            { "q": "Mis riigis leiutati korvpall?", "a": "USA" },
            { "q": "Kui kõrge on korvpallikorv?", "a": "3,05 meetrit" }
          ]
        },
        {
          "name": "Kultuur",
          "questions": [
            { "q": "Kes maalis Mona Lisat?", "a": "Leonardo da Vinci" },
            { "q": "Mis instrumenti mängis Mozart?", "a": "Klaver" },
            { "q": "Kes kirjutas Hamletit?", "a": "Shakespeare" },
            { "q": "Mis riigis on Taj Mahal?", "a": "India" },
            { "q": "Mis on Eesti rahvuslill?", "a": "Rukkilill" }
          ]
        }
      ],
      "finalQuestion": "Mis on Eesti suurim saar?",
      "finalAnswer": "Saaremaa"
    };

    try {
      // Kategooriad
      testData.categories.forEach((cat, i) => {
        const catIndex = i + 1;
        const catInput = document.getElementById(`category${catIndex}`);
        if (catInput) catInput.value = cat.name;

        cat.questions.forEach((item, j) => {
          const qInput = document.getElementById(`q${catIndex}-${j + 1}`);
          const aInput = document.getElementById(`a${catIndex}-${j + 1}`);
          if (qInput) qInput.value = item.q;
          if (aInput) aInput.value = item.a;
        });
      });

      // Finaalküsimus
      const finalQ = document.getElementById("finalQuestionInput");
      const finalA = document.getElementById("finalAnswerInput");
      if (finalQ) finalQ.value = testData.finalQuestion;
      if (finalA) finalA.value = testData.finalAnswer;

      alert("Testküsimused on laaditud! Sisesta tiimide nimed ja alusta mängu.");
    } catch (err) {
      console.error("Küsimuste laadimine ebaõnnestus:", err);
      alert("Testküsimuste laadimine ebaõnnestus.");
    }
  };

  // Reeglite näitamine
  function showRules() {
    console.log("Näitan reegleid...");
    
    if (setupSection) setupSection.style.display = "none";
    
    const rulesContent = document.getElementById("rulesContent");
    if (rulesContent) {
      rulesContent.innerHTML = `
        <h3>🎯 Mängu eesmärk</h3>
        <p>Kuldvillak on meeskondlik viktoriinimäng, kus eesmärk on koguda võimalikult palju punkte õigete vastustega.</p>
        
        <h3>📋 Mängu kulg</h3>
        <ul>
          <li><strong>5 kategooriat</strong> - igaühes 5 küsimust (100€ - 500€)</li>
          <li><strong>10 sekundit</strong> mõtlemisaega iga küsimuse kohta</li>
          <li>Tiim vajutab nuppu esimesena → saab vastata</li>
          <li><strong>Õige vastus</strong> = punktid juurde</li>
          <li><strong>Vale vastus</strong> = punktid maha</li>
          <li>Kui aeg saab läbi = keegi ei saa punkte</li>
        </ul>
        
        <h3>🏆 Finaalvoor</h3>
        <ul>
          <li>Pärast kõiki küsimusi algab finaalvoor</li>
          <li>Iga tiim panustab osa oma punktidest</li>
          <li><strong>30 sekundit</strong> vastamiseks</li>
          <li>Õige vastus = panus juurde, vale = panus maha</li>
        </ul>
        
        <h3>⚠️ Olulised reeglid</h3>
        <ul>
          <li>Ainult <strong>üks vastus</strong> tiimi kohta</li>
          <li>Esimene nupu vajutaja saab vastata</li>
          <li>Moderaator otsustab vastuse õigsuse</li>
          <li>Võitja on tiim kõige suurema punktisummaga</li>
        </ul>
        
        <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 10px; margin-top: 20px;">
          <h3 style="color: #FFD700;">🎮 Kas olete valmis?</h3>
          <p>Moderaator on küsimused sisestanud. Nüüd saate alustada mängu!</p>
        </div>
      `;
    }
    
    if (rulesSection) rulesSection.classList.remove("hidden");
  }

  function setupGame() {
    finalQuestion = document.getElementById("finalQuestionInput").value.trim();
    finalAnswer = document.getElementById("finalAnswerInput").value.trim();
    categories = []; 
    questions = {}; 
    answers = {}; 
    scores = {};
    usedQuestions = 0; 
    currentBuzzerTeam = null;

    // Kogume tiimid
    for (let i = 1; i <= 4; i++) {
      const name = document.getElementById(`team${i}`)?.value.trim();
      if (name) scores[name] = 0;
    }
    if (Object.keys(scores).length === 0) {
      alert("Lisa vähemalt üks tiim!");
      return;
    }

    // Kogume kategooriad ja küsimused
    for (let i = 1; i <= 5; i++) {
      const cat = document.getElementById(`category${i}`)?.value.trim();
      if (!cat) continue;
      
      categories.push(cat);
      questions[cat] = [];
      answers[cat] = [];
      
      for (let j = 1; j <= 5; j++) {
        const question = document.getElementById(`q${i}-${j}`)?.value.trim() || "[PUUDU]";
        const answer = document.getElementById(`a${i}-${j}`)?.value.trim() || "[PUUDU]";
        questions[cat].push(question);
        answers[cat].push(answer);
      }
    }
    
    totalQuestions = categories.length * 5;
    if (totalQuestions === 0) {
      alert("Lisa vähemalt 1 kategooria küsimustega!");
      return;
    }

    // Peidame reeglite sektsiooni ja näitame mängulauda
    if (rulesSection) rulesSection.classList.add("hidden");
    createGameBoard();
    updateScores();
    if (gameBoard) gameBoard.style.display = "grid";
  }

  function createGameBoard() {
    if (!gameBoard) return;
    gameBoard.innerHTML = "";
    
    // Lisame kategooriad
    categories.forEach(cat => {
      const div = document.createElement("div");
      div.className = "category";
      div.textContent = cat;
      gameBoard.appendChild(div);
    });
    
    // Lisame küsimuste lahtrid
    for (let i = 0; i < 5; i++) {
      categories.forEach(cat => {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = `${(i + 1) * 100} €`;
        cell.dataset.cat = cat;
        cell.dataset.index = i;
        
        const clickHandler = function(event) {
          event.stopPropagation();
          event.preventDefault();
          openModal(cat, i, cell);
        };
        
        cell.addEventListener("click", clickHandler);
        cell.clickHandler = clickHandler;
        gameBoard.appendChild(cell);
      });
    }
  }

  function openModal(cat, idx, cell) {
    if (cell.classList.contains("answered")) return;
    
    stopQuestionTimer();
    
    if (modalCategory) modalCategory.textContent = cat;
    if (modalQuestion) modalQuestion.textContent = questions[cat][idx];
    if (modalAnswer) {
      modalAnswer.textContent = answers[cat][idx];
      modalAnswer.classList.add("hidden");
    }
    if (modalTeams) modalTeams.innerHTML = "";
    currentBuzzerTeam = null;

    // Peidame KÕIK nupud algselt
    if (correctBtn) correctBtn.style.display = "none";
    if (wrongBtn) wrongBtn.style.display = "none";
    if (noAnswerBtn) noAnswerBtn.style.display = "none";
    if (showAnswerBtn) showAnswerBtn.style.display = "inline-block";

    // Loome tiimi nupud
    Object.keys(scores).forEach(team => {
      const btn = document.createElement("button");
      btn.textContent = team;
      btn.addEventListener("click", () => selectTeam(team, btn));
      modalTeams.appendChild(btn);
    });

    if (modal) modal.classList.remove("hidden");
    
    // Salvestame praeguse küsimuse andmed
    modal.dataset.currentCat = cat;
    modal.dataset.currentIdx = idx;
    modal.dataset.currentValue = (parseInt(idx) + 1) * 100;
    modal.currentCell = cell;
    
    startQuestionTimer();
  }

  function selectTeam(team, btn) {
    if (currentBuzzerTeam) return;
    
    currentBuzzerTeam = team;
    stopQuestionTimer();
    
    modalTeams.querySelectorAll("button").forEach(b => {
      b.disabled = true;
      b.style.opacity = b === btn ? "1" : "0.5";
    });
    
    // Näitame hindamisnupud (kuid MITTE "keegi ei vastanud")
    if (correctBtn) correctBtn.style.display = "inline-block";
    if (wrongBtn) wrongBtn.style.display = "inline-block";
    // noAnswerBtn jääb peidettuks, kuna keegi valis vastama
  }

  function startQuestionTimer() {
    timeLeft = 10;
    updateTimerDisplay();
    
    questionTimer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        stopQuestionTimer();
        if (!currentBuzzerTeam) {
          console.log("Aeg sai läbi, näitan vastust ja 'Keegi ei vastanud' nuppu");
          showAnswer();
          
          // Proovime mitut meetodit nupu näitamiseks
          setTimeout(() => {
            const noAnswerButton = document.getElementById("noAnswerBtn");
            if (noAnswerButton) {
              noAnswerButton.style.display = "inline-block";
              noAnswerButton.style.visibility = "visible";
              console.log("'Keegi ei vastanud' nupp peaks nüüd nähtav olema");
            } else {
              console.log("VIGA: noAnswerBtn elementi ikka ei leitud!");
            }
          }, 100);
        }
      }
    }, 1000);
  }

  function stopQuestionTimer() {
    if (questionTimer) {
      clearInterval(questionTimer);
      questionTimer = null;
    }
  }

  function updateTimerDisplay() {
    if (!timerDisplay) return;
    
    timerDisplay.textContent = `Aeg: ${timeLeft}`;
    timerDisplay.classList.remove("warning");
    
    if (timeLeft <= 3) {
      timerDisplay.style.color = "#ff4444";
      timerDisplay.style.fontSize = "28px";
      timerDisplay.style.borderColor = "#ff4444";
      timerDisplay.classList.add("warning");
    } else if (timeLeft <= 5) {
      timerDisplay.style.color = "#ffaa00";
      timerDisplay.style.fontSize = "26px";
      timerDisplay.style.borderColor = "#ffaa00";
    } else {
      timerDisplay.style.color = "#FFD700";
      timerDisplay.style.fontSize = "24px";
      timerDisplay.style.borderColor = "#FFD700";
    }
  }

  function showAnswer() {
    if (modalAnswer) {
      modalAnswer.classList.remove("hidden");
    }
    if (showAnswerBtn) showAnswerBtn.style.display = "none";
    
    // Kui keegi pole vastanud, näitame "Keegi ei vastanud" nuppu
    if (!currentBuzzerTeam && noAnswerBtn) {
      console.log("Näitan 'Keegi ei vastanud' nuppu");
      noAnswerBtn.style.display = "inline-block";
    }
  }

  function evaluateAnswer(correct) {
    stopQuestionTimer();
    
    if (correct !== null && !currentBuzzerTeam) return;
    
    if (modalAnswer && modalAnswer.classList.contains("hidden")) {
      showAnswer();
    }
    
    if (correct !== null && currentBuzzerTeam) {
      const pointValue = parseInt(modal.dataset.currentValue);
      scores[currentBuzzerTeam] += correct ? pointValue : -pointValue;
      playSound(correct ? "correct" : "wrong");
    }
    
    updateScores();

    if (modal.currentCell) {
      modal.currentCell.classList.add("answered");
      modal.currentCell.style.pointerEvents = "none";
      modal.currentCell.style.cursor = "not-allowed";
      if (modal.currentCell.clickHandler) {
        modal.currentCell.removeEventListener("click", modal.currentCell.clickHandler);
      }
      usedQuestions++;
    }

    if (correctBtn) correctBtn.style.display = "none";
    if (wrongBtn) wrongBtn.style.display = "none";
    if (noAnswerBtn) noAnswerBtn.style.display = "none";

    if (correct === null) {
      setTimeout(() => {
        closeModal();
      }, 1000);
    }
  }

  function closeModal() {
    stopQuestionTimer();
    if (modal) modal.classList.add("hidden");
    currentBuzzerTeam = null;
    modal.currentCell = null;
    
    modalTeams.querySelectorAll("button").forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = "1";
    });
    
    if (usedQuestions >= totalQuestions) {
      setTimeout(showFinalSection, 500);
    }
  }

  function updateScores() {
    if (!scoreDisplay) return;
    
    scoreDisplay.innerHTML = "<h3>Skoorid</h3>";
    
    Object.entries(scores).forEach(([team, score]) => {
      const p = document.createElement("p");
      p.textContent = `${team}: ${score} €`;
      if (score > 0) p.style.color = "#90EE90";
      else if (score < 0) p.style.color = "#FFB6C1";
      scoreDisplay.appendChild(p);
    });

    const resetBtn = document.createElement("button");
    resetBtn.textContent = "🔁 Alusta uus mäng";
    resetBtn.onclick = () => location.reload();
    scoreDisplay.appendChild(resetBtn);
    
    if (usedQuestions >= totalQuestions && totalQuestions > 0) {
      const finalBtn = document.createElement("button");
      finalBtn.textContent = "🏆 Alusta finaalvooru";
      finalBtn.className = "final-btn";
      finalBtn.style.background = "linear-gradient(145deg, #FFD700, #FFA500)";
      finalBtn.style.color = "#000";
      finalBtn.style.fontSize = "18px";
      finalBtn.style.fontWeight = "bold";
      finalBtn.style.margin = "10px";
      finalBtn.onclick = () => {
        finalBtn.remove();
        showFinalSection();
      };
      scoreDisplay.appendChild(finalBtn);
    }
  }

  function showFinalSection() {
    if (!finalQuestion || totalQuestions === 0 || !finalSection) return;
    
    finalSection.innerHTML = `
      <h2 class="final-title">Finaalvoor</h2>
      <p>Kõik põhiküsimused on vastatud! Aeg finaalvooru jaoks.</p>
      <button id="startWagerPhaseBtn" class="final-btn">Alusta panustamist</button>
    `;
    
    finalSection.classList.remove("hidden");
    
    document.getElementById("startWagerPhaseBtn").addEventListener("click", startWagerPhase);
  }

  function startWagerPhase() {
    finalSection.innerHTML = `
      <h2 class="final-title">Finaalvoor - Panustamine</h2>
      <p>Moderaator: Küsi tiimidelt panuseid ja sisesta need siia.</p>
    `;
    
    let teamInputs = "";
    Object.keys(scores).forEach(team => {
      teamInputs += `
        <div class="team-wager" style="margin: 15px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px;">
          <h3>${team} (praegune skoor: ${scores[team]} €)</h3>
          <label for="wager-${team}">Panus:</label>
          <input type="number" id="wager-${team}" class="wagerInput" data-team="${team}" 
                 placeholder="Sisesta panus" min="0" style="width: 150px;" />
        </div>`;
    });
    
    finalSection.innerHTML += teamInputs + 
      `<button id="showQuestionBtn" class="final-btn">Näita finaalküsimust</button>`;
    
    document.getElementById("showQuestionBtn").addEventListener("click", showFinalQuestion);
  }

  function showFinalQuestion() {
    const wagers = document.querySelectorAll(".wagerInput");
    let allWagersEntered = true;
    finalWagers = {};
    
    wagers.forEach(input => {
      const team = input.dataset.team;
      const wager = parseInt(input.value) || 0;
      
      if (!input.value || input.value.trim() === "") {
        allWagersEntered = false;
      } else {
        finalWagers[team] = wager;
      }
    });
    
    if (!allWagersEntered) {
      alert("Palun sisesta kõik panused!");
      return;
    }
    
    finalSection.innerHTML = `
      <h2 class="final-title">Finaalküsimus</h2>
      <div class="final-question-container">
        <p class="final-question">${finalQuestion}</p>
      </div>
      <button id="startFinalTimerBtn" class="final-btn timer-btn">▶️ Käivita 30s taimer + muusika</button>
      <div id="finalTimerDisplay" class="final-timer hidden">Aeg: 30</div>
    `;
    
    document.getElementById("startFinalTimerBtn").addEventListener("click", startFinalTimer);
  }

  function startFinalTimer() {
    const btn = document.getElementById("startFinalTimerBtn");
    const timerDisplay = document.getElementById("finalTimerDisplay");
    
    btn.disabled = true;
    btn.textContent = "⏱️ Timer käib...";
    timerDisplay.classList.remove("hidden");
    
    try {
      const finalMusic = document.getElementById("finalMusic");
      if (finalMusic) {
        finalMusic.currentTime = 0;
        finalMusic.play().catch(e => console.log("Finaalmuusika viga:", e));
      }
    } catch (e) {
      console.log("Finaalmuusika viga:", e);
    }
    
    let remaining = 30;
    const interval = setInterval(() => {
      timerDisplay.textContent = `Aeg: ${remaining}`;
      
      if (remaining <= 10) {
        timerDisplay.style.color = "#ff4444";
        timerDisplay.style.fontSize = "32px";
      }
      
      remaining--;
      
      if (remaining < 0) {
        clearInterval(interval);
        
        try {
          const finalMusic = document.getElementById("finalMusic");
          if (finalMusic) finalMusic.pause();
        } catch (e) {}
        
        timerDisplay.textContent = "⏰ AEG LÄBI!";
        timerDisplay.style.color = "#ff0000";
        timerDisplay.style.fontSize = "36px";
        
        finalSection.innerHTML += `
          <div style="text-align: center; margin-top: 30px;">
            <button id="showAnswersBtn" class="final-btn" style="font-size: 20px;">
              📝 Näita vastuseid ja alusta hindamist
            </button>
          </div>
        `;
        
        document.getElementById("showAnswersBtn").addEventListener("click", showAnswerPhase);
      }
    }, 1000);
  }

  function showAnswerPhase() {
    finalSection.innerHTML = `
      <h2 class="final-title">Finaalvooru vastuste hindamine</h2>
      <div class="admin-info">
        <p><strong>Õige vastus:</strong> ${finalAnswer}</p>
        <p><em>Moderaator: Küsi tiimidelt nende vastuseid ja märgi kas need olid õiged.</em></p>
      </div>
    `;
    
    let teamResults = "";
    Object.keys(scores).forEach(team => {
      const wager = finalWagers[team] || 0;
      
      teamResults += `
        <div class="team-result" id="team-${team}" style="margin: 15px 0; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px; border: 2px solid #FFD700;">
          <h3>${team}</h3>
          <p>Skoor enne finaalvooru: <strong>${scores[team]} €</strong></p>
          <p style="color: #FFD700; font-weight: bold; font-size: 18px;">Panustatud: <strong>${wager} €</strong></p>
          <div style="margin: 15px 0;">
            <button class="result-btn correct-result" onclick="markFinalAnswer('${team}', ${wager}, true)">
              ✅ Õige vastus (+${wager} €)
            </button>
            <button class="result-btn wrong-result" onclick="markFinalAnswer('${team}', ${wager}, false)">
              ❌ Vale vastus (-${wager} €)
            </button>
          </div>
          <div id="result-${team}" class="team-result-display"></div>
        </div>`;
    });
    
    finalSection.innerHTML += teamResults + 
      `<button id="showFinalWinnerBtn" class="final-btn" style="display: none; margin-top: 30px; font-size: 20px;">🏆 Näita lõplikku võitjat</button>`;
    
    document.getElementById("showFinalWinnerBtn").addEventListener("click", showFinalWinner);
  }

  window.markFinalAnswer = function(team, wager, correct) {
    scores[team] += correct ? wager : -wager;
    
    const resultDiv = document.getElementById(`result-${team}`);
    const resultText = correct ? 
      `✅ Õige! +${wager} € → Uus skoor: ${scores[team]} €` : 
      `❌ Vale! -${wager} € → Uus skoor: ${scores[team]} €`;
    
    resultDiv.innerHTML = `<p style="font-weight: bold; color: ${correct ? '#90EE90' : '#FFB6C1'}; font-size: 18px;">${resultText}</p>`;
    
    const teamDiv = document.getElementById(`team-${team}`);
    teamDiv.querySelectorAll('.result-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
    
    teamDiv.style.border = `3px solid ${correct ? '#90EE90' : '#FFB6C1'}`;
    teamDiv.style.background = correct ? 'rgba(144, 238, 144, 0.1)' : 'rgba(255, 182, 193, 0.1)';
    
    updateScores();
    
    const unmarkedTeams = document.querySelectorAll('.team-result .result-btn:not(:disabled)');
    if (unmarkedTeams.length === 0) {
      document.getElementById("showFinalWinnerBtn").style.display = "inline-block";
    }
  };

  function showFinalWinner() {
    if (finalSection) finalSection.style.display = "none";
    showWinner();
  }

  function showWinner() {
    let maxScore = -Infinity;
    let winner = null;
    let winners = [];
    
    Object.entries(scores).forEach(([team, score]) => {
      if (score > maxScore) {
        maxScore = score;
        winner = team;
        winners = [team];
      } else if (score === maxScore && score > 0) {
        winners.push(team);
      }
    });
    
    let winnerText;
    if (!winner || maxScore <= 0) {
      winnerText = "🏆 Võitjat ei selgunud<br><small>(pole positiivset skoori)</small>";
    } else if (winners.length === 1) {
      winnerText = `🏆 VÕITJA:<br><strong>${winner}</strong><br><span style="font-size: 0.8em;">${maxScore} €</span>`;
    } else {
      winnerText = `🏆 VIIK!<br><strong>${winners.join(" & ")}</strong><br><span style="font-size: 0.8em;">${maxScore} € kummalgi</span>`;
    }
    
    if (winnerDisplay) {
      winnerDisplay.innerHTML = winnerText;
      winnerDisplay.style.display = "block";
    }
    
    if (winner && maxScore > 0) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = '🎉🎊🏆🎊🎉';
        confetti.style.position = 'fixed';
        confetti.style.top = '20%';
        confetti.style.left = '50%';
        confetti.style.transform = 'translateX(-50%)';
        confetti.style.fontSize = '48px';
        confetti.style.zIndex = '1000';
        confetti.style.animation = 'bounce 2s infinite';
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
      }, 500);
    }
  }

  function playSound(type) {
    try {
      const audio = document.getElementById(type + "Sound");
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Heli mängimine ebaõnnestus:", error);
          });
        }
      }
    } catch (e) {
      console.log("Heli viga:", e);
    }
  }

  // Lisa CSS bounce animatsioon
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
      40% { transform: translateX(-50%) translateY(-20px); }
      60% { transform: translateX(-50%) translateY(-10px); }
    }
  `;
  document.head.appendChild(style);

  console.log("JavaScript seadistus valmis!");
});

console.log("kuldvillak.js fail on laetud");document.addEventListener("DOMContentLoaded", () => {
  console.log("JavaScript laetud!"); // Debug
  
  let categories = [], questions = {}, answers = {}, scores = {};
  let usedQuestions = 0, totalQuestions = 0;
  let finalQuestion = "", finalAnswer = "";
  let currentBuzzerTeam = null;
  let questionTimer = null;
  let timeLeft = 10;
  let finalWagers = {};

  // Leiame elemendid
  const setupSection = document.getElementById("setupSection");
  const rulesSection = document.getElementById("rulesSection");
  const startGameBtn = document.getElementById("startGameBtn");
  const showRulesBtn = document.getElementById("showRulesBtn");
  const loadTestQuestionsBtn = document.getElementById("loadTestQuestionsBtn");

  console.log("Elemendid:", {
    setupSection,
    rulesSection, 
    startGameBtn,
    showRulesBtn,
    loadTestQuestionsBtn
  });

  // Testküsimuste laadimine
  window.loadQuestionsFromJSON = function() {
    console.log("Laen testküsimused...");
    
    const testData = {
      "categories": [
        {
          "name": "Ajalugu",
          "questions": [
            { "q": "Mis aastal lõppes Teine maailmasõda?", "a": "1945" },
            { "q": "Kes oli esimene Eesti president?", "a": "Konstantin Päts" },
            { "q": "Millal toimus Prantsuse revolutsioon?", "a": "1789" },
            { "q": "Mis riik ründas Poolat 1939?", "a": "Saksamaa" },
            { "q": "Mis sündmus algas 1914. aastal?", "a": "Esimene maailmasõda" }
          ]
        },
        {
          "name": "Geograafia",
          "questions": [
            { "q": "Mis on maailma kõrgeim mägi?", "a": "Everest" },
            { "q": "Mis on Eesti pealinn?", "a": "Tallinn" },
            { "q": "Kui palju mandrit on maailmas?", "a": "7" },
            { "q": "Mis jõgi vooleb läbi Pariisi?", "a": "Seine" },
            { "q": "Mis meri ümbritseb Eestit?", "a": "Läänemeri" }
          ]
        },
        {
          "name": "Teadus",
          "questions": [
            { "q": "Mis keemiline element on H?", "a": "Vesinik" },
            { "q": "Kui palju kromosoome on inimesel?", "a": "46" },
            { "q": "Mis planeet on Päikesesüsteemi suurim?", "a": "Jupiter" },
            { "q": "Kes avastas gravitatsiooni?", "a": "Newton" },
            { "q": "Mis on vee keemiline valem?", "a": "H2O" }
          ]
        },
        {
          "name": "Sport",
          "questions": [
            { "q": "Kui mitu mängijat on jalgpalliväljal ühes tiimis?", "a": "11" },
            { "q": "Mis spordiala on Wimbledon?", "a": "Tennis" },
            { "q": "Kui sageli toimuvad olümpiamängud?", "a": "4 aastat" },
            { "q": "Mis riigis leiutati korvpall?", "a": "USA" },
            { "q": "Kui kõrge on korvpallikorv?", "a": "3,05 meetrit" }
          ]
        },
        {
          "name": "Kultuur",
          "questions": [
            { "q": "Kes maalis Mona Lisat?", "a": "Leonardo da Vinci" },
            { "q": "Mis instrumenti mängis Mozart?", "a": "Klaver" },
            { "q": "Kes kirjutas Hamletit?", "a": "Shakespeare" },
            { "q": "Mis riigis on Taj Mahal?", "a": "India" },
            { "q": "Mis on Eesti rahvuslill?", "a": "Rukkilill" }
          ]
        }
      ],
      "finalQuestion": "Mis on Eesti suurim saar?",
      "finalAnswer": "Saaremaa"
    };

    try {
      // Kategooriad
      testData.categories.forEach((cat, i) => {
        const catIndex = i + 1;
        const catInput = document.getElementById(`category${catIndex}`);
        if (catInput) catInput.value = cat.name;

        cat.questions.forEach((item, j) => {
          const qInput = document.getElementById(`q${catIndex}-${j + 1}`);
          const aInput = document.getElementById(`a${catIndex}-${j + 1}`);
          if (qInput) qInput.value = item.q;
          if (aInput) aInput.value = item.a;
        });
      });

      // Finaalküsimus
      const finalQ = document.getElementById("finalQuestionInput");
      const finalA = document.getElementById("finalAnswerInput");
      if (finalQ) finalQ.value = testData.finalQuestion;
      if (finalA) finalA.value = testData.finalAnswer;

      alert("Testküsimused on laaditud! Sisesta tiimide nimed ja alusta mängu.");
    } catch (err) {
      console.error("Küsimuste laadimine ebaõnnestus:", err);
      alert("Testküsimuste laadimine ebaõnnestus.");
    }
  };

  // Reeglite näitamine
 // Seadistuse sektsiooni täiendus - HTML-is muuda ka label tekste:
// "Tiim 1" → "Tiim/Mängija 1"
// "Tiim 2" → "Tiim/Mängija 2" jne

// Reeglite sektsiooni uuendus
function showRules() {
    console.log("Näitan uuendatud reegleid...");
    
    if (setupSection) setupSection.style.display = "none";
    
    const rulesContent = document.getElementById("rulesContent");
    if (rulesContent) {
      rulesContent.innerHTML = `
        <h3>🎯 Mängu eesmärk</h3>
        <p>Kuldvillak on viktoriinimäng, kus eesmärk on koguda võimalikult palju punkte õigete vastustega. Mängida saab nii meeskonniti kui ka üksikult!</p>
        
        <h3>👥 Mängijad</h3>
        <ul>
          <li><strong>Meeskondlik:</strong> 2-4 meeskonda, igaühes 1-4 liiget</li>
          <li><strong>Individuaalne:</strong> 2-4 üksikut mängijat</li>
        </ul>
        
        <h3>📋 Mängu kulg</h3>
        <ul>
          <li><strong>5 kategooriat</strong> - igaühes 5 küsimust (100€ - 500€)</li>
          <li><strong>10 sekundit</strong> mõtlemisaega iga küsimuse kohta</li>
          <li><strong>Märguandmine:</strong> mängunupp, käe tõstmine või kokkuleppeline märk</li>
          <li><strong>Õige vastus</strong> = punktid juurde</li>
          <li><strong>Vale vastus</strong> = punktid maha</li>
          <li>Kui aeg saab läbi = keegi ei saa punkte</li>
        </ul>
        
        <h3>🗣️ Vastamise reeglid - OLULINE!</h3>
        <div style="background: rgba(255, 100, 100, 0.1); padding: 15px; border-radius: 10px; margin: 10px 0;">
          <p><strong>⚠️ Kuldvillakus on küsimused ja vastused vastupidi!</strong></p>
        </div>
        <ul>
          <li><strong>Näide 1:</strong> 
            <ul style="margin-left: 20px;">
              <li><em>Ekraanil:</em> "Ameerika president"</li>
              <li><em>Õige vastus:</em> <strong>"Kes on Joe Biden?"</strong></li>
            </ul>
          </li>
          <li><strong>Näide 2:</strong> 
            <ul style="margin-left: 20px;">
              <li><em>Ekraanil:</em> "Kassi jalgade arv"</li>
              <li><em>Õige vastus:</em> <strong>"Mis on 4?"</strong></li>
            </ul>
          </li>
          <li><strong>Näide 3:</strong> 
            <ul style="margin-left: 20px;">
              <li><em>Ekraanil:</em> "Eesti president"</li>
              <li><em>Õige vastus:</em> <strong>"Kes on Alar Karis?"</strong></li>
            </ul>
          </li>
        </ul>
        <h4>📝 Vastamise reegel:</h4>
        <ul>
          <li><strong>Inimeste/loomade kohta:</strong> "Kes on...?"</li>
          <li><strong>Asjade/nähtuste kohta:</strong> "Mis on...?"</li>
          <li>Moderaator otsustab, kas vastus on õiges vormis</li>
        </ul>
        
        <h3>🎮 Mängunupud vs alternatiivid</h3>
        <ul>
          <li><strong>Kui on mängunupud:</strong> esimene vajutaja saab vastata</li>
          <li><strong>Kui pole mängunuppe:</strong> 
            <ul style="margin-left: 20px;">
              <li>Käe tõstmine (esimene tõstja)</li>
              <li>Hüüdmine "MINA!" või tiimi nimi</li>
              <li>Kokkuleppeline märk (plaksutamine, koputamine)</li>
              <li>Moderaator otsustab, kes oli esimene</li>
            </ul>
          </li>
        </ul>
        
        <h3>🏆 Finaalvoor</h3>
        <ul>
          <li>Pärast kõiki küsimusi algab finaalvoor</li>
          <li>Iga tiim/mängija panustab osa oma punktidest</li>
          <li><strong>30 sekundit</strong> vastamiseks</li>
          <li>Kõik kirjutavad vastuse paberile samaaegselt</li>
          <li>Õige vastus = panus juurde, vale = panus maha</li>
        </ul>
        
        <h3>⚠️ Olulised reeglid</h3>
        <ul>
          <li>Ainult <strong>üks vastus</strong> tiimi/mängija kohta</li>
          <li>Esimene märguandja saab vastata</li>
          <li>Vastus peab sobima küsimuse tüübiga ("kes/mis/millal/kus")</li>
          <li>Moderaator on kohtunik ja tema otsus on lõplik</li>
          <li>Võitja on tiim/mängija kõige suurema punktisummaga</li>
        </ul>
        
        <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 10px; margin-top: 20px;">
          <h3 style="color: #FFD700;">🎮 Kas olete valmis?</h3>
          <p><strong>Meeskonniti:</strong> Arutage omavahel enne vastamist!</p>
          <p><strong>Üksikult:</strong> Usaldage oma esimest mõtet!</p>
          <p><strong>Moderaator:</strong> Küsimused on sisestatud, saate mängu alustada!</p>
        </div>
      `;
    }
    
    if (rulesSection) rulesSection.classList.remove("hidden");
}

  // Event listenerid
  if (showRulesBtn) {
    console.log("Lisab showRules event listener");
    showRulesBtn.addEventListener("click", showRules);
  } else {
    console.error("showRulesBtn ei leitud!");
  }

  // Teised funktsioonid lihtsustatud testimiseks
  console.log("JavaScript seadistus valmis!");
});

// Debug: kontrollime kas skript laeb
console.log("kuldvillak.js fail on laetud");