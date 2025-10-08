// main.js - The full script code (UPDATED FOR GITHUB/FIREBASE)

// 🛑 Import Firebase modules and functions (ASSUMING SUCCESSFUL CONNECTION) 🛑
import { db, doc, setDoc, collection, getDocs, getDoc } from './firebase-config.js';

document.addEventListener('gesturestart', e => e.preventDefault());

const items = Array.from(document.querySelectorAll('.item'));
const balanceEl = document.getElementById('balance');
const amountInput = document.getElementById('amount');
const buyBtn = document.getElementById('buyBtn');
const sellBtn = document.getElementById('sellBtn');
const tradeBtn = document.getElementById('tradeBtn');
const abuseTimerEl = document.getElementById('abuseTimer');
const abuseBox = document.getElementById('abuseBox');
const tradeInput = document.getElementById('tradeAmount');
const tradeOption = document.getElementById('tradeOption'); 
const priceTimerEl = document.getElementById('priceTimer'); 

// Additional Elements
const bankBtn = document.getElementById('bankButton');
const spinBtn = document.getElementById('spinBtn');
// 🛑 تم حذف userIDDisplayEl 🛑

// Leaderboard Elements
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardPopup = document.getElementById('leaderboardPopup');
const leaderboardList = document.getElementById('leaderboardList');
const myNetWorthEl = document.getElementById('myNetWorth');

// 🛑 Status and Upgrade System Elements 
const statusBtn = document.getElementById('statusBtn');
const statusPopup = document.getElementById('statusPopup');
const levelsTrack = document.getElementById('levelsTrack');
const currentLevelDisplay = document.getElementById('currentLevelDisplay');
const upgradeBtn = document.getElementById('upgradeBtn');
const upgradeRequirementsEl = document.getElementById('upgradeRequirements');
const nextLevelNumEl = document.getElementById('nextLevelNum');
const upgradeMsgEl = document.getElementById('upgradeMsg');
const cryptoLock = document.getElementById('cryptoLock');

// Status Details Elements
const ownedCarEl = document.getElementById('ownedCar');
const maxCarEl = document.getElementById('maxCar');
const ownedHouseEl = document.getElementById('ownedHouse');
const maxHouseEl = document.getElementById('maxHouse');
const maxPlaneEl = document.getElementById('maxPlane');
const maxGoldEl = document.getElementById('maxGold');
const maxCryptoEl = document.getElementById('maxCrypto');
const statusBankBalanceEl = document.getElementById('statusBankBalance');
const statusRankEl = document.getElementById('statusRank');

// 🛑 Time Reward Elements
const timeRewardBtn = document.getElementById('timeRewardBtn');
const timeRewardPopup = document.getElementById('timeRewardPopup');
const rewardTimerDisplay = document.getElementById('rewardTimerDisplay');
const claimRewardBtn = document.getElementById('claimRewardBtn');


// ----------------- Create Bank POPUP -----------------
const bankPopup = document.createElement('div');
bankPopup.className = 'popup-overlay';
bankPopup.id = 'bankPopup';
bankPopup.innerHTML = `
<div class="popup">
  <button class="close-btn" id="closeBankPopup">X</button> 
  <h2>Bank 🏦</h2> 
  <p style="margin-bottom: 10px; color: #00ffb3;">Bank Balance: <span id="bankBalanceDisplay">0</span>$</p>
  <div class="amount-box">
      <input type="number" id="bankAmount" placeholder="Enter amount" value="0"/>
      <button id="maxBtn">MAX</button>
  </div>
  <button id="depositBtn">Deposit</button>
  <button id="withdrawBtn">Withdraw</button>
</div>
`;
document.body.appendChild(bankPopup);

// ----------------- Create Spin Wheel POPUP -----------------
const spinPopup = document.createElement('div');
spinPopup.className = 'popup-overlay';
spinPopup.id = 'spinPopup';
spinPopup.innerHTML = `
<div class="popup">
  <button class="close-btn" id="closeSpinPopup">X</button> 
  <h2>Spin Wheel 🎰</h2> 
  <p style="margin-bottom: 10px; color: #fff;">Next Spin In: <span id="spinCooldownTimer">00:00</span></p>

  <div class="pointer"></div>
  <div class="wheel-container">
    <div class="wheel" id="spinWheel"></div>
  </div>
  
  <p id="spinResult" style="font-weight: 700; font-size: 20px; margin-bottom: 10px;">Ready to spin!</p>

  <button id="spinWheelBtn">SPIN</button>
</div>
`;
document.body.appendChild(spinPopup);

