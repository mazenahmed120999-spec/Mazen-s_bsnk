// main.js - The full script code (V4: FINAL, Merged Firebase Config & Fixed Loading)

// 🛑 ========================================================== 🛑
// 🛑 ============== FIREBASE CONFIGURATION (MERGED) ============= 🛑
// 🛑 ========================================================== 🛑

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
// تم إضافة updateDoc و onSnapshot هنا للعمل مع السوق الموحد
import { getFirestore, doc, setDoc, updateDoc, collection, getDocs, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";

// مفاتيح مشروعك الخاصة
const firebaseConfig = {
  apiKey: "AIzaSyD-g_PM12TgelGQn7npmYybpGfSxTuwpi0",
  authDomain: "center-9ab44.firebaseapp.com",
  projectId: "center-9ab44",
  storageBucket: "center-9ab44.firebasestorage.app",
  messagingSenderId: "342679917753",
  appId: "1:342679917753:web:2aeb0ef2c90fc943a3b768",
  measurementId: "G-S85P9EWGXM"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


document.addEventListener('gesturestart', e => e.preventDefault());

// ----------------- Create Loading Screen POPUP (NEW) -----------------
const loadingPopup = document.createElement('div');
loadingPopup.className = 'popup-overlay';
loadingPopup.id = 'loadingPopup';
loadingPopup.style.display = 'flex'; // Show by default until setup is complete
loadingPopup.innerHTML = `
<div class="popup" style="text-align: center; padding: 30px; border-radius: 15px;">
  <h2 style="color: #00ffb3;">Checking Data...</h2> 
  <p style="color: #fff;">Connecting to Firebase and synchronizing the latest balance.</p>
  <div class="spinner"></div> 
  <style>
    .spinner {
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid #00ffb3;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto 0;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</div>
`;
document.body.appendChild(loadingPopup);

// ----------------- Standard Elements -----------------
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

// Leaderboard Elements
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardPopup = document.getElementById('leaderboardPopup');
const leaderboardList = document.getElementById('leaderboardList');
const myNetWorthEl = document.getElementById('myNetWorth');

// Status and Upgrade System Elements 
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

// Time Reward Elements
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
let isLoadingData = true; // 🛑 مهم: يمنع التفاعل حتى يتم التحميل بالكامل

// Bank Elements
const bankAmountInput = document.getElementById('bankAmount');
const bankBalanceDisplay = document.getElementById('bankBalanceDisplay');
const bankMaxBtn = bankPopup.querySelector('#maxBtn'); 
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');

let selectedItem = null;
let syncEngine; 

// 🛑 MARKET SYNC VARIABLES 
let marketPrices = {}; // Prices synchronized from Firebase
let isAbuseMode = false;
let marketLastUpdate = 0; // Timestamp of the last market data update

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

const MARKET_DOC_ID = "main_market";
const PRICE_UPDATE_INTERVAL_NORMAL = 60; // 60 seconds
const PRICE_UPDATE_INTERVAL_ABUSE = 5; // 5 seconds
const ABUSE_DURATION = 60; // 60 seconds
const NORMAL_DURATION = 240; // 240 seconds


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
        if (marketPrices[item.id] === undefined) {
             marketPrices[item.id] = initialPrices[item.id];
        }
    });
    
    updatePricesUI();
    updateCryptoLock();
}

