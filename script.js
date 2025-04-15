let counter = parseInt(localStorage.getItem("counter")) || 0;
let clickPower = Number.parseInt(localStorage.getItem("clickPower")) || 1

let unlockedItems = [];
try {
  unlockedItems = JSON.parse(localStorage.getItem("unlockedItems")) || [];
} catch (e) {
  unlockedItems = [];
}

let repressionLevel = 1;

let upgrades = []
let autoClickBonus = 0;

let recruiters = Number.parseInt(localStorage.getItem("recruiters")) || 0
let propagandists = Number.parseInt(localStorage.getItem("propagandists")) || 0
const recruiterCost = 2;
const propagandistCost = 5;
const costMultiplier = 1.125;
let recruiterInterval = null
let propagandistInterval = null


let productionInterval = null;
let accumulatedProduction = 0;

let totalProductionPerMinute = localStorage.getItem("totalProductionPerMinute")
  ? Number.parseFloat(localStorage.getItem("totalProductionPerMinute"))
  : 1;

  document.addEventListener("DOMContentLoaded", () => {
    getTitleAndChef();
  });


function getTitleAndChef() {
  const titleElement = document.getElementById("title-revolution");
  const chefElement = document.getElementById("chef-img");

  const storedParti = localStorage.getItem("parti");
  const storedChef = localStorage.getItem("chef-image");

  if (storedParti) {
    titleElement.textContent = storedParti;
  } else {
    titleElement.textContent = "REVOLUTION";
  }

  // update LEADER
  if (storedChef) {
    chefElement.src = storedChef;
    chefElement.alt = "Chef du parti";
  } else {
    chefElement.src = "img/default-chef.png"; // une image par défaut au cas où
    chefElement.alt = "Chef inconnu";
  }
}


function updateProgressBar() {
  const totalPopulation = 10000;
  const progress = Math.min(100, (counter / totalPopulation) * 100);
  
  const progressBar = document.getElementById("progress-bar");
  
  progressBar.style.width = progress + "%";
  
  progressBar.textContent = Math.floor(progress) + "%";
}



function initGame() {
  document.getElementById("counter").textContent = counter
  document.getElementById("bouton").addEventListener("click", addOne)

  repressionLevel = 0;
  counter = 0;
  totalProductionPerMinute= 1;
  currentRepression = 0;
  clickPower = 1;


  const resetButton = document.getElementById("reset-button");
  if (resetButton) {
  resetButton.addEventListener("click", resetGame,initGameAfterReset);
  }

  unlockedItems.forEach((itemId) => {
    const upgrade = upgrades.find((u) => u.id === itemId)
    if (upgrade) {
      if (upgrade.type === "clickPower") {
        clickPower = upgrade.power
    }
  }})

  upgrades.forEach((upgrade) => {
    if (!unlockedItems.includes(upgrade.id) && counter >= upgrade.cost) {
      showUpgradeButton(upgrade)
    }
  })

  createRecruitersUI()
  createPropagandistsUI()

  updateDisplay();
  startProductionInterval();
  hideAllContainersExceptMain();
  showContainer("main-game-container");
  getTitleAndChef();
}

function updateProductionPerMinute() {
  const baseProduction = 60;
  const recruiterBonus = propagandists * 2;
  const recruiterEfficiency = 5 + recruiterBonus;

  const productionFromRecruiters = Math.floor(
    recruiters * baseProduction * (recruiterEfficiency / 100)
  );

  let autoClickBonus = 0;
  upgrades.forEach((upgrade) => {
    if (upgrade.type === "autoclick" && unlockedItems.includes(upgrade.id)) {
      autoClickBonus += upgrade.clicksPerMinute;
    }
  });

  totalProductionPerMinute = productionFromRecruiters + autoClickBonus;

  localStorage.setItem("totalProductionPerMinute", totalProductionPerMinute);
}

function hideAllContainersExceptMain() {
  document.querySelectorAll("article").forEach(article => {
    if (article.id !== "main-game-container") {
      article.style.display = "none";
    } else {
      article.style.display = "";
    }
  });
}