// Spin Elements
const spinWheel = document.getElementById("spinWheel");
const spinWheelBtn = document.getElementById("spinWheelBtn");
const spinResultEl = document.getElementById("spinResult");
const spinCooldownTimerEl = document.getElementById("spinCooldownTimer");

// **Game State Variables**
let currentUserID = null; 
let playerName = "Player"; 
let balance = 100000; 
let bankBalance = 0; 
let currentLevel = 1;
let lastSpinTime = 0;
let lastClaimTime = 0; 
let playerNetWorth = 0; 
let playerRank = 'N/A'; 

// Bank Elements
const bankAmountInput = document.getElementById('bankAmount');
const bankBalanceDisplay = document.getElementById('bankBalanceDisplay');
const bankMaxBtn = bankPopup.querySelector('#maxBtn'); 
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');

let selectedItem = null;
let priceUpdateEngine; 
let syncEngine; // 🛑 New engine for 1-second sync

const normalRanges = {
  car: { min: -1000, max: 2000 },
  house: { min: -2000, max: 3000 },
  plane: { min: -2000, max: 6000 },
  gold: { min: -4000, max: 6000 },
  crypto: { min: -200000, max: 700000 }
};

const abuseRanges = {
  car: { min: -1000, max: 5000 },
  house: { min: -1000, max: 6000 },
  plane: { min: -2000, max: 8000 },
  gold: { min: -3000, max: 10000 },
  crypto: { min: -200000, max: 2000000 }
};

let currentRanges = { ...normalRanges };

// 🛑 Level Variables and Constraints (Unchanged)
const BASE_LIMITS = {
    car: 50, house: 40, plane: 20, gold: 5, crypto: 0 
};

const LEVEL_REQUIREMENTS = {
    2: { cash: 100000, assets: {} },
    3: { cash: 400000, assets: {} },
    4: { cash: 500000, assets: { car: 5 } },
    5: { cash: 700000, assets: { plane: 1 } },
    6: { cash: 1000000, assets: {} }, 
    7: { cash: 1000000, assets: { gold: 1 } },
    8: { cash: 1000000, assets: { gold: 5 } },
    9: { cash: 1000000, assets: { crypto: 1 } },
    10: { cash: 5000000, assets: { crypto: 5 } },
    11: { cash: 100000000, assets: {} }, 
};

function getAssetLimit(assetId) {
    let limit = BASE_LIMITS[assetId] || 0;

    for (let level = 2; level <= Math.min(currentLevel, 4); level++) {
        if (assetId !== 'crypto') {
            limit += 2; 
        }
    }
    
    if (assetId === 'crypto' && currentLevel >= 5) {
        limit = 10;
    }
    
    if (assetId === 'crypto' && currentLevel < 5) {
        limit = 0;
    }

    return limit;
}

function setInitialPrices() {
    const initialPrices = {
        car: 30000, house: 50000, plane: 200000, gold: 600000, crypto: 1000000
    };

    items.forEach(item => {
        if (parseInt(item.dataset.price, 10) === 0 || isNaN(parseInt(item.dataset.price, 10))) {
            item.dataset.price = initialPrices[item.id];
        }
    });
    
    updateCryptoLock();
}

function formatNumber(num) {
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/** 🛑 Renders UI elements (Balances, Prices, Owned) but DOES NOT SAVE DATA. */
function renderItem(item) {
    balanceEl.textContent = formatNumber(balance);
    bankBalanceDisplay.textContent = formatNumber(bankBalance);
    
    if (item) {
        const price = parseInt(item.dataset.price, 10);
        const owned = parseInt(item.dataset.owned, 10);
        item.querySelector('.price-val').textContent = formatNumber(price);
        item.querySelector('.owned-val').textContent = owned;
    } else {
        items.forEach(i => {
            i.querySelector('.price-val').textContent = formatNumber(parseInt(i.dataset.price, 10));
            i.querySelector('.owned-val').textContent = i.dataset.owned;
        });
    }

    // Call save data only from syncData or on major actions (like upgrade)
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updatePrices() {
  items.forEach(item => {
    let price = parseInt(item.dataset.price, 10);
    const range = currentRanges[item.id];
    const change = randInt(range.min, range.max);
    price = Math.max(10, price + change);
    item.dataset.price = Math.round(price);
    renderItem(item); // Renders price to UI
  });
}

function updateCryptoLock() {
    const cryptoItem = document.getElementById('crypto');
    const lock = cryptoItem.querySelector('.crypto-lock');

    if (currentLevel >= 5) {
        lock.classList.add('hidden');
        cryptoItem.style.pointerEvents = 'auto'; 
    } else {
        lock.classList.remove('hidden');
        cryptoItem.style.pointerEvents = 'none'; 
    }
}

// ================= Item Selection (Unchanged) =================
items.forEach(it => {
  it.addEventListener('click', () => {
    items.forEach(i => i.classList.remove('active'));
    it.classList.add('active');
    selectedItem = it;
    
    buyBtn.disabled = false;
    sellBtn.disabled = false;
    buyBtn.classList.add('active');
    sellBtn.classList.add('active');
    buyBtn.textContent = "Buy";
    sellBtn.textContent = "Sell";
  });
});

function flashButton(btn, symbol, color, duration = 1500) {
  const originalText = btn.textContent;
  const originalColor = btn.style.color;
  btn.textContent = symbol;
  btn.style.color = color;
  
  const originalDisabledState = btn.disabled;
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.color = originalColor;
    btn.disabled = originalDisabledState;
    if (btn.id === 'buyBtn' || btn.id === 'sellBtn') {
        if(selectedItem) btn.disabled = false;
    }
  }, duration);
}

