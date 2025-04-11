let counter = localStorage.getItem("counter") ? Number.parseInt(localStorage.getItem("counter")) : 0
let clickPower = Number.parseInt(localStorage.getItem("clickPower")) || 1
const unlockedItems = JSON.parse(localStorage.getItem("unlockedItems")) || []
let upgrades = []
const autoClickIntervals = []

let recruiters = Number.parseInt(localStorage.getItem("recruiters")) || 0
let propagandists = Number.parseInt(localStorage.getItem("propagandists")) || 0
const recruiterCost = 2
const propagandistCost = 5 
const costMultiplier = 1.3
let recruiterInterval = null
let propagandistInterval = null



function hideAllContainersExceptMain() {
  document.querySelectorAll(".game-container").forEach(el => {
    if (!el.classList.contains("main-game-container")) {
      el.classList.add("hidden");
    }
  });
}


function resetGame() {
  // Réinitialisation des données dans le localStorage
  localStorage.setItem("counter", 0);
  localStorage.setItem("clickPower", 1);
  localStorage.setItem("unlockedItems", JSON.stringify([]));
  localStorage.setItem("recruiters", 0);
  localStorage.setItem("propagandists", 0);

  // Remise à zéro des variables globales
  counter = 0;
  clickPower = 1;
  unlockedItems.length = 0;
  recruiters = 0;
  propagandists = 0;

  // Au lieu de vider le container, on met à jour uniquement les valeurs affichées
  updateRecruitersButton();
  updatePropagandistsButton();
  updateRepressionBar();
  updateProgressBar();
  updateDisplay();
  initGameAfterReset();
}


fetch("upgrades.json")
  .then((response) => response.json())
  .then((data) => {
    upgrades = data
    initGame()
  })
  .catch((error) => console.error("Erreur de chargement du fichier JSON:", error))


function saveUnlocked(item) {
  if (!unlockedItems.includes(item)) {
    unlockedItems.push(item)
    localStorage.setItem("unlockedItems", JSON.stringify(unlockedItems))
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
  document.getElementById("counter").textContent = counter
  document.getElementById("bouton").addEventListener("click", addOne)

  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
  resetButton.addEventListener("click", resetGame);
  }

  unlockedItems.forEach((itemId) => {
    const upgrade = upgrades.find((u) => u.id === itemId)
    if (upgrade) {
      if (upgrade.type === "autoclick") {
        const interval = setInterval(() => {
          counter += upgrade.amount
          document.getElementById("counter").textContent = counter
          saveGame()
        }, upgrade.interval)
        autoClickIntervals.push(interval)
      } else if (upgrade.type === "clickPower") {
        clickPower = upgrade.power
      }
    }
  })

  upgrades.forEach((upgrade) => {
    if (!unlockedItems.includes(upgrade.id) && counter >= upgrade.cost) {
      showUpgradeButton(upgrade)
    }
  })

  createRecruitersUI()
  createPropagandistsUI()

  startRecruitersEffect()
  startPropagandistsEffect()

  updateDisplay();
  hideAllContainersExceptMain();
}

function initGameAfterReset() {
  document.getElementById("counter").textContent = counter

  upgrades.forEach((upgrade) => {
    if (!unlockedItems.includes(upgrade.id) && counter >= upgrade.cost) {
      showUpgradeButton(upgrade)
    }
  })

  createRecruitersUI()
  createPropagandistsUI()

  startRecruitersEffect()
  startPropagandistsEffect()

  updateDisplay();
  hideAllContainersExceptMain();
}

// ADD A REVOLUTIONNAIRE
function addOne() {
  counter += clickPower
  document.getElementById("counter").textContent = counter

  saveGame()

  upgrades.forEach((upgrade) => {
    if (counter >= upgrade.cost && !unlockedItems.includes(upgrade.id)) {
      showUpgradeButton(upgrade)
    }
  })

  updateRecruitersButton()
  updatePropagandistsButton()
}

function updateProgressBar() {
  // Calcul du pourcentage : (compteur / 8 000 000 000) * 100
  // On limite à 100% maximum avec Math.min
  const totalPopulation = 10000;
  const progress = Math.min(100, (counter / totalPopulation) * 100);
  
  // Récupérer l'élément de la barre de progression
  const progressBar = document.getElementById("progress-bar");
  
  // Appliquer le style : la largeur correspond au pourcentage calculé
  progressBar.style.width = progress + "%";
  
  // Mettre à jour le texte affiché dans la barre
  progressBar.textContent = Math.floor(progress) + "%";
}

// UPGRADES BUTTON
function showUpgradeButton(upgrade) {
  if (!document.getElementById(upgrade.id)) {
    const btn = document.createElement("button")
    btn.id = upgrade.id
    btn.textContent = upgrade.label
    btn.addEventListener("click", () => buyUpgrade(upgrade.id))
    document.getElementById("special-upgrades").appendChild(btn)

    if (unlockedItems.includes(upgrade.id)) {
      btn.disabled = true
    }
  }
}

