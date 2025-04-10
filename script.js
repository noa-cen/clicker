let counter = localStorage.getItem("counter") ? Number.parseInt(localStorage.getItem("counter")) : 0;
let clickPower = Number.parseInt(localStorage.getItem("clickPower")) || 1;
const unlockedItems = JSON.parse(localStorage.getItem("unlockedItems")) || [];
let upgrades = [];
const autoClickIntervals = [];

let recruiters = Number.parseInt(localStorage.getItem("recruiters")) || 0
let propagandists = Number.parseInt(localStorage.getItem("propagandists")) || 0
const recruiterCost = 20 
const propagandistCost = 10 
const costMultiplier = 1.3
let recruiterInterval = null
let propagandistInterval = null
let displayInterval = null

const worldPopulation = 8000000000;


function resetGame() {
  localStorage.removeItem("counter")
  localStorage.removeItem("clickPower")
  localStorage.removeItem("unlockedItems")
  localStorage.removeItem("recruiters")
  localStorage.removeItem("propagandists")
  localStorage.removeItem("agitators")
  localStorage.removeItem("breakers")

  counter = 0
  clickPower = 1
  unlockedItems.length = 0
  recruiters = 0
  propagandists = 0
  agitators = 0
  breakers = 0

  autoClickIntervals.forEach((interval) => clearInterval(interval))
  autoClickIntervals.length = 0

  if (recruiterInterval) clearInterval(recruiterInterval)
  if (propagandistInterval) clearInterval(propagandistInterval)
  if (displayInterval) clearInterval(displayInterval)

  document.getElementById("counter").textContent = counter

  const upgradeContainer = document.getElementById("upgrade-container")
  upgradeContainer.innerHTML = ""

  initGameAfterReset()
}

fetch("upgrades.json")
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
    upgrades = data;
    initGame();
  })
  .catch(function(error) {
    console.error("Erreur de chargement du fichier JSON:" + error);
  });


function saveUnlocked(item) {
  if (!unlockedItems.includes(item)) {
    unlockedItems.push(item);
    localStorage.setItem("unlockedItems", JSON.stringify(unlockedItems));
  }
}

function saveGame() {
  localStorage.setItem("counter", counter)
  localStorage.setItem("clickPower", clickPower)
  localStorage.setItem("unlockedItems", JSON.stringify(unlockedItems))
  localStorage.setItem("recruiters", recruiters)
  localStorage.setItem("propagandists", propagandists)
  localStorage.setItem("agitators", agitators)
  localStorage.setItem("breakers", breakers)
}

function initGame() {
  document.getElementById("counter").textContent = counter;
  document.getElementById("bouton").addEventListener("click", addOne);

  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
    resetButton.addEventListener("click", resetGame);
  }

  unlockedItems.forEach(function(itemId) {
    const upgrade = upgrades.find(function(u) {
      return u.id === itemId;
    });
    if (upgrade) {
      if (upgrade.type === "autoclick") {
        const interval = setInterval(function() {
          counter += upgrade.amount;
          document.getElementById("counter").textContent = counter;
          saveGame();
        }, upgrade.interval);
        autoClickIntervals.push(interval);
      } else if (upgrade.type === "clickPower") {
        clickPower = upgrade.power;
      }
    }
  });

  upgrades.forEach(function(upgrade) {
    if (!unlockedItems.includes(upgrade.id) && counter >= upgrade.cost) {
      showUpgradeButton(upgrade);
    }
  });

  createRecruitersUI();
  createPropagandistsUI();

  startRecruitersEffect();
  startPropagandistsEffect();

  displayInterval = setInterval(updateDisplay, 1000);
}

function initGameAfterReset() {
  document.getElementById("counter").textContent = counter;

  upgrades.forEach(function(upgrade) {
    if (!unlockedItems.includes(upgrade.id) && counter >= upgrade.cost) {
      showUpgradeButton(upgrade);
    }
  });

  createRecruitersUI();
  createPropagandistsUI();

  startRecruitersEffect();
  startPropagandistsEffect();

  displayInterval = setInterval(updateDisplay, 1000);
}

// ADD A REVOLUTIONNAIRE
function addOne() {
  counter += clickPower;
  document.getElementById("counter").textContent = counter;

  saveGame();

  upgrades.forEach(function(upgrade) {
    if (counter >= upgrade.cost && !unlockedItems.includes(upgrade.id)) {
      showUpgradeButton(upgrade);
    }
  });

  updateRecruitersButton();
  updatePropagandistsButton();
}

function showUpgradeButton(upgrade) {
  if (!document.getElementById(upgrade.id)) {
    var btn = document.createElement("button");
    btn.id = upgrade.id;
    btn.textContent = upgrade.label;
    btn.addEventListener("click", function() {
      buyUpgrade(upgrade.id);
    });
    document.getElementById("upgrade-container").appendChild(btn);

    if (unlockedItems.includes(upgrade.id)) {
      btn.disabled = true;
    }
  }
}