function formatNumber(num) {
  if (Math.abs(num) >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

/** 🛑 Updates Prices and Balances on the UI from the marketPrices state. */
function updatePricesUI() {
    balanceEl.textContent = formatNumber(balance);
    bankBalanceDisplay.textContent = formatNumber(bankBalance);
    
    items.forEach(item => {
        const itemID = item.id;
        // نستخدم السعر المُتزامن فقط
        const price = marketPrices[itemID] || parseInt(item.dataset.price, 10); 
        
        item.dataset.price = price;
        item.querySelector('.price-val').textContent = formatNumber(price);
        item.querySelector('.owned-val').textContent = item.dataset.owned;
    });

}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 🛑 Calculates NEW prices based on current mode/ranges. */
function calculateNewPrices() {
    const ranges = isAbuseMode ? abuseRanges : normalRanges;
    const newPrices = {};

    items.forEach(item => {
        let price = marketPrices[item.id];
        const range = ranges[item.id];
        const change = randInt(range.min, range.max);
        price = Math.max(10, price + change);
        newPrices[item.id] = Math.round(price);
    });

    return newPrices;
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


// 🛑 ================= Buy/Sell/Trade (Uses marketPrices) ================= 🛑
buyBtn.addEventListener('click', () => {
    // 🛑 الشرط المُصحح ليتوقف عند التحميل فقط
    if (buyBtn.disabled || isLoadingData) return; 
    
    if (!selectedItem) return flashButton(buyBtn, '❌', 'red');
    const qty = parseInt(amountInput.value, 10);
    if (!qty || qty <= 0) return flashButton(buyBtn, '❌', 'red');

    const itemID = selectedItem.id;
    const price = marketPrices[itemID] || parseInt(selectedItem.dataset.price, 10); 
    const totalPrice = price * qty; 
    
    let owned = parseInt(selectedItem.dataset.owned, 10);
    const maxLimit = getAssetLimit(itemID);
    
    if (owned + qty > maxLimit) {
        const msg = `Max: ${maxLimit}`;
        flashButton(buyBtn, msg, 'red', 2000);
        applyCooldown(buyBtn);
        return;
    }
    
    if (balance >= totalPrice) {
        balance -= totalPrice;
        owned += qty;
        selectedItem.dataset.owned = owned;
        updatePricesUI(); 
        saveUserData(); 
        flashButton(buyBtn, '✅', '#00ffb3');
        applyCooldown(buyBtn);
    } else {
        flashButton(buyBtn, '❌', 'red');
        applyCooldown(buyBtn);
    }
});

sellBtn.addEventListener('click', () => {
  if (sellBtn.disabled || isLoadingData) return;
  
  if (!selectedItem) return flashButton(sellBtn, '❌', 'red');
  const qty = parseInt(amountInput.value, 10);
  if (!qty || qty <= 0) return flashButton(sellBtn, '❌', 'red');
  let owned = parseInt(selectedItem.dataset.owned, 10);
  
  if (owned < qty) {
    flashButton(sellBtn, '❌', 'red');
    applyCooldown(sellBtn);
    return;
  }
  
  const price = marketPrices[selectedItem.id] || parseInt(selectedItem.dataset.price, 10); 
  const totalPrice = price * qty;

  owned -= qty;
  balance += totalPrice;
  selectedItem.dataset.owned = owned;
  updatePricesUI(); 
  saveUserData(); 
  flashButton(sellBtn, '✅', '#00ffb3');
  applyCooldown(sellBtn);
});

tradeInput.value = 50000;

tradeBtn.addEventListener('click', () => {
  if (tradeBtn.disabled || isLoadingData) return;
  
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
      updatePricesUI(); 
      saveUserData(); 
      
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
    if (isLoadingData) return; 
    const amount = parseInt(bankAmountInput.value);
    
    if (amount <= 0 || isNaN(amount)) {
        flashButton(depositBtn, '❌', 'red');
        return;
    }
    
    if (balance >= amount) {
        balance -= amount;
        bankBalance += amount;
        bankAmountInput.value = 0; 
        updatePricesUI(); 
        saveUserData(); 
        flashButton(depositBtn, '✅', '#00ffb3');
    } else {
        flashButton(depositBtn, '❌', 'red');
    }
});

withdrawBtn.addEventListener('click', () => {
    if (isLoadingData) return; 
    const amount = parseInt(bankAmountInput.value);

    if (amount <= 0 || isNaN(amount)) {
        flashButton(withdrawBtn, '❌', 'red');
        return;
    }

    if (bankBalance >= amount) {
        bankBalance -= amount;
        balance += amount;
        bankAmountInput.value = 0; 
        updatePricesUI(); 
        saveUserData(); 
        flashButton(withdrawBtn, '✅', '#00ffb3');
    } else {
        flashButton(withdrawBtn, '❌', 'red');
    }
});

bankBtn.addEventListener("click", () => {
  if (isLoadingData) return;
  document.getElementById('bankPopup').style.display = "flex";
  updatePricesUI();
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

function spinWheelAction() {
    if (isSpinning || updateSpinCooldown() > 0 || isLoadingData) {
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
            updatePricesUI(); 
            saveUserData(); 
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
  if (isLoadingData) return;
  spinPopup.style.display = "flex";
  updateSpinCooldown(); 
  updatePricesUI();
});


// ================= Mazen’s Abuse Timer (Synced) =================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/** 🛑 Updates the visual timer for Abuse Mode / Price Update */
function updateMarketTimers(lastUpdate, isAbuse, cycleStartTime) {
    const now = Date.now();
    const elapsedSinceCycleStart = Math.floor((now - cycleStartTime) / 1000);
    const elapsedSinceUpdate = Math.floor((now - lastUpdate) / 1000);
    
    let updateInterval;
    let cycleDuration;
    
    // 1. Price Update Timer (The small timer)
    if (isAbuse) {
        updateInterval = PRICE_UPDATE_INTERVAL_ABUSE;
        priceTimerEl.textContent = "Mazen’s Abuse 🔥";
    } else {
        updateInterval = PRICE_UPDATE_INTERVAL_NORMAL;
        const nextPriceUpdate = updateInterval - (elapsedSinceUpdate % updateInterval);
        priceTimerEl.textContent = formatTime(nextPriceUpdate);
    }

    // 2. Abuse Cycle Timer (The big timer)
    if (isAbuse) {
        // If in Abuse Mode, the timer should count down the remaining Abuse time
        cycleDuration = ABUSE_DURATION;
        const remainingAbuseTime = ABUSE_DURATION - (elapsedSinceCycleStart % (NORMAL_DURATION + ABUSE_DURATION));
        
        if (remainingAbuseTime > 0) {
            abuseTimerEl.textContent = formatTime(remainingAbuseTime);
            abuseBox.classList.add('active');
        } else {
             // Should not happen, but for safety
             abuseTimerEl.textContent = formatTime(0);
             abuseBox.classList.remove('active');
        }

    } else {
        // If in Normal Mode, the timer should count down the remaining Normal time
        cycleDuration = NORMAL_DURATION;
        // Total Cycle Time - (Elapsed time since the start of the current normal cycle)
        const timeSinceNormalStart = elapsedSinceCycleStart % (NORMAL_DURATION + ABUSE_DURATION);
        const remainingNormalTime = NORMAL_DURATION - timeSinceNormalStart;
        
        if (remainingNormalTime > 0) {
             abuseTimerEl.textContent = formatTime(remainingNormalTime);
             abuseBox.classList.remove('active');
        } else {
             // This means we are in the ABUSE phase (the listener should correct this)
             abuseTimerEl.textContent = formatTime(ABUSE_DURATION); 
        }
    }
}


// 🛑 ================= FIREBASE DATA MANAGEMENT (MODIFIED) ================= 🛑

function calculateNetWorth() {
    let totalAssetValue = 0;
    
    items.forEach(item => {
        const price = marketPrices[item.id] || parseInt(item.dataset.price, 10); 
        const owned = parseInt(item.dataset.owned, 10); 
        totalAssetValue += price * owned;
    });

    playerNetWorth = balance + bankBalance + totalAssetValue;
    return playerNetWorth;
}


/** Saves all player data and game state to Firestore. Called on major actions OR sync. */
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
    } catch (e) {
        console.error("Error saving document: ", e);
    }
}

/** Loads player data from Firestore. */
async function loadUserData() {
    if (!currentUserID) return;
    
    try {
        const docRef = doc(db, "players", String(currentUserID));
        const docSnap = await getDoc(docRef, { source: 'server' }); 

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

        updateCryptoLock(); 
        updateStatusPopup(); 
        
        // 🛑 Hide the loading screen AFTER successful data load
        loadingPopup.style.display = 'none';
        isLoadingData = false; // 🛑 **الإصلاح النهائي: يتم تشغيل الأزرار الآن**

    } catch (e) {
        console.error("Error loading document: ", e);
        // ... (Error handling remains the same) ...
        loadingPopup.querySelector('h2').textContent = "Connection Error ❌";
        loadingPopup.querySelector('p').textContent = "Failed to synchronize data. Check network or refresh.";
        loadingPopup.querySelector('.spinner').style.display = 'none';
        
        // **الإصلاح النهائي: تأكد من أن الأزرار لا تعمل عند فشل الاتصال**
        isLoadingData = true; 
    }
}

// ... (updateLeaderboard, Status and Upgrade Logic remain the same) ...

/** Loads all player net worths for the leaderboard */
async function updateLeaderboard() {
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
    if (isLoadingData) return; 
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
        updatePricesUI(); 
        saveUserData(); 
        upgradeMsgEl.textContent = `Successfully upgraded to Level ${currentLevel}! 🎉`;
        upgradeMsgEl.style.color = '#00ffb3';
    } else {
        upgradeMsgEl.textContent = 'Upgrade failed. Check requirements!';
        upgradeMsgEl.style.color = 'red';
    }

    setTimeout(() => upgradeMsgEl.textContent = '', 3000);
}


// 🛑 ================= Time Reward Logic (Unchanged) ================= 🛑

const REWARD_AMOUNT = 100000;
const REWARD_INTERVAL = 300; 
let rewardSeconds = REWARD_INTERVAL; 
let isClaimReady = false; 

function updateRewardTimer() {
    if (isClaimReady) {
        rewardTimerDisplay.textContent = "READY TO CLAIM!";
        claimRewardBtn.disabled = false;
        claimRewardBtn.classList.add('ready-to-claim');
        return;
    }
    
    rewardSeconds--;

    if (rewardSeconds <= 0) {
        rewardSeconds = 0;
        isClaimReady = true;
        return;
    }

    rewardTimerDisplay.textContent = formatTime(rewardSeconds);
    claimRewardBtn.disabled = true;
    claimRewardBtn.classList.remove('ready-to-claim');
}

function startRewardTimer(initialSeconds) {
    rewardSeconds = initialSeconds;
    isClaimReady = (rewardSeconds <= 0);
    updateRewardTimer(); 
}

function claimTimeReward() {
    if (!isClaimReady || isLoadingData) return; 

    balance += REWARD_AMOUNT;
    
    flashButton(claimRewardBtn, `+${formatNumber(REWARD_AMOUNT)}$ ✅`, '#00ffb3', 2000);
    
    lastClaimTime = Date.now();
    isClaimReady = false; 
    
    startRewardTimer(REWARD_INTERVAL);
    updatePricesUI(); 
    saveUserData(); 

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

// 🛑 ================= MARKET SYNC & ABUSE TIMER LISTENER (NEW) ================= 🛑

let marketSnapshotUnsubscribe = null; 
let isMarketOwner = false; 

async function startMarketSync() {
    const marketRef = doc(db, "market", MARKET_DOC_ID);

    // 1. Initial Market Check (for new game start)
    try {
        const marketSnap = await getDoc(marketRef);
        if (!marketSnap.exists()) {
            isMarketOwner = true; 
            setInitialPrices(); 
            
            await setDoc(marketRef, {
                prices: marketPrices,
                isAbuseMode: false,
                lastPriceUpdate: Date.now(), 
                cycleStartTime: Date.now(), 
                ownerID: currentUserID 
            });
        }
    } catch (e) {
        console.error("Initial Market Check failed: ", e);
        // لا توقف اللعبة، بل اترك المستمع يحاول الاتصال
    }


    // 2. Setup Realtime Listener
    marketSnapshotUnsubscribe = onSnapshot(marketRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            
            // 🛑 Update local market state 🛑
            isAbuseMode = data.isAbuseMode || false;
            marketPrices = data.prices || marketPrices;
            marketLastUpdate = data.lastPriceUpdate || Date.now();
            const cycleStartTime = data.cycleStartTime || Date.now();
            const ownerID = data.ownerID;
            
            // Update UI based on new synced data
            updatePricesUI();
            updateMarketTimers(marketLastUpdate, isAbuseMode, cycleStartTime);
            
            // 3. Market Update Logic (Only one player acts as the "Owner" at a time)
            
            const now = Date.now();
            const elapsedSinceUpdate = Math.floor((now - marketLastUpdate) / 1000);
            
            const updateInterval = isAbuseMode ? PRICE_UPDATE_INTERVAL_ABUSE : PRICE_UPDATE_INTERVAL_NORMAL;
            const cycleDuration = isAbuseMode ? ABUSE_DURATION : NORMAL_DURATION;
            const totalCycleTime = NORMAL_DURATION + ABUSE_DURATION;
            
            const elapsedSinceCycleStart = Math.floor((now - cycleStartTime) / 1000);
            
            // check if we are due for a mode change
            const isDueForModeChange = isAbuseMode ? (elapsedSinceCycleStart >= (cycleDuration + NORMAL_DURATION)) : (elapsedSinceCycleStart >= cycleDuration);
            
            
            // Determine Market Ownership
            // Player becomes owner if they are the designated owner OR if the current owner is offline
            isMarketOwner = (ownerID === currentUserID) || (elapsedSinceUpdate > (updateInterval * 3));
            
            if (!isLoadingData) {
                
                // A) Check for cycle change (Abuse <-> Normal)
                if (isDueForModeChange) {
                    if (isMarketOwner) {
                         // Switch Mode
                        const newMode = !isAbuseMode;
                        const newCycleStartTime = now - (isAbuseMode ? NORMAL_DURATION : 0); // Reset or adjust start time
                        
                        // Force a price update immediately after mode switch
                        const newPrices = calculateNewPrices();
                        
                        updateDoc(marketRef, {
                            isAbuseMode: newMode,
                            cycleStartTime: newCycleStartTime,
                            prices: newPrices,
                            lastPriceUpdate: now,
                            ownerID: currentUserID // Claim ownership on cycle change
                        });
                        return; 
                    }
                }
                
                // B) Check for regular price update
                const elapsedSinceLastPriceUpdate = Math.floor((now - marketLastUpdate) / 1000);
                
                if (elapsedSinceLastPriceUpdate >= updateInterval) {
                     if (isMarketOwner) {
                        const newPrices = calculateNewPrices();
                        updateDoc(marketRef, { prices: newPrices, lastPriceUpdate: now });
                    }
                }
            }

        } else {
             console.error("Market document does not exist! Re-initializing...");
             // This can happen if the doc was deleted. Set owner to true to re-create it.
             isMarketOwner = true;
             setInitialPrices();
             updateDoc(marketRef, {
                prices: marketPrices,
                isAbuseMode: false,
                lastPriceUpdate: Date.now(), 
                cycleStartTime: Date.now(), 
                ownerID: currentUserID 
            });
        }
    });
}


// ================= Event Binding (Unchanged) =================

document.getElementById('closeStatusPopup').addEventListener('click', () => closePopup(statusPopup));
document.getElementById('closeLeaderboardPopup').addEventListener('click', () => closePopup(leaderboardPopup));
document.getElementById('closeTimeRewardPopup').addEventListener('click', () => closePopup(timeRewardPopup));
document.getElementById('closeBankPopup').addEventListener('click', () => closePopup(bankPopup));
document.getElementById('closeSpinPopup').addEventListener('click', () => closePopup(spinPopup));


statusBtn.addEventListener("click", () => {
    if (isLoadingData) return;
    updateStatusPopup(); 
    statusPopup.style.display = "flex";
});

leaderboardBtn.addEventListener("click", () => {
    if (isLoadingData) return;
    updateLeaderboard(); 
    leaderboardPopup.style.display = "flex";
});

timeRewardBtn.addEventListener("click", () => {
    if (isLoadingData) return;
    timeRewardPopup.style.display = "flex";
});

claimRewardBtn.addEventListener("click", claimTimeReward);

upgradeBtn.addEventListener("click", performUpgrade);


// 🛑 ================= Startup and Authentication (Custom Token Flow - MODIFIED) ================= 🛑

async function startGame(token, pName) {
    currentUserID = token;
    playerName = pName;
    
    // 1. Start Market Sync FIRST, as it sets initial prices
    await startMarketSync(); 
    
    // 2. Load player data
    await loadUserData(); 
    
    // 3. Start 1-second sync engine
    if (syncEngine) clearInterval(syncEngine);
    const syncEngine = setInterval(() => {
        saveUserData();
        updateSpinCooldown();
        checkTimeElapsedAndStartTimer();
    }, 1000); 
}

/** Check if the player came from the login page using tempToken, or if they need to be redirected to login. */
function initialSetup() {
    const tempToken = localStorage.getItem('tempToken'); 
    const savedToken = localStorage.getItem('gameToken'); 
    const tempName = localStorage.getItem('tempPlayerName');
    
    // Check if player came from login (always prioritize tempToken)
    if (tempToken) {
        const finalName = tempName || `Trader ${tempToken}`;
        
        localStorage.removeItem('tempToken');
        localStorage.removeItem('tempPlayerName');
        
        startGame(tempToken, finalName);
    } 
    
    // Check if player has a saved token but didn't come from login (i.e. directly opened index.html)
    else if (savedToken) {
        // Redirect to login.html to force re-authentication (using saved token)
        window.location.replace('login.html');
    }
    
    // No token found, redirect to login
    else {
        window.location.replace('login.html');
    }
}

initialSetup();