// BUY UPGRADES
function buyUpgrade(upgradeID) {
  const upgrade = upgrades.find((u) => u.id === upgradeID)

  if (counter >= upgrade.cost) {
    counter -= upgrade.cost
    document.getElementById("counter").textContent = counter
    saveGame()
    saveUnlocked(upgrade.id)

    if (upgrade.type === "autoclick") {
      const interval = setInterval(() => {
        counter += upgrade.amount
        document.getElementById("counter").textContent = counter
        saveGame()
      }, upgrade.interval)
      autoClickIntervals.push(interval)
    } else if (upgrade.type === "clickPower") {
      clickPower = upgrade.power
      saveGame()
    }

    document.getElementById(upgrade.id).disabled = true
  }
}

// RECRUITER
function createRecruitersUI() {
  const recruiterCountDiv = document.getElementById("recruiter-count")
  recruiterCountDiv.innerHTML = `Recruteurs: <span id="recruiter-value">${recruiters}</span>`

  const recruiterButton = document.getElementById("buy-recruiter")
  recruiterButton.textContent = `Recruter (Coût: ${calculateRecruitCost()} révolutionnaires)`
  recruiterButton.addEventListener("click", buyRecruiter)

  updateRecruitersButton()
}


function calculateRecruitCost() {
  return Math.floor(recruiterCost * Math.pow(costMultiplier, recruiters))
}

function updateRecruitersButton() {
  const button = document.getElementById("buy-recruiter")
  if (button) {
    const cost = calculateRecruitCost()
    button.textContent = `Recruter (Coût: ${cost} révolutionnaires)`
    button.disabled = counter < cost
  }
}

function buyRecruiter() {
  const cost = calculateRecruitCost()
  if (counter >= cost) {
    counter -= cost
    recruiters++
    
    document.getElementById("recruiter-value").textContent = recruiters
    document.getElementById("counter").textContent = counter
    
    updateRecruitersButton()
    updatePropagandistsButton()
    saveGame()
  }
}


function startRecruitersEffect() {
  if (recruiterInterval) {
    clearInterval(recruiterInterval)
  }

  recruiterInterval = setInterval(() => {
    if (recruiters > 0) {
      const baseEffect = 0.00033 
      const propagandistBonus = 1 + propagandists * 0.02
      const recruiterEffect = baseEffect * recruiters * propagandistBonus

      const newRevolutionaries = Math.floor(counter * recruiterEffect)
      if (newRevolutionaries > 0) {
        counter += newRevolutionaries
        document.getElementById("counter").textContent = counter
        saveGame()
      }
    }
  }, 1000) 
}

// PROPAGANDIST
function createPropagandistsUI() {
  const propagandistCountDiv = document.getElementById("propagandist-count")
  propagandistCountDiv.innerHTML = `Propagandistes: <span id="propagandist-value">${propagandists}</span>`

  const propagandistButton = document.getElementById("buy-propagandist")
  propagandistButton.textContent = `Former un propagandiste (Coût: ${calculatePropagandistCost()} recruteurs)`
  propagandistButton.addEventListener("click", buyPropagandist)

  updatePropagandistsButton()
}


function calculatePropagandistCost() {
  return Math.floor(propagandistCost * Math.pow(costMultiplier, propagandists))
}

function updatePropagandistsButton() {
  const button = document.getElementById("buy-propagandist")
  if (button) {
    const cost = calculatePropagandistCost()
    button.textContent = `Former un propagandiste (Coût: ${cost} recruteurs)`
    button.disabled = recruiters < cost
  }
}

function buyPropagandist() {
  const cost = calculatePropagandistCost()
  if (recruiters >= cost) {
    recruiters -= cost
    propagandists++
    
    document.getElementById("propagandist-value").textContent = propagandists
    document.getElementById("recruiter-value").textContent = recruiters
    
    updatePropagandistsButton()
    saveGame()
  }
}


function startPropagandistsEffect() {
  if (propagandistInterval) {
    clearInterval(propagandistInterval)
  }

  propagandistInterval = setInterval(() => {
    if (propagandists > 0 && recruiters > 0) {
      
      const baseEffect = 0.000083 
      const propagandistEffect = baseEffect * propagandists

      const newRecruiters = Math.random() < propagandistEffect ? 1 : 0
      if (newRecruiters > 0) {
        recruiters += newRecruiters
        document.getElementById("recruiter-value").textContent = recruiters
        updatePropagandistsButton()
        saveGame()
      }
    }
  }, 1000) 
}