// ================= Cooldown Function (Unchanged) =================
function applyCooldown(button, duration = 2000) {
  button.disabled = true;
  setTimeout(() => {
    if (button.id === 'buyBtn' || button.id === 'sellBtn') {
        if(selectedItem) button.disabled = false;
    } else {
        button.disabled = false;
    }
  }, duration);
}

// 🛑 ================= Buy/Sell/Trade (Unchanged) ================= 🛑
buyBtn.addEventListener('click', () => {
    if (buyBtn.disabled) return;
    
    if (!selectedItem) return flashButton(buyBtn, '❌', 'red');
    const qty = parseInt(amountInput.value, 10);
    if (!qty || qty <= 0) return flashButton(buyBtn, '❌', 'red');

    const itemID = selectedItem.id;
    const price = parseInt(selectedItem.dataset.price, 10) * qty;
    let owned = parseInt(selectedItem.dataset.owned, 10);
    
    const maxLimit = getAssetLimit(itemID);
    
    if (owned + qty > maxLimit) {
        const msg = `Max: ${maxLimit}`;
        flashButton(buyBtn, msg, 'red', 2000);
        applyCooldown(buyBtn);
        return;
    }
    
    if (balance >= price) {
        balance -= price;
        owned += qty;
        selectedItem.dataset.owned = owned;
        renderItem(selectedItem); 
        saveUserData(); // Save after successful transaction
        flashButton(buyBtn, '✅', '#00ffb3');
        applyCooldown(buyBtn);
    } else {
        flashButton(buyBtn, '❌', 'red');
        applyCooldown(buyBtn);
    }
});

sellBtn.addEventListener('click', () => {
  if (sellBtn.disabled) return;
  
  if (!selectedItem) return flashButton(sellBtn, '❌', 'red');
  const qty = parseInt(amountInput.value, 10);
  if (!qty || qty <= 0) return flashButton(sellBtn, '❌', 'red');
  let owned = parseInt(selectedItem.dataset.owned, 10);
  
  if (owned < qty) {
    flashButton(sellBtn, '❌', 'red');
    applyCooldown(sellBtn);
    return;
  }
  
  const price = parseInt(selectedItem.dataset.price, 10) * qty;
  owned -= qty;
  balance += price;
  selectedItem.dataset.owned = owned;
  renderItem(selectedItem); 
  saveUserData(); // Save after successful transaction
  flashButton(sellBtn, '✅', '#00ffb3');
  applyCooldown(sellBtn);
});

tradeInput.value = 50000;