function buyUpgrade(upgradeID) {
  var upgrade = upgrades.find(function(u) {
    return u.id === upgradeID;
  });

  if (counter >= upgrade.cost) {
    counter -= upgrade.cost;
    document.getElementById("counter").textContent = counter;
    saveGame();
    saveUnlocked(upgrade.id);

    if (upgrade.type === "autoclick") {
      var interval = setInterval(function() {
        counter += upgrade.amount;
        document.getElementById("counter").textContent = counter;
        saveGame();
      }, upgrade.interval);
      autoClickIntervals.push(interval);
    } else if (upgrade.type === "clickPower") {
      clickPower = upgrade.power;
      saveGame();
    }

    document.getElementById(upgrade.id).disabled = true;
  }
}

// RECRUITER
function createRecruitersUI() {
  var recruiterCountDiv = document.getElementById("recruiter-count");
  recruiterCountDiv.innerHTML = "Recruteurs: <span id='recruiter-value'>" + recruiters + "</span>";

  var recruiterButton = document.getElementById("buy-recruiter");
  recruiterButton.textContent = "Recruter (Coût: " + calculateRecruitCost() + " révolutionnaires)";
  recruiterButton.addEventListener("click", buyRecruiter);

  updateRecruitersButton();
}

function calculateRecruitCost() {
  return Math.floor(recruiterCost * Math.pow(costMultiplier, recruiters));
}

function updateRecruitersButton() {
  var button = document.getElementById("buy-recruiter");
  if (button) {
    var cost = calculateRecruitCost();
    button.textContent = "Recruter (Coût: " + cost + " révolutionnaires)";
    button.disabled = counter < cost;
  }
}

function buyRecruiter() {
  var cost = calculateRecruitCost();
  if (counter >= cost) {
    counter -= cost;
    recruiters++;
    
    document.getElementById("recruiter-value").textContent = recruiters;
    document.getElementById("counter").textContent = counter;
    
    updateRecruitersButton();
    updatePropagandistsButton();
    saveGame();
    // Formation supprimée : l'achat est instantané
  }
}

function startRecruitersEffect() {
  if (recruiterInterval) {
    clearInterval(recruiterInterval);
  }
  recruiterInterval = setInterval(function() {
    if (recruiters > 0) {
      var baseEffect = 0.00033;
      var propagandistBonus = 1 + propagandists * 0.02;
      var recruiterEffect = baseEffect * recruiters * propagandistBonus;
      var newRevolutionaries = Math.floor(counter * recruiterEffect);
      if (newRevolutionaries > 0) {
        counter += newRevolutionaries;
        document.getElementById("counter").textContent = counter;
        saveGame();
      }
    }
  }, 1000);
}

// PROPAGANDIST
function createPropagandistsUI() {
  var propagandistCountDiv = document.getElementById("propagandist-count");
  propagandistCountDiv.innerHTML = "Propagandistes: <span id='propagandist-value'>" + propagandists + "</span>";

  var propagandistButton = document.getElementById("buy-propagandist");
  propagandistButton.textContent = "Former un propagandiste (Coût: " + calculatePropagandistCost() + " recruteurs)";
  propagandistButton.addEventListener("click", buyPropagandist);

  updatePropagandistsButton();
}

function calculatePropagandistCost() {
  return Math.floor(propagandistCost * Math.pow(costMultiplier, propagandists));
}

function updatePropagandistsButton() {
  var button = document.getElementById("buy-propagandist");
  if (button) {
    var cost = calculatePropagandistCost();
    button.textContent = "Former un propagandiste (Coût: " + cost + " recruteurs)";
    button.disabled = recruiters < cost;
  }
}

function buyPropagandist() {
  var cost = calculatePropagandistCost();
  if (recruiters >= cost) {
    recruiters -= cost;
    propagandists++;
    
    document.getElementById("propagandist-value").textContent = propagandists;
    document.getElementById("recruiter-value").textContent = recruiters;
    
    updatePropagandistsButton();
    saveGame();
    // Formation supprimée : l'achat est instantané
  }
}

function startPropagandistsEffect() {
  if (propagandistInterval) {
    clearInterval(propagandistInterval);
  }
  propagandistInterval = setInterval(function() {
    if (propagandists > 0 && recruiters > 0) {
      var baseEffect = 0.000083;
      var propagandistEffect = baseEffect * propagandists;
      var newRecruiters = Math.random() < propagandistEffect ? 1 : 0;
      if (newRecruiters > 0) {
        recruiters += newRecruiters;
        document.getElementById("recruiter-value").textContent = recruiters;
        updatePropagandistsButton();
        saveGame();
      }
    }
  }, 1000);
}