function updateDisplay() {
  document.getElementById("counter").textContent = Math.floor(counter).toLocaleString('fr-FR');

  const recruiterValue = document.getElementById("recruiter-value")
  const propagandistValue = document.getElementById("propagandist-value")

  if (recruiterValue) recruiterValue.textContent = recruiters
  if (propagandistValue) propagandistValue.textContent = propagandists

  updateProgressBar();

  const recruiterBonus = propagandists * 2
  const recruiterEfficiency = 2 + recruiterBonus
  const productionPerMinute = Math.floor(counter * (recruiterEfficiency / 100) * recruiters)

  const statsElement = document.getElementById("stats")
  if (statsElement) {
    // Nettoyage du contenu actuel
    while (statsElement.firstChild) {
      statsElement.removeChild(statsElement.firstChild)
    }
    const powerPara = document.createElement("p")
    powerPara.textContent = `Puissance de clic: ${clickPower}`
    statsElement.appendChild(powerPara)

    const efficiencyPara = document.createElement("p")
    efficiencyPara.textContent = `Efficacité des recruteurs: ${recruiterEfficiency}% par minute`
    statsElement.appendChild(efficiencyPara)

    const bonusPara = document.createElement("p")
    bonusPara.textContent = `Bonus des propagandistes: +${recruiterBonus}%`
    statsElement.appendChild(bonusPara)

    const productionPara = document.createElement("p")
    productionPara.textContent = `Production par minute: ${productionPerMinute} révolutionnaires`
    statsElement.appendChild(productionPara)
  }

  upgrades.forEach((upgrade) => {
    if (counter >= upgrade.cost && !unlockedItems.includes(upgrade.id)) {
      showUpgradeButton(upgrade)
    }
  })

  
  updateProgressBar();
  checkAndActivateMaluses();
  updateRecruitersButton();
  updatePropagandistsButton();
  updateRepressionBar();
}



// Déclaration globale de la liste des malus
let malusList = [];

// Chargement du fichier JSON contenant les malus
fetch("malus.json")
  .then((response) => response.json())
  .then((data) => {
    malusList = data;
    // Une fois le JSON chargé, vous pouvez lancer votre cycle d'updates
    startMalusCycle();
  })
  .catch((error) => console.error("Erreur lors du chargement du JSON des malus:", error));


// Objet pour suivre quels malus sont actuellement activés
const activeMaluses = {};

// Chargement du fichier JSON contenant les malus
fetch("malus.json")
  .then((response) => response.json())
  .then((data) => {
    malusList = data;
    // Démarrage de la boucle de vérification des malus une fois le JSON chargé
    startMalusCycle();
  })
  .catch((error) => console.error("Erreur lors du chargement du JSON des malus:", error));

function updateRepressionBar() {
  let repressionLevel = counter/(recruiters+propagandists+1);
  repressionLevel += 0.1; // Ajustez la vitesse d'augmentation si nécessaire
  if (repressionLevel > 100) {
    repressionLevel = 100;
    resetGame();
    updateDisplay();
  }

  const repressionBar = document.getElementById("repression-bar");
  // On s'assure que la valeur est comprise entre 0 et 100
  const percent = Math.min(100, Math.max(0, repressionLevel));
  
  // Mise à jour de la largeur de la barre, du texte et déclenche la transition CSS
  repressionBar.style.width = percent + "%";
  repressionBar.textContent = Math.floor(percent) + "%";

  // Retire les anciennes classes de couleur pour pouvoir en ajouter la nouvelle
  repressionBar.classList.remove("repression-low", "repression-med-low", "repression-med-high", "repression-high");

  // Application dynamique de la classe de couleur en fonction des seuils
  if (percent < 25) {
    repressionBar.classList.add("repression-low");
  } else if (percent < 50) {
    repressionBar.classList.add("repression-med-low");
  } else if (percent < 90) {
    repressionBar.classList.add("repression-med-high");
  } else {
    repressionBar.classList.add("repression-high");
  }
}


function checkAndActivateMaluses() {
  // Ici, nous utilisons la même logique que dans updateRepressionBar pour obtenir le pourcentage actuel
  let repressionLevel = counter/(recruiters+propagandists+1);
  repressionLevel += 0.1;
  if (repressionLevel > 100) {
    repressionLevel = 100;
    resetGame();
  }
  const currentRepression = repressionLevel; // Ce pourcentage sert à déclencher les malus
  
  const malusContainer = document.getElementById("maluses");
  if (!malusContainer) return;

  // Pour chaque malus défini dans le JSON, vérifie si son seuil est dépassé et qu'il n'est pas déjà actif
  malusList.forEach(malus => {
    if (currentRepression >= malus.triggerThreshold && !activeMaluses[malus.id]) {
      // Créer un élément pour afficher le malus
      const malusDiv = document.createElement("div");
      malusDiv.id = malus.id;
      malusDiv.textContent = malus.label;
      // Vous pouvez ajouter une classe pour styliser l'affichage des malus, par exemple "malus-item"
      malusDiv.classList.add("malus-item");
      
      // Ajouter l'élément au conteneur
      malusContainer.appendChild(malusDiv);
      
      // Marquer ce malus comme actif et prévoir son retrait après la durée définie
      activeMaluses[malus.id] = setTimeout(() => {
        malusContainer.removeChild(malusDiv);
        delete activeMaluses[malus.id];
      }, malus.duration);
    }
  });
}

function startMalusCycle() {
  setInterval(updateDisplay, 1000);
}