tradeBtn.addEventListener('click', () => {
  if (tradeBtn.disabled) return;
  
  tradeBtn.disabled = true;
  setTimeout(() => {
    tradeBtn.disabled = false;
  }, 4000);
  
  const tradeAmt = parseInt(tradeInput.value);
  const originalText = tradeBtn.textContent;
  
  if (tradeAmt < 50000 || tradeAmt > 500000000 || !tradeAmt || tradeAmt <= 0) { 
    let msg = "";
    if (tradeAmt < 50000 && tradeAmt > 0) msg = "Min.amount : 50000";
    else if (tradeAmt > 500000000) msg = "Max.amount : 500M";
    else msg = "Invalid amount";
    
    tradeBtn.textContent = msg;
    tradeBtn.style.color = "red";
    
    setTimeout(() => {
      tradeBtn.textContent = originalText;
      tradeBtn.style.color = "";
    }, 2000);
    return;
  }
  
  if (tradeAmt > balance) {
    flashButton(tradeBtn, '❌', 'red');
    return;
  }
  
  let count = 2;
  tradeBtn.textContent = count;
  const countdown = setInterval(() => {
    count--;
    if (count > 0) tradeBtn.textContent = count;
    else {
      clearInterval(countdown);
      
      const perc = Math.floor(Math.random() * 91) - 30; 
      const gain = Math.round(tradeAmt * perc / 100);
      balance += gain;
      renderItem(selectedItem || items[0]); 
      saveUserData(); // Save after successful transaction
      
      tradeBtn.textContent = `${perc >= 0 ? '+' : ''}${perc}% → ${gain >= 0 ? '+' : ''}${formatNumber(gain)}$`;
      
      setTimeout(() => {
        tradeBtn.textContent = originalText;
      }, 2000);
    }
  }, 2000); 
});


// ================= Bank/Spin (Unchanged) =================
bankMaxBtn.addEventListener('click', () => {
    bankAmountInput.value = balance;
});

depositBtn.addEventListener('click', () => {
    const amount = parseInt(bankAmountInput.value);
    
    if (amount <= 0 || isNaN(amount)) {
        flashButton(depositBtn, '❌', 'red');
        return;
    }
    
    if (balance >= amount) {
        balance -= amount;
        bankBalance += amount;
        bankAmountInput.value = 0; 
        renderItem(); 
        saveUserData(); // Save after successful transaction
        flashButton(depositBtn, '✅', '#00ffb3');
    } else {
        flashButton(depositBtn, '❌', 'red');
    }
});

withdrawBtn.addEventListener('click', () => {
    const amount = parseInt(bankAmountInput.value);

    if (amount <= 0 || isNaN(amount)) {
        flashButton(withdrawBtn, '❌', 'red');
        return;
    }

    if (bankBalance >= amount) {
        bankBalance -= amount;
        balance += amount;
        bankAmountInput.value = 0; 
        renderItem(); 
        saveUserData(); // Save after successful transaction
        flashButton(withdrawBtn, '✅', '#00ffb3');
    } else {
        flashButton(withdrawBtn, '❌', 'red');
    }
});


bankBtn.addEventListener("click", () => {
  document.getElementById('bankPopup').style.display = "flex";
  renderItem();
});

const SPIN_COOLDOWN = 600; 
let isSpinning = false;

const segments = [
    { text: "Small Win", min: 0, max: 72, color: "#ff5050" },
    { text: "Medium Win", min: 72, max: 144, color: "#00ffb3" },
    { text: "Big Win", min: 144, max: 216, color: "#ffcc00" },
    { text: "Small Win", min: 216, max: 288, color: "#ff5050" },
    { text: "Medium Win", min: 288, max: 360, color: "#00e6a5" },
];

function updateSpinCooldown() {
    const now = Date.now();
    const elapsed = Math.floor((now - lastSpinTime) / 1000);
    const remaining = SPIN_COOLDOWN - elapsed;

    if (remaining <= 0) {
        spinCooldownTimerEl.textContent = "READY";
        spinWheelBtn.disabled = false;
        return 0;
    }

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    spinCooldownTimerEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    spinWheelBtn.disabled = true;
    return remaining;
}

// setInterval(updateSpinCooldown, 1000); // 🛑 Moved to syncData

function spinWheelAction() {
    if (isSpinning || updateSpinCooldown() > 0) {
        return;
    }
    
    isSpinning = true;
    
    lastSpinTime = Date.now();

    spinWheelBtn.disabled = true;
    spinWheelBtn.textContent = "Spinning...";
    spinResultEl.textContent = "Good luck!";

    const totalRotation = randInt(7200, 8000);
    const resultAngle = randInt(0, 359);
    
    spinWheel.style.transform = `rotate(${totalRotation + resultAngle}deg)`;

    setTimeout(() => {
        isSpinning = false;
        
        const gain = randInt(1000, 100000);
        
        let finalSegment = null;
        const pointerAngle = (360 - (resultAngle % 360)) % 360; 

        for (const segment of segments) {
            if (pointerAngle >= segment.min && pointerAngle < segment.max) {
                finalSegment = segment;
                break;
            }
        }
        
        if (finalSegment) {
            balance += gain;
            renderItem(); 
            saveUserData(); // Save after successful spin
            spinResultEl.textContent = `${finalSegment.text}! You won ${formatNumber(gain)}$`;
            spinResultEl.style.color = finalSegment.color;
        } else {
            spinResultEl.textContent = "You Won (Error)! Check balance.";
            spinResultEl.style.color = "red";
        }
        
        setTimeout(() => spinResultEl.style.color = "#fff", 2500);

        spinWheel.style.transition = 'none';
        spinWheel.style.transform = `rotate(${resultAngle}deg)`; 
        
        setTimeout(() => spinWheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.2, 1)', 50);

        updateSpinCooldown(); 

    }, 5000); 
}

