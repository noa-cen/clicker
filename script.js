let counter = localStorage.getItem("counter") ? Number.parseInt(localStorage.getItem("counter")) : 0
let clickPower = Number.parseInt(localStorage.getItem("clickPower")) || 1
const unlockedItems = JSON.parse(localStorage.getItem("unlockedItems")) || []
let upgrades = []
const autoClickIntervals = []

let recruiters = Number.parseInt(localStorage.getItem("recruiters")) || 0
let propagandists = Number.parseInt(localStorage.getItem("propagandists")) || 0
const recruiterCost = 20 
const propagandistCost = 10 
const costMultiplier = 1.3
let recruiterInterval = null
let propagandistInterval = null
let displayInterval = null


function resetGame() {
  localStorage.removeItem("counter")
  localStorage.removeItem("clickPower")
  localStorage.removeItem("unlockedItems")
  localStorage.removeItem("recruiters")
  localStorage.removeItem("propagandists")

  counter = 0
  clickPower = 1
  unlockedItems.length = 0
  recruiters = 0
  propagandists = 0

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
}

function initGame() {
  document.getElementById("counter").textContent = counter
  document.getElementById("bouton").addEventListener("click", addOne)

  if (!document.getElementById("reset-button")) {
    const resetButton = document.createElement("button")
    resetButton.id = "reset-button"
    resetButton.textContent = "Réinitialiser la révolution"
    resetButton.addEventListener("click", resetGame)
    resetButton.className = "reset-button"
    document.body.insertBefore(resetButton, document.getElementById("upgrade-container"))
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

  displayInterval = setInterval(updateDisplay, 1000)
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

  displayInterval = setInterval(updateDisplay, 1000)
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

// UPGRADES BUTTON
function showUpgradeButton(upgrade) {
  if (!document.getElementById(upgrade.id)) {
    const btn = document.createElement("button")
    btn.id = upgrade.id
    btn.textContent = upgrade.label
    btn.addEventListener("click", () => buyUpgrade(upgrade.id))
    document.getElementById("upgrade-container").appendChild(btn)

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

function createRecruitersUI() {
  const container = document.getElementById("upgrade-container")

  let specialSection = document.getElementById("special-upgrades")
  if (!specialSection) {
    specialSection = document.createElement("div")
    specialSection.id = "special-upgrades"
    specialSection.className = "special-section"
    container.appendChild(specialSection)

    const sectionTitle = document.createElement("h2")
    sectionTitle.textContent = "Recrutement et Propagande"
    specialSection.appendChild(sectionTitle)
  } else {
    specialSection.innerHTML = ""

    const sectionTitle = document.createElement("h2")
    sectionTitle.textContent = "Recrutement et Propagande"
    specialSection.appendChild(sectionTitle)
  }

  const recruiterCountDiv = document.createElement("div")
  recruiterCountDiv.id = "recruiter-count"
  recruiterCountDiv.innerHTML = `Recruteurs: <span id="recruiter-value">${recruiters}</span>`
  specialSection.appendChild(recruiterCountDiv)

  const recruiterButton = document.createElement("button")
  recruiterButton.id = "buy-recruiter"
  recruiterButton.textContent = `Recruter (Coût: ${calculateRecruitCost()} révolutionnaires)`
  recruiterButton.addEventListener("click", buyRecruiter)
  specialSection.appendChild(recruiterButton)

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

function createPropagandistsUI() {
  const specialSection = document.getElementById("special-upgrades")

  const propagandistCountDiv = document.createElement("div")
  propagandistCountDiv.id = "propagandist-count"
  propagandistCountDiv.innerHTML = `Propagandistes: <span id="propagandist-value">${propagandists}</span>`
  specialSection.appendChild(propagandistCountDiv)

  const propagandistButton = document.createElement("button")
  propagandistButton.id = "buy-propagandist"
  propagandistButton.textContent = `Former un propagandiste (Coût: ${calculatePropagandistCost()} recruteurs)`
  propagandistButton.addEventListener("click", buyPropagandist)
  specialSection.appendChild(propagandistButton)

  const statsElement = document.createElement("div")
  statsElement.id = "stats"
  specialSection.appendChild(statsElement)

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
  document.getElementById("counter").textContent = Math.floor(counter)

  const recruiterValue = document.getElementById("recruiter-value")
  const propagandistValue = document.getElementById("propagandist-value")

  if (recruiterValue) recruiterValue.textContent = recruiters
  if (propagandistValue) propagandistValue.textContent = propagandists

  const recruiterBonus = propagandists * 2
  const recruiterEfficiency = 2 + recruiterBonus

  const statsElement = document.getElementById("stats")
  if (statsElement) {
    statsElement.innerHTML = `
      <p>Puissance de clic: ${clickPower}</p>
      <p>Efficacité des recruteurs: ${recruiterEfficiency}% par minute</p>
      <p>Bonus des propagandistes: +${recruiterBonus}%</p>
      <p>Production par minute: ${Math.floor(counter * (recruiterEfficiency / 100) * recruiters)} révolutionnaires</p>
    `
  }

  upgrades.forEach((upgrade) => {
    if (counter >= upgrade.cost && !unlockedItems.includes(upgrade.id)) {
      showUpgradeButton(upgrade)
    }
  })

  updateRecruitersButton()
  updatePropagandistsButton()
}