function updateProgressBar() {
  // Calcul du pourcentage = (counter / worldPopulation) * 100
  var percent = (counter / worldPopulation) * 100;
  if (percent > 100) {
    percent = 100;
  }
  var progressBar = document.getElementById("progress-bar");
  progressBar.style.width = percent + "%";
  progressBar.textContent = Math.floor(percent) + "%";
}

/* Mise à jour de la jauge de répression */
function updateRepression() {
  // Calcul du pourcentage de répression en fonction du nombre de révolutionnaires,
  // casseurs et agitateurs. La formule est arbitraire et peut être ajustée.
  var repressionBase = counter + breakers * 100 + agitators * 200;
  var maxRepression = 1000000; // Valeur max arbitraire pour 100% de répression.
  var percent = (repressionBase / maxRepression) * 100;
  if (percent > 100) {
    percent = 100;
  }
  var repressionBar = document.getElementById("repression-bar");
  repressionBar.style.width = percent + "%";
  repressionBar.textContent = Math.floor(percent) + "%";

  // Changement de couleur de la jauge en fonction du pourcentage de répression.
  if (percent < 25) {
    repressionBar.className = "repression-bar repression-low";
  } else if (percent < 50) {
    repressionBar.className = "repression-bar repression-med-low";
  } else if (percent < 75) {
    repressionBar.className = "repression-bar repression-med-high";
  } else {
    repressionBar.className = "repression-bar repression-high";
  }

  // Déclenchement aléatoire d'un malus si la répression dépasse 50%.
  if (percent > 50 && malusActions.length > 0) {
    if (Math.random() < 0.05) { // 5% de chance par mise à jour
      var randomIndex = Math.floor(Math.random() * malusActions.length);
      var malus = malusActions[randomIndex];
      applyMalus(malus);
    }
  }
}

/* Application d'un malus issu du JSON malus */
function applyMalus(malus) {
  // malus est un objet de la forme :
  // { "action": "arrestation", "reduction": {"counter": 10, "recruiters": 1, "clickPower": 1} }
  if (malus.reduction) {
    if (malus.reduction.counter) {
      counter = Math.max(0, counter - malus.reduction.counter);
      document.getElementById("counter").textContent = counter;
    }
    if (malus.reduction.recruiters) {
      recruiters = Math.max(0, recruiters - malus.reduction.recruiters);
      document.getElementById("recruiter-value").textContent = recruiters;
    }
    if (malus.reduction.clickPower) {
      clickPower = Math.max(1, clickPower - malus.reduction.clickPower);
    }
  }
  // Affichage du message de malus
  var malusMessage = document.getElementById("malus-message");
  malusMessage.textContent = "Malus déclenché: " + malus.action;
  // Effacer le message après quelques secondes
  setTimeout(function() {
    malusMessage.textContent = "";
  }, 5000);
}

function updateDisplay() {
  document.getElementById("counter").textContent = Math.floor(counter);
  var recruiterValue = document.getElementById("recruiter-value");
  var propagandistValue = document.getElementById("propagandist-value");
  if (recruiterValue) recruiterValue.textContent = recruiters;
  if (propagandistValue) propagandistValue.textContent = propagandists;

  var recruiterBonus = propagandists * 2;
  var recruiterEfficiency = 2 + recruiterBonus;
  var productionPerMinute = Math.floor(counter * (recruiterEfficiency / 100) * recruiters);

  var statsElement = document.getElementById("stats");
  if (statsElement) {
    while (statsElement.firstChild) {
      statsElement.removeChild(statsElement.firstChild);
    }
    var powerPara = document.createElement("p");
    powerPara.textContent = "Puissance de clic: " + clickPower;
    statsElement.appendChild(powerPara);
    var efficiencyPara = document.createElement("p");
    efficiencyPara.textContent = "Efficacité des recruteurs: " + recruiterEfficiency + "% par minute";
    statsElement.appendChild(efficiencyPara);
    var bonusPara = document.createElement("p");
    bonusPara.textContent = "Bonus des propagandistes: +" + recruiterBonus + "%";
    statsElement.appendChild(bonusPara);
    var productionPara = document.createElement("p");
    productionPara.textContent = "Production par minute: " + productionPerMinute + " révolutionnaires";
    statsElement.appendChild(productionPara);
  }

  upgrades.forEach(function(upgrade) {
    if (counter >= upgrade.cost && !unlockedItems.includes(upgrade.id)) {
      showUpgradeButton(upgrade);
    }
  });

  updateRecruitersButton();
  updatePropagandistsButton();
  updateProgressBar();
  updateRepression();
}