spinWheelBtn.addEventListener('click', spinWheelAction);

spinBtn.addEventListener("click", () => {
  spinPopup.style.display = "flex";
  updateSpinCooldown(); 
  renderItem();
});


// ================= Mazen’s Abuse Timer (Unchanged) =================

let abuseCycleInterval; 

const NORMAL_UPDATE_SPEED = 60000; 
const ABUSE_UPDATE_SPEED = 5000; 
let priceTimerSeconds = NORMAL_UPDATE_SPEED / 1000; 

function setPriceUpdateEngine(intervalMs) {
    if (priceUpdateEngine) clearInterval(priceUpdateEngine);
    updatePrices(); 
    priceUpdateEngine = setInterval(updatePrices, intervalMs);
}

function updatePriceTimerDisplay() {
    const mins = Math.floor(priceTimerSeconds / 60);
    const secs = priceTimerSeconds % 60;
    priceTimerEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function startAbuseCycle() {
    const normalCycleTimeInitial = 240; 
    const abuseDuration = 60; 
    
    if (abuseCycleInterval) clearInterval(abuseCycleInterval);
    
    let timerState = 'normal';
    let timerSeconds = normalCycleTimeInitial;
    
    currentRanges = { ...normalRanges };
    abuseBox.classList.remove('active');
    
    const initialMins = Math.floor(normalCycleTimeInitial / 60);
    const initialSecs = normalCycleTimeInitial % 60;
    abuseTimerEl.textContent = `${initialMins < 10 ? '0' : ''}${initialMins}:${initialSecs < 10 ? '0' : ''}${initialSecs}`;

    priceTimerSeconds = NORMAL_UPDATE_SPEED / 1000;
    updatePriceTimerDisplay(); 
    
    setPriceUpdateEngine(NORMAL_UPDATE_SPEED);
    
    abuseCycleInterval = setInterval(() => {
        timerSeconds--;
        
        const mins = Math.floor(timerSeconds / 60);
        const secs = timerSeconds % 60;
        abuseTimerEl.textContent = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        if (timerState === 'normal') {
             priceTimerSeconds--;
             if (priceTimerSeconds < 0) {
                 priceTimerSeconds = NORMAL_UPDATE_SPEED / 1000; 
             }
             updatePriceTimerDisplay();

        } else {
             priceTimerEl.textContent = "Mazen’s Abuse 🔥"; 
        }

        if (timerSeconds < 0) {
            if (timerState === 'normal') {
                timerState = 'abuse';
                timerSeconds = abuseDuration;
                currentRanges = { ...abuseRanges };
                abuseBox.classList.add('active');
                setPriceUpdateEngine(ABUSE_UPDATE_SPEED);
                priceTimerEl.textContent = "Mazen’s Abuse 🔥";
            } else {
                timerState = 'normal';
                timerSeconds = normalCycleTimeInitial;
                currentRanges = { ...normalRanges };
                abuseBox.classList.remove('active');
                setPriceUpdateEngine(NORMAL_UPDATE_SPEED);
                
                priceTimerSeconds = NORMAL_UPDATE_SPEED / 1000; 
                updatePriceTimerDisplay();
            }
        }
    }, 1000);
}


// 🛑 ================= FIREBASE DATA MANAGEMENT (Updated for Token Login) ================= 🛑

function calculateNetWorth() {
    let totalAssetValue = 0;
    
    items.forEach(item => {
        const price = parseInt(item.dataset.price, 10);
        const owned = parseInt(item.dataset.owned, 10); 
        totalAssetValue += price * owned;
    });

    playerNetWorth = balance + bankBalance + totalAssetValue;
    return playerNetWorth;
}

/** 🛑 Saves all player data and game state to Firestore. Called on major actions OR sync. */
async function saveUserData() {
    if (!currentUserID) return; 
    
    const assets = {};
    items.forEach(item => {
        assets[item.id] = parseInt(item.dataset.owned, 10);
    });

    const userData = {
        userID: currentUserID, 
        playerName: playerName, 
        balance: balance,
        bankBalance: bankBalance,
        currentLevel: currentLevel,
        lastSpinTime: lastSpinTime,
        lastClaimTime: lastClaimTime,
        netWorth: calculateNetWorth(),
        assets: assets,
        lastUpdated: Date.now()
    };

    try {
        await setDoc(doc(db, "players", String(currentUserID)), userData); 
        // console.log("User data saved successfully!");
    } catch (e) {
        console.error("Error saving document: ", e);
    }
}

/** Loads player data from Firestore. */
async function loadUserData() {
    if (!currentUserID) return;
    
    try {
        const docRef = doc(db, "players", String(currentUserID));
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            balance = data.balance !== undefined ? data.balance : 100000;
            bankBalance = data.bankBalance !== undefined ? data.bankBalance : 0;
            currentLevel = data.currentLevel !== undefined ? data.currentLevel : 1;
            lastSpinTime = data.lastSpinTime !== undefined ? data.lastSpinTime : 0;
            lastClaimTime = data.lastClaimTime !== undefined ? data.lastClaimTime : 0; 
            
            playerName = data.playerName !== undefined ? data.playerName : `Trader ${currentUserID}`;
            
            if (data.assets) {
                items.forEach(item => {
                    item.dataset.owned = data.assets[item.id] || 0;
                });
            }
            
        } else {
            console.log("New player! Setting default data and saving.");
            await saveUserData();
        }

        // Final setup after loading/setting defaults
        renderItem(); 
        updateSpinCooldown(); 
        checkTimeElapsedAndStartTimer();
        updateCryptoLock(); 
        updateStatusPopup(); 
        
        // 🛑 No longer displays Token/ID at the bottom left.
        
    } catch (e) {
        console.error("Error loading document: ", e);
        renderItem(); 
    }
}


