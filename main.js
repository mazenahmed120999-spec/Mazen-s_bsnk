// main.js - The full script code (V3: Corrected Sync & Abuse Timer)

// 🛑 Import Firebase modules and functions 🛑
// setDoc and updateDoc are needed now for market management
import { db, doc, setDoc, updateDoc, collection, getDocs, getDoc, onSnapshot } from './firebase-config.js';

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

// ... (Other elements like bank, spin, leaderboard, status) ...
// The rest of the element definitions remain the same as your previous code

const bankBtn = document.getElementById('bankButton');
const spinBtn = document.getElementById('spinBtn');
const leaderboardBtn = document.getElementById('leaderboardBtn');
const leaderboardPopup = document.getElementById('leaderboardPopup');
const leaderboardList = document.getElementById('leaderboardList');
const myNetWorthEl = document.getElementById('myNetWorth');
const statusBtn = document.getElementById('statusBtn');
const statusPopup = document.getElementById('statusPopup');
const levelsTrack = document.getElementById('levelsTrack');
const currentLevelDisplay = document.getElementById('currentLevelDisplay');
const upgradeBtn = document.getElementById('upgradeBtn');
const upgradeRequirementsEl = document.getElementById('upgradeRequirements');
const nextLevelNumEl = document.getElementById('nextLevelNum');
const upgradeMsgEl = document.getElementById('upgradeMsg');
const cryptoLock = document.getElementById('cryptoLock');
const ownedCarEl = document.getElementById('ownedCar');
const maxCarEl = document.getElementById('maxCar');
const ownedHouseEl = document.getElementById('ownedHouse');
const maxHouseEl = document.getElementById('maxHouse');
const maxPlaneEl = document.getElementById('maxPlane');
const maxGoldEl = document.getElementById('maxGold');
const maxCryptoEl = document.getElementById('maxCrypto');
const statusBankBalanceEl = document.getElementById('statusBankBalance');
const statusRankEl = document.getElementById('statusRank');
const timeRewardBtn = document.getElementById('timeRewardBtn');
const timeRewardPopup = document.getElementById('timeRewardPopup');
const rewardTimerDisplay = document.getElementById('rewardTimerDisplay');
const claimRewardBtn = document.getElementById('claimRewardBtn');

// Spin Elements
const spinWheel = document.getElementById("spinWheel");
const spinWheelBtn = document.getElementById("spinWheelBtn");
const spinResultEl = document.getElementById("spinResult");
const spinCooldownTimerEl = document.getElementById("spinCooldownTimer");

// Bank Elements
const bankPopup = document.getElementById('bankPopup'); 
const bankAmountInput = document.getElementById('bankAmount');
const bankBalanceDisplay = document.getElementById('bankBalanceDisplay');
const bankMaxBtn = bankPopup.querySelector('#maxBtn'); 
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');


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
let isLoadingData = true; 

let selectedItem = null;

// 🛑 MARKET SYNC VARIABLES (NEW)
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
        const price = marketPrices[itemID] || parseInt(item.dataset.price, 10); // Use synced price or fallback
        
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

// ... (FlashButton and ApplyCooldown remain the same) ...

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


// 🛑 ================= Buy/Sell/Trade (MODIFIED to use marketPrices) ================= 🛑
buyBtn.addEventListener('click', () => {
    if (buyBtn.disabled || isLoadingData) return;
    
    if (!selectedItem) return flashButton(buyBtn, '❌', 'red');
    const qty = parseInt(amountInput.value, 10);
    if (!qty || qty <= 0) return flashButton(buyBtn, '❌', 'red');

    const itemID = selectedItem.id;
    const price = marketPrices[itemID] || parseInt(selectedItem.dataset.price, 10); // Use synced price
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
        updatePricesUI(); // Rerender UI
        saveUserData(); // Save after successful transaction
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
  
  const price = marketPrices[selectedItem.id] || parseInt(selectedItem.dataset.price, 10); // Use synced price
  const totalPrice = price * qty;

  owned -= qty;
  balance += totalPrice;
  selectedItem.dataset.owned = owned;
  updatePricesUI(); // Rerender UI
  saveUserData(); // Save after successful transaction
  flashButton(sellBtn, '✅', '#00ffb3');
  applyCooldown(sellBtn);
});

// ... (Trade Logic remains the same) ...

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
      updatePricesUI(); // Rerender UI
      saveUserData(); // Save after successful transaction
      
      tradeBtn.textContent = `${perc >= 0 ? '+' : ''}${perc}% → ${gain >= 0 ? '+' : ''}${formatNumber(gain)}$`;
      
      setTimeout(() => {
        tradeBtn.textContent = originalText;
      }, 2000);
    }
  }, 2000); 
});

// ... (Bank/Spin Logic remains the same) ...
// NOTE: Deposit/Withdraw/Spin logic already calls saveUserData()

// ================= Mazen’s Abuse Timer (REMOVED LOCAL TIMER, NOW PURELY SYNCED) ================= 