function showContainer(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = "flex";
    container.classList.remove("hidden");
  }
}


function resetGame() {
  // Reset local storage
  localStorage.setItem("counter", 0);
  localStorage.setItem("clickPower", 1);
  localStorage.setItem("unlockedItems", JSON.stringify([]));
  localStorage.setItem("recruiters", 0);
  localStorage.setItem("propagandists", 0);
  localStorage.setItem("repressionLevel",0);

  // Reset variable
  totalProductionPerMinute =1;
  counter =0;
   
  clickPower = 1;
  unlockedItems.length = 0;
  recruiters = 0;
  propagandists = 0;

  repressionLevel = 0;
  currentRepression =0;
  updateDisplay();

  hideAllContainersExceptMain();
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
  unlockedItems.push(item)
  localStorage.setItem("unlockedItems", JSON.stringify(unlockedItems))
}

function saveGame() {
  localStorage.setItem("counter", counter)
  localStorage.setItem("clickPower", clickPower)
  localStorage.setItem("unlockedItems", JSON.stringify(unlockedItems))
  localStorage.setItem("recruiters", recruiters)
  localStorage.setItem("propagandists", propagandists)
  localStorage.setItem("totalProductionPerMinute", totalProductionPerMinute);
}


function initGameAfterReset() {
  document.getElementById("counter").textContent = counter
  repressionLevel=0;
  updateDisplay();

  createRecruitersUI()
  createPropagandistsUI()

  startProductionInterval();

  hideAllContainersExceptMain()
  showContainer("main-game-container");
}