/** Loads all player net worths for the leaderboard */
async function updateLeaderboard() {
    // ... (Your existing leaderboard code using Firebase)
    const playersCol = collection(db, "players");
    const playerSnapshot = await getDocs(playersCol);
    
    const leaderboardData = [];
    playerSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.netWorth) {
            leaderboardData.push({
                userID: data.userID,
                playerName: data.playerName || `Trader ${data.userID}`, 
                netWorth: data.netWorth
            });
        }
    });

    const sortedLeaderboard = leaderboardData
        .sort((a, b) => b.netWorth - a.netWorth);

    leaderboardList.innerHTML = '';
    
    const myRankEntry = sortedLeaderboard.findIndex(p => p.userID === currentUserID);
    playerRank = myRankEntry > -1 ? myRankEntry + 1 : 'N/A';
    
    const topPlayers = sortedLeaderboard.slice(0, 10);
    
    topPlayers.forEach((player, index) => {
        const rank = index + 1;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = `leaderboard-item ${rank === 1 ? 'rank-1' : ''}`;

        if (player.userID === currentUserID) {
            itemDiv.style.backgroundColor = 'rgba(102, 194, 255, 0.1)'; 
        }

        const displayID = player.playerName; 

        itemDiv.innerHTML = `
            <span class="rank">${rank}</span>
            <span class="name">${displayID}</span>
            <span class="net-worth">${formatNumber(player.netWorth)}$</span>
        `;
        
        leaderboardList.appendChild(itemDiv);
    });

    myNetWorthEl.textContent = playerNetWorth > 0 ? `${formatNumber(playerNetWorth)}$ (Rank ${playerRank})` : "N/A";
    statusRankEl.textContent = playerRank;
}

// 🛑 ================= Sync Function (New) ================= 🛑

/** Updates UI (Balances/Timers) and saves data every second. */
function syncData() {
    renderItem();           // Update Balances/Prices on UI
    updateSpinCooldown();   // Update Spin Timer
    checkTimeElapsedAndStartTimer(); // Update Reward Timer
    saveUserData();         // Save everything to Firestore
}

// ================= Account Status and Upgrade Logic (Unchanged) ================= 

// Helper function to close any popup by ID
function closePopup(popupEl) {
    popupEl.style.display = 'none';
}

function renderLevelBar() {
    levelsTrack.innerHTML = '';
    const maxLevel = 10; 
    
    for (let i = 1; i <= maxLevel; i++) {
        const dot = document.createElement('div');
        dot.className = 'level-dot';
        dot.textContent = i;
        
        if (i < currentLevel) {
            dot.classList.add('passed');
        } else if (i === currentLevel) {
            dot.classList.add('current');
        } else if (i === currentLevel + 1) {
             dot.classList.add('next');
        }
        
        if (i === maxLevel) {
            dot.style.width = '25px';
        }
        
        levelsTrack.appendChild(dot);
    }
}