/** 🛑 Updates the visual timer for Abuse Mode / Price Update */
function updateMarketTimers(lastUpdate, isAbuse, startTime) {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - lastUpdate) / 1000);
    
    let cycleDuration;
    let updateInterval;
    let timerDuration;

    if (isAbuse) {
        cycleDuration = ABUSE_DURATION;
        updateInterval = PRICE_UPDATE_INTERVAL_ABUSE;
        timerDuration = NORMAL_DURATION; // Use the end of the normal cycle time as a base
        
        abuseBox.classList.add('active');
        priceTimerEl.textContent = "Mazen’s Abuse 🔥";
    } else {
        cycleDuration = NORMAL_DURATION;
        updateInterval = PRICE_UPDATE_INTERVAL_NORMAL;
        timerDuration = ABUSE_DURATION; // Use the end of the abuse cycle time as a base
        
        abuseBox.classList.remove('active');
        
        const nextPriceUpdate = updateInterval - (elapsedSeconds % updateInterval);
        priceTimerEl.textContent = formatTime(nextPriceUpdate);
    }

    // Abuse Cycle Timer Logic (The BIG Timer)
    const cycleStartElapsed = Math.floor((now - startTime) / 1000);
    const timeRemaining = (timerDuration + cycleDuration) - cycleStartElapsed;

    if (timeRemaining > 0) {
        abuseTimerEl.textContent = formatTime(timeRemaining);
    } else {
        // Should not happen if start time is managed correctly by the 'owner'
        abuseTimerEl.textContent = isAbuse ? formatTime(ABUSE_DURATION) : formatTime(NORMAL_DURATION);
    }
}


// 🛑 ================= FIREBASE DATA MANAGEMENT (MODIFIED) ================= 🛑

// ... (calculateNetWorth remains the same) ...

function calculateNetWorth() {
    let totalAssetValue = 0;
    
    items.forEach(item => {
        const price = marketPrices[item.id] || parseInt(item.dataset.price, 10); // Use synced price
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

        // 🛑 Final setup after loading/setting defaults (Don't run render/timers yet)
        updateCryptoLock(); 
        updateStatusPopup(); 
        
        // 🛑 Hide the loading screen AFTER successful data load
        loadingPopup.style.display = 'none';
        isLoadingData = false;

    } catch (e) {
        console.error("Error loading document: ", e);
        // ... (Error handling remains the same) ...
        loadingPopup.querySelector('h2').textContent = "Connection Error ❌";
        loadingPopup.querySelector('p').textContent = "Failed to synchronize data. Check network or refresh.";
        loadingPopup.querySelector('.spinner').style.display = 'none';
    }
}

// ... (updateLeaderboard, Status and Upgrade Logic remain the same) ...

// 🛑 ================= MARKET SYNC & ABUSE TIMER LISTENER (NEW) ================= 🛑

let marketSnapshotUnsubscribe = null; 
let isMarketOwner = false; // Flag for the player who manages market updates

async function startMarketSync() {
    const marketRef = doc(db, "market", MARKET_DOC_ID);

    // 1. Initial Market Check (for new game start)
    const marketSnap = await getDoc(marketRef);
    if (!marketSnap.exists()) {
        isMarketOwner = true; // The first player is the market owner (for now)
        setInitialPrices(); // Initialize prices locally
        
        await setDoc(marketRef, {
            prices: marketPrices,
            isAbuseMode: false,
            // Last update to prevent race conditions during startup
            lastPriceUpdate: Date.now(), 
            // Time when the current cycle started (Normal or Abuse)
            cycleStartTime: Date.now(), 
            // The user ID of the player who currently has ownership for updates (Optional but good practice)
            ownerID: currentUserID 
        });
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
            const cycleExpired = elapsedSinceCycleStart >= cycleDuration;
            
            isMarketOwner = (ownerID === currentUserID);
            
            // The first player to notice the condition applies the change
            if ((ownerID === undefined || ownerID === currentUserID || elapsedSinceUpdate > (updateInterval * 2)) && !isLoadingData) {
                
                // A) Check for cycle change (Abuse -> Normal or Normal -> Abuse)
                if (elapsedSinceCycleStart >= totalCycleTime && ownerID !== currentUserID) {
                    // Force the first player to become the new owner if the cycle time has totally passed
                    isMarketOwner = true;
                    updateDoc(marketRef, { ownerID: currentUserID, cycleStartTime: now });
                }

                if (cycleExpired) {
                    if (isMarketOwner) {
                         // Switch Mode
                        const newMode = !isAbuseMode;
                        const newCycleStartTime = now;
                        
                        // Force a price update immediately after mode switch
                        const newPrices = calculateNewPrices();
                        
                        updateDoc(marketRef, {
                            isAbuseMode: newMode,
                            cycleStartTime: newCycleStartTime,
                            prices: newPrices,
                            lastPriceUpdate: now
                        });
                        return; // Done for this cycle
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
             console.error("Market document does not exist!");
             // Optionally restart the game or show an error.
        }
    });
}

// 🛑 ================= Startup and Authentication (MODIFIED) ================= 🛑

async function startGame(token, pName) {
    currentUserID = token;
    playerName = pName;
    
    // 1. Start Market Sync FIRST, as it sets initial prices
    await startMarketSync(); // This waits for the initial check/setup
    
    // 2. Load player data
    await loadUserData(); 
    
    // 3. Start 1-second sync engine
    if (syncEngine) clearInterval(syncEngine);
    // syncData is now only responsible for player data save and local timers (spin/reward)
    const syncEngine = setInterval(() => {
        saveUserData();
        updateSpinCooldown();
        checkTimeElapsedAndStartTimer();
        // Market timers update via onSnapshot
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
        
        // Remove temp data right after reading it
        localStorage.removeItem('tempToken');
        localStorage.removeItem('tempPlayerName');
        
        // Start the game
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