// ADD A REVOLUTIONNAIRE
function addOne() {
  counter += clickPower;
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
// UPGRADES BUTTON
function showUpgradeButton(upgrade) {
  showContainer("special-upgrades")

  
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
  

    if (upgrade.type === "clickPower") {
      clickPower += upgrade.power;
      saveGame();
    } else { (upgrade.type === "autoclick") 
      autoClickBonus += upgrade.clicksPerMinute;
    } 
    
    document.getElementById(upgrade.id).disabled = true;
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
  return Math.floor(recruiterCost*Math.pow(costMultiplier, recruiters));
}

function updateRecruitersButton() {
  const button = document.getElementById("buy-recruiter")
  if (button) {
    const cost = calculateRecruitCost()
    button.textContent = `Recruter (Coût: ${cost} révolutionnaires)`
    button.disabled = counter < cost
    if (counter >= recruiterCost) {showContainer("unit-container");
      showContainer("repression-container");
    }
  }
}

function buyRecruiter() {
  const cost = calculateRecruitCost()
  if (counter >= cost) {
    counter -= cost
    recruiters++
    showContainer("stats");
    
    document.getElementById("recruiter-value").textContent = recruiters
    document.getElementById("counter").textContent = counter
    
    updateRecruitersButton()
    updatePropagandistsButton()
    saveGame()
  }
}


function startProductionInterval() {
  if (productionInterval) clearInterval(productionInterval);
  
  productionInterval = setInterval(() => {

    const baseProduction = 60;
    const recruiterBonus = propagandists * 2;         // each propagandiste add +2 %
    const recruiterEfficiency = 5 + recruiterBonus;
    const productionFromRecruiters = Math.floor(recruiters * baseProduction * (recruiterEfficiency / 100));
    
    let autoClickBonus = 0;
    upgrades.forEach(upgrade => {
      if (upgrade.type === "autoclick" && unlockedItems.includes(upgrade.id)) {
        autoClickBonus += upgrade.clicksPerMinute;
      }
    });

    const totalProductionPerMinute = productionFromRecruiters + autoClickBonus;
    
    const productionPerSecond = totalProductionPerMinute / 60;

    counter+= Math.floor(totalProductionPerMinute/60);
    
    accumulatedProduction += productionPerSecond;
    const added = Math.floor(accumulatedProduction);
    if (added > 0) {
      counter += added;
      accumulatedProduction -= added;
    }
    
    if (propagandists > 0 && recruiters > 0) {
      const basePropagandistEffect = 0.0001 * propagandists; 
      if (Math.random() < basePropagandistEffect) {
        recruiters += 1;
      }
    }
    updateDisplay();
    saveGame();
  }, 1000);
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
  return Math.floor(propagandistCost*costMultiplier+propagandists)
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

function updateDisplay() {
  updateProductionPerMinute();
  document.getElementById("counter").textContent = Math.floor(counter).toLocaleString('fr-FR');
  const recruiterValue = document.getElementById("recruiter-value")
  const propagandistValue = document.getElementById("propagandist-value")

  if (recruiterValue) recruiterValue.textContent = recruiters
  if (propagandistValue) propagandistValue.textContent = propagandists

  updateProgressBar();

  const recruiterBonus = propagandists * 2
  const recruiterEfficiency = 2 + recruiterBonus
  const baseProduction = 60 
  const productionFromRecruiters = Math.floor(recruiters * baseProduction * (recruiterEfficiency / 100));

  productionPerMinute = productionFromRecruiters + Math.floor(autoClickBonus) ;

    // update stats
    const statsElement = document.getElementById("stats");
    if (statsElement && counter>=3) {
      
      statsElement.innerHTML = `
        <p>Puissance de clic : ${clickPower}</p>
        <p>Efficacité des recruteurs : +${recruiterEfficiency}% par minute</p>
        <p>Production par minute : ${totalProductionPerMinute} révolutionnaires</p>
      `;
      showContainer("stats");
    }

  upgrades.forEach((upgrade) => {
    if (counter >= upgrade.cost && !unlockedItems.includes(upgrade.id)) {
      showUpgradeButton(upgrade)
    }
  });

  
  updateProgressBar();
  updateRecruitersButton();
  updatePropagandistsButton();
  updateRepressionBar();
  checkAndActivateMaluses();
}

function updateRepressionBar() {
  let repressionLevel = counter/(recruiters+propagandists+1);
  if (repressionLevel > 100) {
    repressionLevel = 100;
    resetGame();
    return
  } else if (repressionLevel<=1) {repressionLevel=1;}

  if (repressionLevel>=2) {showContainer("repression-container");}

  const repressionBar = document.getElementById("repression-bar");
  const percent = Math.min(100, Math.max(0, repressionLevel));
  
  // update bar width & color
  repressionBar.style.width = percent + "%";
  repressionBar.textContent = Math.floor(percent) + "%";

  repressionBar.classList.remove("repression-low", "repression-med-low", "repression-med-high", "repression-high");

  if (percent < 25) {
    repressionBar.classList.add("repression-low");
  } else if (percent < 50) {
    repressionBar.classList.add("repression-med-low");
  } else if (percent < 90) {
    repressionBar.classList.add("repression-med-high");
  } else {
    repressionBar.classList.add("repression-high");
  }

  if (percent >= 25) {
    showContainer("malus-container");
  }
}


// // MALUS ___________________________________________
// let malusList = [];

// fetch("malus.json")
//   .then((response) => response.json())
//   .then((data) => {
//     malusList = data;
//     startMalusCycle();
//   })
//   .catch((error) => console.error("Erreur lors du chargement du JSON des malus:", error));

// const activeMaluses = {};


// function checkAndActivateMaluses() {
//   const currentRepression = repressionLevel; 
  
//   const malusContainer = document.getElementById("malus-container");
//   if (!malusContainer) return;

  
//   malusList.forEach(malus => {
//     if (currentRepression >= malus.triggerThreshold && !activeMaluses[malus.id]) {
//       const malusDiv = document.createElement("div");
//       malusDiv.id = malus.id;
//       malusDiv.textContent = malus.label;
//       malusDiv.classList.add("malus-item");
      
//       malusContainer.appendChild(malusDiv);
      
//       activeMaluses[malus.id] = setTimeout(() => {
//         malusContainer.removeChild(malusDiv);
//         delete activeMaluses[malus.id];
//       }, malus.duration);
//     }
//   });
// }

// function startMalusCycle() {
//   setInterval(updateDisplay, 1000);
// }