function updateStatusPopup() {
    currentLevelDisplay.textContent = currentLevel;
    
    document.getElementById('ownedCar').textContent = document.getElementById('car').dataset.owned;
    maxCarEl.textContent = getAssetLimit('car');
    
    document.getElementById('ownedHouse').textContent = document.getElementById('house').dataset.owned;
    maxHouseEl.textContent = getAssetLimit('house');

    document.getElementById('ownedPlane').textContent = document.getElementById('plane').dataset.owned;
    maxPlaneEl.textContent = getAssetLimit('plane');

    document.getElementById('ownedGold').textContent = document.getElementById('gold').dataset.owned;
    maxGoldEl.textContent = getAssetLimit('gold');

    document.getElementById('ownedCrypto').textContent = document.getElementById('crypto').dataset.owned;
    maxCryptoEl.textContent = getAssetLimit('crypto');

    statusBankBalanceEl.textContent = formatNumber(bankBalance) + "$";
    
    updateLeaderboard(); 

    renderLevelBar();
    updateUpgradeRequirements();
}

function updateUpgradeRequirements() {
    const nextLevel = currentLevel + 1;
    upgradeRequirementsEl.innerHTML = '';
    upgradeMsgEl.textContent = '';
    upgradeBtn.disabled = true;

    if (nextLevel > 10) {
        nextLevelNumEl.textContent = 'MAX!';
        upgradeRequirementsEl.innerHTML = '<p style="color:#ffcc00;">You have reached the maximum level! 🏆</p>';
        return;
    }
    
    nextLevelNumEl.textContent = nextLevel;
    const req = LEVEL_REQUIREMENTS[nextLevel];
    let allRequirementsMet = true;
    
    const cashRequired = req.cash;
    const cashMet = balance >= cashRequired;
    const cashClass = cashMet ? 'req-ok' : 'req-fail';
    
    upgradeRequirementsEl.innerHTML += `<p class="${cashClass}">Cash: ${formatNumber(cashRequired)}$</p>`;
    if (!cashMet) allRequirementsMet = false;
    
    for (const asset in req.assets) {
        const requiredOwned = req.assets[asset];
        const currentOwned = parseInt(document.getElementById(asset).dataset.owned);
        const assetName = asset.charAt(0).toUpperCase() + asset.slice(1);
        
        const assetMet = currentOwned >= requiredOwned;
        const assetClass = assetMet ? 'req-ok' : 'req-fail';
        
        upgradeRequirementsEl.innerHTML += `<p class="${assetClass}">${assetName}: ${currentOwned} / ${requiredOwned}</p>`;
        if (!assetMet) allRequirementsMet = false;
    }
    
    if (allRequirementsMet) {
        upgradeBtn.disabled = false;
        upgradeBtn.textContent = `Upgrade to Level ${nextLevel}`;
    } else {
        upgradeBtn.textContent = `Requirements Not Met`;
    }
}

function performUpgrade() {
    const nextLevel = currentLevel + 1;
    if (nextLevel > 10) return;

    const req = LEVEL_REQUIREMENTS[nextLevel];
    const cashRequired = req.cash;
    
    let allRequirementsMet = balance >= cashRequired;
    for (const asset in req.assets) {
        if (parseInt(document.getElementById(asset).dataset.owned) < req.assets[asset]) {
            allRequirementsMet = false;
            break;
        }
    }

    if (allRequirementsMet) {
        balance -= cashRequired;
        currentLevel = nextLevel;
        
        if (currentLevel === 5) {
            updateCryptoLock();
        }

        updateStatusPopup();
        renderItem(); 
        saveUserData(); // Save after successful upgrade
        upgradeMsgEl.textContent = `Successfully upgraded to Level ${currentLevel}! 🎉`;
        upgradeMsgEl.style.color = '#00ffb3';
    } else {
        upgradeMsgEl.textContent = 'Upgrade failed. Check requirements!';
        upgradeMsgEl.style.color = 'red';
    }

    setTimeout(() => upgradeMsgEl.textContent = '', 3000);
}


// 🛑 ================= Time Reward Logic (Unchanged) ================= 🛑

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

const REWARD_AMOUNT = 100000;
const REWARD_INTERVAL = 300; 
let rewardTimer;
let rewardSeconds = REWARD_INTERVAL; 
let isClaimReady = false; 

function updateRewardTimer() {
    if (isClaimReady) {
        rewardTimerDisplay.textContent = "READY TO CLAIM!";
        claimRewardBtn.disabled = false;
        claimRewardBtn.classList.add('ready-to-claim');
        if (rewardTimer) clearInterval(rewardTimer);
        return;
    }
    
    rewardSeconds--;

    if (rewardSeconds <= 0) {
        rewardSeconds = 0;
        isClaimReady = true;
        // updateRewardTimer(); // Don't call recursively
        return;
    }

    rewardTimerDisplay.textContent = formatTime(rewardSeconds);
    claimRewardBtn.disabled = true;
    claimRewardBtn.classList.remove('ready-to-claim');
}

function startRewardTimer(initialSeconds) {
    // 🛑 No longer using an interval here, now part of syncData
    rewardSeconds = initialSeconds;
    isClaimReady = (rewardSeconds <= 0);
    updateRewardTimer(); 
}

function claimTimeReward() {
    if (!isClaimReady) return; 

    balance += REWARD_AMOUNT;
    
    flashButton(claimRewardBtn, `+${formatNumber(REWARD_AMOUNT)}$ ✅`, '#00ffb3', 2000);
    
    lastClaimTime = Date.now();
    isClaimReady = false; 
    
    startRewardTimer(REWARD_INTERVAL);
    renderItem(); 
    saveUserData(); // Save after claiming reward

    setTimeout(() => {
        closePopup(timeRewardPopup); 
    }, 500); 
}

function checkTimeElapsedAndStartTimer() {
    const now = Date.now();
    
    if (lastClaimTime === 0) {
        if (!isClaimReady) startRewardTimer(0);
        return;
    }

    const timeElapsedSeconds = Math.floor((now - lastClaimTime) / 1000);
    const timeRemaining = REWARD_INTERVAL - timeElapsedSeconds;
    
    if (timeRemaining <= 0) {
        if (!isClaimReady) startRewardTimer(0);
    } else {
        startRewardTimer(timeRemaining);
    }
}


// ================= Event Binding (Unchanged) =================

document.getElementById('closeStatusPopup').addEventListener('click', () => closePopup(statusPopup));
document.getElementById('closeLeaderboardPopup').addEventListener('click', () => closePopup(leaderboardPopup));
document.getElementById('closeTimeRewardPopup').addEventListener('click', () => closePopup(timeRewardPopup));
document.getElementById('closeBankPopup').addEventListener('click', () => closePopup(bankPopup));
document.getElementById('closeSpinPopup').addEventListener('click', () => closePopup(spinPopup));


statusBtn.addEventListener("click", () => {
    updateStatusPopup(); 
    statusPopup.style.display = "flex";
});

leaderboardBtn.addEventListener("click", () => {
    updateLeaderboard(); 
    leaderboardPopup.style.display = "flex";
});

timeRewardBtn.addEventListener("click", () => {
    // 🛑 We no longer call checkTimeElapsedAndStartTimer() here, as it runs every second in syncData.
    timeRewardPopup.style.display = "flex";
});

claimRewardBtn.addEventListener("click", claimTimeReward);

upgradeBtn.addEventListener("click", performUpgrade);


// 🛑 ================= Startup and Authentication (Custom Token Flow) ================= 🛑

function startGame(token, pName) {
    currentUserID = token;
    playerName = pName;
    
    setInitialPrices(); 
    startAbuseCycle(); 
    loadUserData(); 
    
    // 🛑 Start 1-second sync engine 
    if (syncEngine) clearInterval(syncEngine);
    syncEngine = setInterval(syncData, 1000); 
}

/** Check if the player came from the login page using tempToken, or if they need to be redirected to login. */
function initialSetup() {
    const tempToken = localStorage.getItem('tempToken'); 
    const savedToken = localStorage.getItem('gameToken'); 
    const tempName = localStorage.getItem('tempPlayerName');
    
    if (tempToken) {
        const finalName = tempName || `Trader ${tempToken}`;
        
        localStorage.removeItem('tempToken');
        localStorage.removeItem('tempPlayerName');
        
        startGame(tempToken, finalName);
    } 
    
    else if (savedToken) {
        // 🛑 Still redirecting to login to prevent auto-login, forcing user to use the token
        window.location.replace('login.html');
    }
    
    else {
        window.location.replace('login.html');
    }
}

initialSetup();
