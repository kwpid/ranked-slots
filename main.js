const aiNames = [
    // Lower rank names
    "L",
    "kupid",
    "l0st",
    "jayleng",
    "weweewew",
    "RisingPhoinex87",
    "dr.1",
    "prot",
    "hunt",
    "kif",
    "?",
    "rivverott",
    "1x Dark",
    "Moxxy!",
    "ä",
    "شغثغخ",
    "dark!",
    "Vortex",
    "FlickMaster17",
    "r",
    "Skywave!",
    "R3tr0",
    "TurboClash893",
    "Zynk",
    "Null_Force",
    "Orbital",
    "Boosted",
    "GravyTrain",
    "NitroNinja",
    "PixelPlay",
    "PhantomX",
    "Fury",
    "Zero!",
    "Moonlight",
    "QuickTap",
    "v1per",
    "Slugger",
    "MetaDrift",
    "Hydra",
    "Neo!",
    "ShadowDart",
    "SlipStream",
    "F1ick",
    "Karma",
    "Sparkz",
    "Glitch",
    "Dash7",
    "Ignite",
    "Cyclone",
    "Nova",
    "Opt1c",
    "Viral",
    "Stormz",
    "PyroBlast",
    "Bl1tz",
    "Echo",
    "Hover",
    "PulseRider",
];

let playerData = {
    username: "Player",
    title: "NONE",
    wins: 0,
    losses: 0,
    mmr: 600,
    peakMMR: 600,
    coins: 0,
    ownedTitles: ["NONE"],
    inventory: [], // Add this line
    currentSeason: 1,
    placementMatches: 0,
    inPlacements: true,
    seasonStats: {},
};
let aiData = {
    username: "",
    mmr: 600,
};

// === SEASON SYSTEM ===
// Season 1 started on Sep 22, 2025
const SEASON_1_START = new Date("2025-09-22T00:00:00Z");

function getCurrentSeason() {
    const now = new Date();
    const start = new Date(SEASON_1_START);

    // Calculate months difference using calendar months
    const yearDiff = now.getUTCFullYear() - start.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - start.getUTCMonth();
    const dayDiff = now.getUTCDate() - start.getUTCDate();

    let totalMonths = yearDiff * 12 + monthDiff;

    // If we haven't reached the start day of the month yet, subtract one month
    if (dayDiff < 0) {
        totalMonths -= 1;
    }

    return Math.max(1, totalMonths + 1);
}

function getSeasonStartDate(seasonNumber) {
    const startDate = new Date(SEASON_1_START);
    startDate.setUTCMonth(startDate.getUTCMonth() + (seasonNumber - 1));
    return startDate;
}

function getSeasonEndDate(seasonNumber) {
    const startDate = getSeasonStartDate(seasonNumber);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    return endDate;
}

function formatTimeRemaining(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${minutes}m ${seconds}s`;
    }
}

let seasonTimerInterval;

function updateSeasonTimer() {
    const currentSeason = getCurrentSeason();
    const seasonEnd = getSeasonEndDate(currentSeason);
    const now = new Date();
    const timeRemaining = seasonEnd.getTime() - now.getTime();

    const timerElement = document.getElementById("season-timer");
    if (timerElement) {
        if (timeRemaining > 0) {
            const formattedTime = formatTimeRemaining(timeRemaining);
            timerElement.textContent = `Season ends in: ${formattedTime}`;
        } else {
            timerElement.textContent = "Season ending...";
            // Check for season reset
            checkSeasonReset();
        }
    }
}

function startSeasonTimer() {
    // Clear any existing timer
    if (seasonTimerInterval) {
        clearInterval(seasonTimerInterval);
    }

    // Update immediately
    updateSeasonTimer();

    // Then update every second
    seasonTimerInterval = setInterval(updateSeasonTimer, 1000);
}

function checkSeasonReset() {
    const currentSeason = getCurrentSeason();
    if (playerData.currentSeason !== currentSeason) {
        // Handle multiple season transitions
        while (playerData.currentSeason < currentSeason) {
            const nextSeason = playerData.currentSeason + 1;
            performSeasonReset(nextSeason);
        }
    }
}

function performSeasonReset(newSeason) {
    // Save previous season stats
    if (!playerData.seasonStats) playerData.seasonStats = {};

    const prevSeason = playerData.currentSeason;
    if (prevSeason && prevSeason !== newSeason) {
        playerData.seasonStats[prevSeason] = {
            wins: playerData.wins,
            losses: playerData.losses,
            peakMMR: playerData.peakMMR,
            finalMMR: playerData.mmr,
            seasonTitles: getSeasonTitlesForSeason(prevSeason),
        };
    }

    // Perform soft reset similar to Rocket League
    const currentMMR = playerData.mmr;
    let newMMR;

    if (currentMMR >= 1200) {
        // High MMR players get larger reduction
        newMMR = Math.max(800, currentMMR - (currentMMR - 800) * 0.5);
    } else if (currentMMR >= 800) {
        // Mid MMR players get moderate reduction
        newMMR = Math.max(600, currentMMR - (currentMMR - 600) * 0.3);
    } else {
        // Low MMR players get small reduction
        newMMR = Math.max(400, currentMMR - (currentMMR - 400) * 0.1);
    }

    // Update player data for new season
    playerData.currentSeason = newSeason;
    playerData.mmr = Math.round(newMMR);
    playerData.peakMMR = Math.round(newMMR);
    playerData.placementMatches = 0;
    playerData.inPlacements = true;
    playerData.wins = 0;
    playerData.losses = 0;

    // AI also gets reset
    aiData.mmr = Math.round(newMMR * 0.9); // AI starts slightly lower

    savePlayerData();
    console.log(
        `Season ${newSeason} started! MMR reset from ${currentMMR} to ${newMMR}`,
    );
}

function getSeasonTitlesForSeason(seasonNumber) {
    return playerData.ownedTitles.filter(
        (title) =>
            title.startsWith(`S${seasonNumber} `) && !title.includes("RSCS"),
    );
}

function getRankFromName(rankName) {
    // Convert full rank name to base rank for season titles
    if (rankName === "Unranked") return "Unranked";
    if (rankName.includes("SuperSlot Legend")) return "SuperSlot Legend";
    if (rankName.includes("Grand Champion")) return "Grand Champion";
    if (rankName.includes("Champion")) return "Champion";
    if (rankName.includes("Diamond")) return "Diamond";
    if (rankName.includes("Platinum")) return "Platinum";
    if (rankName.includes("Gold")) return "Gold";
    if (rankName.includes("Silver")) return "Silver";
    if (rankName.includes("Bronze")) return "Bronze";
    return "Unranked";
}

function getSeasonTitleColor(rank, seasonNumber) {
    // Colors based on rank (case-insensitive)
    const normalizedRank =
        rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();
    const colors = {
        Bronze: "#8B4513", // brown
        Silver: "#C0C0C0", // grey
        Gold: "#FFD700", // goldish yellow
        Platinum: "#40E0D0", // light aqua
        Diamond: "#0066FF", // blue
        Champion: "#800080", // purple
        "Grand champion": seasonNumber % 2 === 1 ? "#FFD700" : "#FF0000", // gold for odd, red for even
        "Superslot legend": "#FFFFFF", // white
    };
    return colors[normalizedRank] || "#C0C0C0";
}

function createSeasonTitle(seasonNumber, rank) {
    if (rank === "Unranked") return null;

    // Normalize rank name to title case for color matching
    const normalizedRank =
        rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();

    return {
        title: `S${seasonNumber} ${rank.toUpperCase()}`,
        color: getSeasonTitleColor(normalizedRank, seasonNumber),
        glow: false, // Season titles have no glow per requirements
        minMMR: null,
        wlUsers: [],
        seasonTitle: true,
        season: seasonNumber,
        rank: normalizedRank,
    };
}

function getRankHierarchy() {
    // Returns ranks in order from lowest to highest
    return [
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
        "Champion",
        "Grand Champion",
        "SuperSlot Legend",
    ];
}

function getAllSeasonTitlesUpToRank(rank, seasonNumber) {
    const hierarchy = getRankHierarchy();
    const rankIndex = hierarchy.findIndex(
        (r) => r.toLowerCase() === rank.toLowerCase(),
    );

    if (rankIndex === -1) return []; // Unranked or invalid rank

    // Return all ranks from Bronze up to and including the achieved rank
    return hierarchy
        .slice(0, rankIndex + 1)
        .map((r) => createSeasonTitle(seasonNumber, r))
        .filter((title) => title !== null);
}

function checkForSeasonTitleUnlock(oldRank, newRank, seasonNumber) {
    const oldRankBase = getRankFromName(oldRank);
    const newRankBase = getRankFromName(newRank);
    
    // CRITICAL FIX: Ensure we always use the current calculated season, not the passed parameter
    // This prevents awarding titles with incorrect (higher) season numbers
    const currentCalculatedSeason = getCurrentSeason();

    if (oldRankBase !== newRankBase && newRankBase !== "Unranked") {
        // Get all season titles that should be awarded up to the new rank
        // FIXED: Use currentCalculatedSeason instead of seasonNumber to ensure correct season
        const titlesToAward = getAllSeasonTitlesUpToRank(
            newRankBase,
            currentCalculatedSeason,
        );

        titlesToAward.forEach((seasonTitle) => {
            if (
                seasonTitle &&
                !playerData.ownedTitles.includes(seasonTitle.title)
            ) {
                // Add to global titles array temporarily for notification system (with de-duplication)
                if (!titles.find(t => t.title === seasonTitle.title)) {
                    titles.push(seasonTitle);
                }
                playerData.ownedTitles.push(seasonTitle.title);
                showTitleNotification(seasonTitle);
                console.log(`Season title unlocked: ${seasonTitle.title}`);
            }
        });

        if (titlesToAward.length > 0) {
            savePlayerData();
        }
    }
}

// === RANK DISTRIBUTION SYSTEM ===
function loadRankDistribution() {
    const distribution = generateRankDistribution();
    displayRankDistribution(distribution);
}

function generateRankDistribution() {
    // Bell curve distribution with peak at Champion ranks
    // Total target: ~3000 players
    const baseDistribution = [
        { rank: "Bronze I", count: 20, class: "bronze" },
        { rank: "Bronze II", count: 25, class: "bronze" },
        { rank: "Bronze III", count: 30, class: "bronze" },
        { rank: "Silver I", count: 42, class: "silver" },
        { rank: "Silver II", count: 56, class: "silver" },
        { rank: "Silver III", count: 71, class: "silver" },
        { rank: "Gold I", count: 90, class: "gold" },
        { rank: "Gold II", count: 119, class: "gold" },
        { rank: "Gold III", count: 143, class: "gold" },
        { rank: "Platinum I", count: 177, class: "platinum" },
        { rank: "Platinum II", count: 215, class: "platinum" },
        { rank: "Platinum III", count: 247, class: "platinum" },
        { rank: "Diamond I", count: 273, class: "diamond" },
        { rank: "Diamond II", count: 287, class: "diamond" },
        { rank: "Diamond III", count: 263, class: "diamond" },
        { rank: "Champion I", count: 321, class: "champion" }, // Peak of bell curve
        { rank: "Champion II", count: 297, class: "champion" }, // Peak of bell curve  
        { rank: "Champion III", count: 273, class: "champion" }, // Peak of bell curve
    ];

    // Use actual AI data for Grand Champion and SuperSlot Legend counts
    let gcCounts = { gc1: 0, gc2: 0, gc3: 0 };
    let sslCount = 0;


    if (Array.isArray(specialAIs?.superSlotLegends)) {
        specialAIs.superSlotLegends.forEach(ai => {
            if (ai.mmr >= 1864) {
                sslCount++;
            } else if (ai.mmr >= 1708) {
                gcCounts.gc3++;
            } else if (ai.mmr >= 1575) {
                gcCounts.gc2++;
            } else if (ai.mmr >= 1403) {
                gcCounts.gc1++;
            }
            // AIs below 1403 won't be counted in GC/SSL distribution
        });
    }

    // Fallback to minimal counts if no AI data available
    if (sslCount === 0) sslCount = 12;
    if (gcCounts.gc1 === 0) gcCounts.gc1 = 8;
    if (gcCounts.gc2 === 0) gcCounts.gc2 = 6;
    if (gcCounts.gc3 === 0) gcCounts.gc3 = 4;

    const gcData = [
        { rank: "Grand Champion I", count: gcCounts.gc1, class: "grand-champion" },
        { rank: "Grand Champion II", count: gcCounts.gc2, class: "grand-champion" },
        { rank: "Grand Champion III", count: gcCounts.gc3, class: "grand-champion" },
    ];

    const sslData = [
        { rank: "SuperSlot Legend", count: sslCount, class: "superslot-legend" }
    ];

    return [...baseDistribution, ...gcData, ...sslData];
}

function displayRankDistribution(distribution) {
    const chartContainer = document.getElementById('rank-distribution-chart');
    const totalPlayers = distribution.reduce((sum, item) => sum + item.count, 0);
    const maxCount = Math.max(...distribution.map(item => item.count));
    
    // Update total players count
    document.getElementById('total-players').textContent = `~${totalPlayers.toLocaleString()}`;

    chartContainer.innerHTML = '';

    distribution.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'rank-distribution-item';

        const percentage = (item.count / maxCount) * 100;
        
        itemDiv.innerHTML = `
            <div class="rank-name">${item.rank}</div>
            <div class="rank-bar-container">
                <div class="rank-bar ${item.class}" style="width: ${percentage}%"></div>
            </div>
            <div class="rank-count">${item.count}</div>
        `;

        chartContainer.appendChild(itemDiv);
    });
}

const items = [
    {
        name: "Centio",
        type: "hero",
        price: 1500,
        rarity: "common",
        perks: { 1: 35, 2: 10 },
    },
    {
        name: "20XX",
        type: "skin",
        price: 250,
        rarity: "common",
        perks: { 1: 10, 2: 60 },
    },
];
let queueInterval;
let countdownInterval;
let spinInterval;
let gameActive = false; // Flag to control game state
let spacebarHeld = false; // Flag to track if spacebar is held

const jackpotProbability = 0.29;

document.addEventListener("keydown", (event) => {
    if (
        event.code === "Space" &&
        !event.repeat &&
        gameActive &&
        !spacebarHeld
    ) {
        spacebarHeld = true;
        spin("player");
        holdSpacebarToSpin();
    }
});
function cancelQueue() {
    // Clear the queue interval
    clearInterval(queueInterval);

    // Hide queue screen and show menu
    document.getElementById("queue-screen").classList.add("hidden");
    document.getElementById("menu-screen").classList.remove("hidden");

    // Reset title in page tab
    document.title = "Slot Machine Ranked";

    // Update menu display
    updateMenu();
    updateTitleDisplay();

    // Save data
    savePlayerData();
}
document.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
        spacebarHeld = false;
    }
});

function holdSpacebarToSpin() {
    if (spacebarHeld && gameActive) {
        setTimeout(() => {
            spin("player");
            holdSpacebarToSpin();
        }, 111); // Adjust interval for repeated spins
    }
}
function savePlayerData() {
    console.log("=== SAVING PLAYER DATA ===");
    try {
        console.log("Data to save:", playerData);

        const dataString = JSON.stringify(playerData);
        console.log("Serialized data length:", dataString.length);

        localStorage.setItem("playerData", dataString);

        // Verify the save worked
        const verification = localStorage.getItem("playerData");
        console.log(
            "Verification - saved data matches:",
            verification === dataString,
        );
        console.log("Data saved successfully to localStorage");
    } catch (error) {
        console.error("Error saving data:", error);
        console.log("Attempting fallback save...");

        try {
            // Fallback: try saving minimal data
            const minimalData = {
                username: playerData.username,
                title: playerData.title,
                wins: playerData.wins,
                losses: playerData.losses,
                mmr: playerData.mmr,
                peakMMR: playerData.peakMMR,
                coins: playerData.coins,
                ownedTitles: playerData.ownedTitles,
                inventory: playerData.inventory,
            };
            localStorage.setItem("playerData", JSON.stringify(minimalData));
            console.log("Fallback save successful");
        } catch (fallbackError) {
            console.error("Fallback save also failed:", fallbackError);
        }
    }
    console.log("=== SAVE COMPLETE ===");
}

function loadPlayerData() {
    console.log("=== LOADING PLAYER DATA ===");

    // Debug localStorage availability
    console.log(
        "localStorage available:",
        typeof Storage !== "undefined" && localStorage,
    );

    const savedData = localStorage.getItem("playerData");
    console.log("Raw saved data:", savedData);
    console.log("Saved data exists:", !!savedData);

    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            console.log("Parsed saved data:", parsedData);

            playerData = parsedData;

            // Initialize missing properties with defaults
            const defaultData = {
                username: "Player",
                title: "NONE",
                wins: 0,
                losses: 0,
                mmr: 600,
                peakMMR: 600,
                coins: 0,
                ownedTitles: ["NONE"],
                inventory: [],
                currentSeason: 1,
                placementMatches: 0,
                inPlacements: true,
                seasonStats: {},
            };

            console.log("Before merge - playerData:", playerData);
            console.log("Default data:", defaultData);

            // Merge defaults with saved data - saved data should win
            playerData = { ...defaultData, ...playerData };

            console.log("After merge - playerData:", playerData);

            // Ensure ownedTitles array exists and contains "NONE"
            if (
                !playerData.ownedTitles ||
                !Array.isArray(playerData.ownedTitles)
            ) {
                playerData.ownedTitles = ["NONE"];
            } else if (!playerData.ownedTitles.includes("NONE")) {
                playerData.ownedTitles.unshift("NONE");
            }

            // Initialize inventory if missing
            if (!playerData.inventory || !Array.isArray(playerData.inventory)) {
                playerData.inventory = [];
            }

            console.log("Final loaded player data:", playerData);

            // Check if we need a season reset
            checkSeasonReset();
        } catch (error) {
            console.error("Error parsing saved data:", error);
            // Fall back to new player setup
            initializeNewPlayer();
        }
    } else {
        console.log("No saved data found, initializing new player");
        initializeNewPlayer();
    }
    console.log("=== LOAD COMPLETE ===");
}

function initializeNewPlayer() {
    console.log("Initializing new player data");
    playerData.currentSeason = getCurrentSeason();
    playerData.placementMatches = 0;
    playerData.inPlacements = true;
    playerData.seasonStats = {};
    playerData.inventory = [];
    savePlayerData();
}

function rehydrateSeasonTitles() {
    // Recreate season titles from owned titles strings
    playerData.ownedTitles.forEach((titleName) => {
        const seasonMatch = titleName.match(/^S(\d+) (.+)$/);
        if (seasonMatch) {
            const seasonNumber = parseInt(seasonMatch[1]);
            const rank = seasonMatch[2]; // e.g., "GOLD", "GRAND CHAMPION"

            // Normalize rank from uppercase back to title case
            const normalizedRank = rank
                .split(" ")
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                )
                .join(" ");

            // Check if this title already exists in the titles array
            if (!titles.find((t) => t.title === titleName)) {
                const seasonTitle = createSeasonTitle(
                    seasonNumber,
                    normalizedRank,
                );
                if (seasonTitle) {
                    titles.push(seasonTitle);
                }
            }
        }
    });
}
function loadShop() {
    console.log("Loading Shop..."); // Debug log
    const shopContainer = document.getElementById("shop-hero");

    if (!shopContainer) {
        console.error("Shop container not found!");
        return;
    }

    shopContainer.innerHTML = ""; // Clear existing content

    const availableItems = items.filter((item) => item.type === "hero");
    console.log("Available Hero Items:", availableItems); // Debug log

    if (availableItems.length === 0) {
        shopContainer.innerHTML = "<p>No heroes available for purchase.</p>";
        return;
    }

    availableItems.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("shop-item");
        itemElement.innerHTML = `
              <h3>${item.name}</h3>
              <p>Perks: Click Boost ${item.perks[1]}%, Jackpot Increase ${item.perks[2]}%</p>
              <p class="price">${playerData.inventory.includes(item.name) ? "OWNED" : item.price + " Coins"}</p>
              <button onclick="purchaseItem('${item.name}')" ${playerData.inventory.includes(item.name) ? "disabled" : ""}>
                  ${playerData.inventory.includes(item.name) ? "Owned" : "Buy"}
              </button>
          `;
        shopContainer.appendChild(itemElement);
    });
}

function loadInventory() {
    const inventoryContainer = document.getElementById("inventory-hero");
    inventoryContainer.innerHTML = "<p>Your owned heroes...</p>"; // Clear previous items

    if (playerData.inventory.length === 0) {
        inventoryContainer.innerHTML += "<p>No heroes owned.</p>";
        return;
    }

    playerData.inventory.forEach((itemName) => {
        const item = items.find((i) => i.name === itemName);
        if (item) {
            const itemElement = document.createElement("div");
            itemElement.classList.add("inventory-item");
            itemElement.innerHTML = `
                  <h3>${item.name}</h3>
                  <p>Perks: Click Boost ${item.perks[1]}%, Jackpot Increase ${item.perks[2]}%</p>
                  <button class="button">Equip</button>
              `;
            inventoryContainer.appendChild(itemElement);
        }
    });
}

function purchaseItem(itemName) {
    const item = items.find((i) => i.name === itemName);
    if (!item || playerData.inventory.includes(itemName)) return;

    if (playerData.coins >= item.price) {
        if (
            confirm(
                `Are you sure you want to buy ${item.name} for ${item.price} coins?`,
            )
        ) {
            playerData.coins -= item.price;
            playerData.inventory.push(item.name);
            savePlayerData();
            loadShop();
        }
    } else {
        alert("Not enough coins!");
    }
}

function getDailyShopRotation() {
    const date = new Date();
    const seed = date.getDate() + date.getHours() >= 12 ? 1 : 0;
    return items.filter((_, index) => index % 2 === seed);
}
window.onload = () => {
    loadPlayerData();
    updateMenu();
    // loadShop(); // Commented out - no shop elements in HTML
    updateTitleDisplay();
    startAISimulation();

    // Proper close button binding
    document
        .getElementById("close-title-popup")
        .addEventListener("click", function (e) {
            e.preventDefault();
            closePopup("title-popup");
        });

    // Other existing code...
    document.getElementById("ok-button").onclick = () =>
        closePopup("notification-popup");
    document.getElementById("equip-now-button").onclick = () => {
        closePopup("notification-popup");
        openPopup("title-popup");
    };
};
function editUsername() {
    console.log("=== EDIT USERNAME STARTED ===");
    console.log("Current playerData before edit:", playerData);

    const newUsername = prompt(
        "Enter your username (1-20 characters):",
        playerData.username,
    );
    console.log("User entered username:", newUsername);

    if (newUsername && newUsername.length <= 20) {
        console.log("Username is valid, updating playerData");
        playerData.username = newUsername;
        console.log("playerData after username change:", playerData);

        document.getElementById("username-display").textContent = newUsername;
        console.log("Updated display element");

        savePlayerData(); // Save the data after username change
        console.log("Called savePlayerData");
    } else {
        console.log("Username was invalid or cancelled");
    }
    console.log("=== EDIT USERNAME COMPLETE ===");
}
// Opens a popup
function openPopup(popupId) {
    if (popupId === "title-popup") {
        loadTitlesPopup();
    } else if (popupId === "rank-distribution-popup") {
        loadRankDistribution();
    }
    document.getElementById(popupId).style.display = "block";
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = "none";
    } else {
        console.error(`Popup with ID ${popupId} not found`);
    }
    return false; // Prevent default behavior
}

// Switches tabs inside Shop or Inventory
function switchTab(section, tab) {
    // Get all tab contents in the section
    let tabs = document.querySelectorAll(`#${section}-popup .tab-content`);
    tabs.forEach((tabContent) => tabContent.classList.add("hidden"));

    // Show the selected tab
    document.getElementById(`${section}-${tab}`).classList.remove("hidden");

    // Update active button style
    let buttons = document.querySelectorAll(`#${section}-popup .tab-button`);
    buttons.forEach((button) => button.classList.remove("active"));

    document
        .querySelector(
            `#${section}-popup .tab-button:nth-child(${tab === "hero" ? 1 : tab === "skin" ? 2 : 3})`,
        )
        .classList.add("active");
}

function startQueue() {
    document.getElementById("menu-screen").classList.add("hidden");
    document.getElementById("queue-screen").classList.remove("hidden");

    // Change the tab title
    document.title = "SMR | Searching...";

    const currentHour = new Date().getHours();
    let maxQueueTime = 2; // Default max queue time
    let mmrFactor = Math.max(0, (playerData.mmr - 600) / 200); // Increase time by MMR difference above 600

    // Adjust max queue time based on time of day
    if (currentHour >= 0 && currentHour < 6) {
        maxQueueTime = 54; // Longer wait times at night
    } else if (currentHour >= 18 && currentHour < 22) {
        maxQueueTime = 33; // Shorter wait times in the evening
    }

    maxQueueTime = Math.min(30, Math.round(maxQueueTime + mmrFactor * 2)); // Cap max time to 30 seconds
    document.querySelector("#queue-screen p:nth-of-type(2)").textContent =
        `Estimated Time: ${maxQueueTime}s`;

    // Randomize the actual match start time (±20% of maxQueueTime)
    const actualMatchTime = Math.floor(
        maxQueueTime * (0.8 + Math.random() * 0.2),
    ); // Between 80% and 120% of maxQueueTime

    let queueTime = 0;
    queueInterval = setInterval(() => {
        queueTime++;
        document.getElementById("queue-time").textContent = queueTime;

        // Match starts at the randomized actual time
        if (queueTime >= actualMatchTime) {
            clearInterval(queueInterval);
            startMatch();
        }
    }, 1000);
}

const titles = [
    {
        title: "NONE",
        color: "grey",
        glow: false,
        minMMR: 0,
        wlUsers: [],
    },

    // RSCS TITLES
    {
        title: "2-TIME WORLD CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },

    // SEASON 1
    {
        title: "RSCS S1 CHALLENGER",
        color: "#4da1f6",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    // regionals
    {
        title: "RSCS S1 REGIONAL CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 REGIONAL FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },

    // major 1
    {
        title: "RSCS S1 CHARLOTTE MAJOR CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 CHARLOTTE MAJOR FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 CHARLOTTE MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },

    // major 2
    {
        title: "RSCS S1 ORLANDO MAJOR CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 ORLANDO MAJOR FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 ORLANDO MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    // worlds
    {
        title: "RSCS S1 WORLDS CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "RSCS S1 WORLD CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },

    
    {
        title: "S1 BRONZE",
        color: "brown",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 SILVER",
        color: "grey",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 GOLD",
        color: "gold",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 PLATINUM",
        color: "aqua",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 DIAMOND",
        color: "blue",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 CHAMPION",
        color: "#7604b9",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 GRAND CHAMPION",
        color: "red",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S1 SUPERSLOT LEGEND",
        color: "white",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },

    {
        title: "S2 BRONZE",
        color: "brown",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 SILVER",
        color: "grey",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 GOLD",
        color: "gold",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 PLATINUM",
        color: "aqua",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 DIAMOND",
        color: "blue",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 CHAMPION",
        color: "#7604b9",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 GRAND CHAMPION",
        color: "gold",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S2 SUPERSLOT LEGEND",
        color: "white",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 BRONZE",
        color: "brown",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 SILVER",
        color: "grey",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 GOLD",
        color: "gold",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 PLATINUM",
        color: "aqua",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 DIAMOND",
        color: "blue",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 CHAMPION",
        color: "#7604b9",
        glow: false,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 GRAND CHAMPION",
        color: "red",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },
    {
        title: "S3 SUPERSLOT LEGEND",
        color: "white",
        glow: true,
        minMMR: null,
        wlUsers: [""],
    },

    

    {
        title: "OG",
        color: "grey",
        glow: false,
        minMMR: 600,
        wlUsers: [""],
    },
    {
        title: "RISING STAR",
        color: "grey",
        glow: false,
        minMMR: 294,
        wlUsers: [],
    },
    {
        title: "ELITE PLAYER",
        color: "grey",
        glow: false,
        minMMR: 475,
        wlUsers: [],
    },
    {
        title: "MASTER",
        color: "grey",
        glow: false,
        minMMR: 655,
        wlUsers: [],
    },
    {
        title: "SLOT LEGEND",
        color: "grey",
        glow: false,
        minMMR: 835,
        wlUsers: [],
    },
    {
        title: "CHALLENGER",
        color: "grey",
        glow: false,
        minMMR: 1075,
        wlUsers: [],
    },
    {
        title: "STAR GAZER",
        color: "grey",
        glow: false,
        minMMR: 1350,
        wlUsers: [],
    },
    {
        title: "ULTIMATE LEGEND",
        color: "grey",
        glow: false,
        minMMR: 1800,
        wlUsers: [],
    },
];

function showNotification(title) {}

const specialAIs = {
    superSlotLegends: [
  { "name": "yumi", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "drali", "title": "RSCS S1 WORLD FINALIST", "mmr": 1995 },
  { "name": "wez", "title": "RSCS S1 CHARLOTTE MAJOR CONTENDER", "mmr": 1882 },
  { "name": "brickbybrick", "title": "RSCS S1 WORLD FINALIST", "mmr": 2007 },
  { "name": "Rw9", "title": "RSCS S1 ELITE", "mmr": 1940 },
  { "name": "dark", "title": "RSCS S1 CHARLOTTE MAJOR CONTENDER", "mmr": 1880 },
  { "name": "mawykzy!", "title": "RSCS S1 WORLD CONTENDER", "mmr": 2050 },
  { "name": "Speed", "title": "RSCS S1 WORLD CONTENDER", "mmr": 2093 },
  { "name": ".", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1910 },
  { "name": "koto", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1868 },
  { "name": "dani", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1879 },
  { "name": "Qwert (OG)", "title": "RSCS S1 WORLD CONTENDER", "mmr": 2085 },
  { "name": "dr.k", "title": "RSCS S1 ELITE", "mmr": 1936 },
  { "name": "Void", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1906 },
  { "name": "moon.", "title": "RSCS S1 WORLD CONTENDER", "mmr": 2072 },
  { "name": "Lru", "title": "S1 SUPERSLOT LEGEND", "mmr": 1869 },
  { "name": "Kha0s", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2004 },
  { "name": "rising.", "title": "S1 GRAND CHAMPION", "mmr": 1866 },
  { "name": "?", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1888 },
  { "name": "dynamo", "title": "RSCS S1 CHALLENGER", "mmr": 2100 },
  { "name": "f", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1925 },
  { "name": "Hawk!", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2022 },
  { "name": "zen", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1903 },
  { "name": "v", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1873 },
  { "name": "a7md", "title": "RSCS S1 CHALLENGER", "mmr": 2088 },
  { "name": "sieko", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2001 },
  { "name": "Mino", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1868 },
  { "name": "dyinq", "title": "RSCS S1 CHALLENGER", "mmr": 2075 },
  { "name": "toxin", "title": "S2 GRAND CHAMPION", "mmr": 1884 },
  { "name": "Bez", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1909 },
  { "name": "velocity", "title": "RSCS S1 ELITE", "mmr": 1940 },
  { "name": "Chronic", "title": "RSCS S1 CHARLOTTE MAJOR CONTENDER", "mmr": 1882 },
  { "name": "Flinch", "title": "RSCS S1 CHALLENGER", "mmr": 2092 },
  { "name": "vatsi", "title": "RSCS S1 CONTENDER", "mmr": 1875 },
  { "name": "Xyzle", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "ca$h", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1865 },
  { "name": "Darkmode", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1888 },
  { "name": "nu3.", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1906 },
  { "name": "LetsG0Brand0n", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "VAWQK.", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1879 },
  { "name": "helu30", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1878 },
  { "name": "wizz", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2020 },
  { "name": "Sczribbles.", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1887 },
  { "name": "7up", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2003 },
  { "name": "unkown", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "t0es", "title": "RSCS S1 CHALLENGER", "mmr": 2099 },
  { "name": "Jynx.", "title": "RSCS S1 CHALLENGER", "mmr": 2070 },
  { "name": "Zapz", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1868 },
  { "name": "Aur0", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2002 },
  { "name": "Knight", "title": "RSCS S1 CHALLENGER", "mmr": 2084 },
  { "name": "Cliqz", "title": "RSCS S1 CONTENDER", "mmr": 1869 },
  { "name": "Pyro.", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1866 },
  { "name": "dash!", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1900 },
  { "name": "ven", "title": "RSCS S1 CHALLENGER", "mmr": 2100 },
  { "name": "flow.", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "zenith", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2005 },
  { "name": "volty", "title": "RSCS S1 CONTENDER", "mmr": 1866 },
  { "name": "Aqua!", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2012 },
  { "name": "Styx", "title": "RSCS S1 CHALLENGER", "mmr": 2100 },
  { "name": "cheeseboi", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2020 },
  { "name": "Heat.", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1883 },
  { "name": "Slyde", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2006 },
  { "name": "fl1p", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1868 },
  { "name": "Otto", "title": "RSCS S1 ELITE", "mmr": 1935 },
  { "name": "jetz", "title": "RSCS S1 CHALLENGER", "mmr": 2087 },
  { "name": "Crisp", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "snailracer", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "Flickz", "title": "RSCS S1 CHALLENGER", "mmr": 2073 },
  { "name": "tempo", "title": "RSCS S1 CHALLENGER", "mmr": 2100 },
  { "name": "Blaze.", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2008 },
  { "name": "skyfall", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1897 },
  { "name": "steam", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1917 },
  { "name": "storm", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "rek:3", "title": "RSCS S1 CONTENDER", "mmr": 1876 },
  { "name": "vyna1", "title": "S2 GRAND CHAMPION", "mmr": 1864 },
  { "name": "deltairlines", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2007 },
  { "name": "ph", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1908 },
  { "name": "trace", "title": "RSCS S1 CHALLENGER", "mmr": 2073 },
  { "name": "avidic", "title": "S2 GRAND CHAMPION", "mmr": 1938 },
  { "name": "tekk!", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1901 },
  { "name": "fluwo", "title": "RSCS S1 CHALLENGER", "mmr": 2065 },
  { "name": "climp?", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2003 },
  { "name": "zark", "title": "RSCS S1 ORLANDO MAJOR CONTENDER", "mmr": 1878 },
  { "name": "diza", "title": "RSCS S1 CHALLENGER", "mmr": 2076 },
  { "name": "O", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1868 },
  { "name": "Snooze", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2005 },
  { "name": "gode", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "cola", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "hush(!)", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2001 },
  { "name": "sh4oud", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "vvv", "title": "RSCS S1 CHALLENGER", "mmr": 2092 },
  { "name": "critt", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2026 },
  { "name": "darkandlost2009", "title": "RSCS S1 CHALLENGER", "mmr": 2071 },
  { "name": "pulse jubbo", "title": "RSCS S1 CHALLENGER", "mmr": 2079 },
  { "name": "pl havicic", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "ryft.", "title": "RSCS S1 CHALLENGER", "mmr": 2099 },
  { "name": "Lyric", "title": "RSCS S1 CHALLENGER", "mmr": 2088 },
  { "name": "dryft.", "title": "RSCS S1 CHALLENGER", "mmr": 2072 },
  { "name": "horiz", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2001 },
  { "name": "zeno", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1866 },
  { "name": "wavetidess", "title": "RSCS S1 CONTENDER", "mmr": 1869 },
  { "name": "loster", "title": "S1 GRAND CHAMPION", "mmr": 2079 },
  { "name": "mamba", "title": "S1 GRAND CHAMPION", "mmr": 2076 },
  { "name": "Jack", "title": "S1 SUPERSLOT LEGEND", "mmr": 2083 },
  { "name": "innadeze", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1865 },
  { "name": "s", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "offtenlost", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "bivo", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1865 },
  { "name": "Trace", "title": "RSCS S1 CHALLENGER", "mmr": 2068 },
  { "name": "Talon", "title": "RSCS S1 CHALLENGER", "mmr": 2067 },
  { "name": ".", "title": "RSCS S1 CHALLENGER", "mmr": 2090 },
  { "name": "{?}", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "rraze", "title": "RSCS S1 CHALLENGER", "mmr": 2088 },
  { "name": "Dark{?}", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2006 },
  { "name": "zenhj", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1865 },
  { "name": "rinshoros bf", "title": "RSCS S1 CHALLENGER", "mmr": 2072 },
  { "name": "Cipher", "title": "RSCS S1 CHALLENGER", "mmr": 2100 },
  { "name": "nova", "title": "RSCS S1 CHALLENGER", "mmr": 2083 },
  { "name": "juzz", "title": "RSCS S1 CHARLOTTE MAJOR CHAMPION", "mmr": 2094 },
  { "name": "officer", "title": "RSCS S1 CHALLENGER", "mmr": 2065 },
  { "name": "strike", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2020 },
  { "name": "Titan", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "comp", "title": "RSCS S1 CHALLENGER", "mmr": 2075 },
  { "name": "pahnton", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2008 },
  { "name": "Mirage", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1865 },
  { "name": "space", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2014 },
  { "name": "boltt", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "reeper", "title": "RSCS S1 CHALLENGER", "mmr": 2082 },
  { "name": "piza", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2016 },
  { "name": "cheese.", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 1864 },
  { "name": "frostbite", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "warthunderisbest", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2019 },
  { "name": "eecipe", "title": "RSCS S1 CHALLENGER", "mmr": 2086 },
  { "name": "quantum", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2013 },
  { "name": "vexz", "title": "RSCS S1 CHALLENGER", "mmr": 2076 },
  { "name": "zylo", "title": "RSCS S1 CHALLENGER", "mmr": 2080 },
  { "name": "frzno", "title": "RSCS S1 WORLD CHAMPION", "mmr": 2100 },
  { "name": "blurr", "title": "RSCS S1 CHALLENGER", "mmr": 2065 },
  { "name": "scythe!", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "wvr", "title": "RSCS S1 CHALLENGER", "mmr": 2079 },
  { "name": "nxt", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2023 },
  { "name": "griz", "title": "RSCS S1 CHALLENGER", "mmr": 2078 },
  { "name": "jolt", "title": "RSCS S1 CHALLENGER", "mmr": 2068 },
  { "name": "sift", "title": "RSCS S1 ORLANDO MAJOR FINALIST", "mmr": 2098 },
  { "name": "kryo", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2033 },
  { "name": "wvn", "title": "RSCS S1 CHALLENGER", "mmr": 2079 },
  { "name": "brixx", "title": "RSCS S1 CHALLENGER", "mmr": 2082 },
  { "name": "twixt", "title": "RSCS S1 CHALLENGER", "mmr": 2068 },
  { "name": "nyx", "title": "RSCS S1 CHALLENGER", "mmr": 2093 },
  { "name": "slyth", "title": "RSCS S1 CHALLENGER", "mmr": 2075 },
  { "name": "drex", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "qwi", "title": "RSCS S1 CHALLENGER", "mmr": 2088 },
  { "name": "voxx", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2020 },
  { "name": "triz", "title": "RSCS S1 CHALLENGER", "mmr": 2078 },
  { "name": "jynx", "title": "RSCS S1 CHALLENGER", "mmr": 2065 },
  { "name": "plyx", "title": "RSCS S1 CHALLENGER", "mmr": 2087 },
  { "name": "kryp", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2015 },
  { "name": "zex", "title": "RSCS S1 CHALLENGER", "mmr": 2069 },
  { "name": "brix", "title": "RSCS S1 CHALLENGER", "mmr": 2073 },
  { "name": "twixz", "title": "RSCS S1 CHALLENGER", "mmr": 2066 },
  { "name": "vyn", "title": "RSCS S1 REGIONAL FINALIST", "mmr": 2018 },
  { "name": "sypher", "title": "RSCS S1 CHALLENGER", "mmr": 2082 },
  { "name": "jyn", "title": "RSCS S1 CHALLENGER", "mmr": 2086 },
  { "name": "qry", "title": "RSCS S1 CHALLENGER", "mmr": 2100 },
  { "name": "neoo", "title": "RSCS S1 CHALLENGER", "mmr": 2084 },
  { "name": "kwpid", "title": "RSCS S1 CHALLENGER", "mmr": 2099 }




    ].map((ai) => {
        // Try to load saved MMR from localStorage
        const savedAI = localStorage.getItem(`ssl_ai_${ai.name}`);
        if (savedAI) {
            const parsed = JSON.parse(savedAI);
            // Ensure MMR stays within bounds (1864-2400)
            parsed.mmr = Math.max(1864, Math.min(2400, parsed.mmr));
            return parsed;
        }
        return ai;
    }),
};
function saveAIData(ai) {
    localStorage.setItem(`ssl_ai_${ai.name}`, JSON.stringify(ai));
}
function getRandomOpponent(currentAI) {
    const opponents = specialAIs.superSlotLegends.filter(
        (a) => a.name !== currentAI.name,
    );
    if (opponents.length === 0) return null;

    // Weight towards opponents with similar MMR
    const viableOpponents = opponents.filter(
        (opp) => Math.abs(opp.mmr - currentAI.mmr) <= 400,
    );

    const pool = viableOpponents.length > 0 ? viableOpponents : opponents;
    return pool[Math.floor(Math.random() * pool.length)];
}
let aiSimulationInterval;

function startAISimulation() {
    // Clear any existing interval
    if (aiSimulationInterval) {
        clearInterval(aiSimulationInterval);
    }
    
    // Simulate matches every 30 seconds instead of 20 (fewer games per hour)
    aiSimulationInterval = setInterval(() => {
        simulateAIBatch();
    }, 30000); // 30 seconds instead of 20
    
    // Also run once immediately
    simulateAIBatch();
}

function simulateAIBatch() {
    // Select only 30-50% of AIs per batch (random selection)
    const selectionPercentage = 0.3 + (Math.random() * 0.2); // 30% to 50%
    const selectedAIs = [...specialAIs.superSlotLegends]
        .sort(() => 0.5 - Math.random()) // Shuffle array
        .slice(0, Math.floor(specialAIs.superSlotLegends.length * selectionPercentage));
    
    // Simulate only 10-20 games total (not per AI)
    const totalGames = 10 + Math.floor(Math.random() * 11); // 10-20 games
    
    console.log(`Simulating ${totalGames} games with ${selectedAIs.length} selected AIs`);
    
    // Distribute games among selected AIs
    let gamesSimulated = 0;
    
    while (gamesSimulated < totalGames) {
        // Pick a random AI from the selected ones
        const ai = selectedAIs[Math.floor(Math.random() * selectedAIs.length)];
        const opponent = getRandomOpponent(ai);
        
        if (!opponent) continue;
        
        // Simulate one match
        const aiWinProbability = 1 / (1 + Math.pow(10, (opponent.mmr - ai.mmr) / 400));
        const aiWon = Math.random() < aiWinProbability;
        const mmrChange = calculateMMRChange(ai.mmr, opponent.mmr, aiWon);
        
        ai.mmr = Math.max(1864, Math.min(2400, ai.mmr + mmrChange));
        
        if (aiWon) {
            opponent.mmr = Math.max(1864, Math.min(2400, opponent.mmr - mmrChange));
            saveAIData(opponent);
        }
        
        saveAIData(ai);
        gamesSimulated++;
    }
    
    console.log(`Simulated ${gamesSimulated} matches with ${selectedAIs.length} selected AIs`);
}
function startMatch() {
    document.getElementById("queue-screen").classList.add("hidden");
    document.getElementById("match-screen").classList.remove("hidden");

    // Set player info
    document.getElementById("player-username").textContent = playerData.username;
    const playerTitleElement = document.getElementById("player-title");
    playerTitleElement.textContent = playerData.title;
    const playerTitle = titles.find((t) => t.title === playerData.title);
    if (playerTitle) {
        playerTitleElement.style.color = playerTitle.color;
        if (playerTitle.glow) {
            playerTitleElement.classList.add("glowing-title");
        } else {
            playerTitleElement.classList.remove("glowing-title");
        }
    }
    document.getElementById("player-rank").textContent = getRank(playerData.mmr);
    document.getElementById("player-mmr").textContent = playerData.mmr;

    // Set AI info based on player's MMR - FIXED VERSION
    if (playerData.mmr >= 1864) {
        // SuperSlot Legend rank - can face SSL AIs
        const eligibleAIs = specialAIs.superSlotLegends.filter(
            (ai) => Math.abs(ai.mmr - playerData.mmr) <= 200
        );

        let selectedAI;
        if (eligibleAIs.length > 0) {
            selectedAI = eligibleAIs[Math.floor(Math.random() * eligibleAIs.length)];
        } else {
            const widerPool = specialAIs.superSlotLegends.filter(
                (ai) => Math.abs(ai.mmr - playerData.mmr) <= 300
            );
            selectedAI = widerPool.length > 0
                ? widerPool[Math.floor(Math.random() * widerPool.length)]
                : specialAIs.superSlotLegends[Math.floor(Math.random() * specialAIs.superSlotLegends.length)];
        }

        aiData = {
            username: selectedAI.name,
            title: selectedAI.title,
            mmr: selectedAI.mmr, // Use the AI's actual MMR, no randomization
        };
    } else {
        // Regular AI - create a new AI with fixed MMR based on player's MMR
        const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];

        // Create AI with MMR close to player's MMR (±50 instead of ±100)
        const baseMMR = playerData.mmr;
        const mmrVariation = (Math.random() * 100) - 50; // -50 to +50
        aiData = {
            username: aiName,
            mmr: Math.max(0, baseMMR + mmrVariation), // Ensure MMR doesn't go below 0
            title: getRandomGreyTitle(),
        };
    }

    // Set AI display info
    document.getElementById("ai-username").textContent = aiData.username;
    const aiTitleElement = document.getElementById("ai-title");
    aiTitleElement.textContent = aiData.title;
    const aiTitle = titles.find((t) => t.title === aiData.title);
    if (aiTitle) {
        aiTitleElement.style.color = aiTitle.color;
        if (aiTitle.glow) {
            aiTitleElement.classList.add("glowing-title");
        } else {
            aiTitleElement.classList.remove("glowing-title");
        }
    }
    document.getElementById("ai-rank").textContent = getRank(aiData.mmr);
    document.getElementById("ai-mmr").textContent = Math.round(aiData.mmr);

    // Start countdown
    let countdown = 5;
    document.getElementById("countdown").textContent = countdown;

    countdownInterval = setInterval(() => {
        countdown--;
        document.getElementById("countdown").textContent = countdown;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            document.getElementById("countdown").style.display = "none";
            gameActive = true;
            aiAutoSpin();
        }
    }, 1000);
}

function getRandomGreyTitle() {
    const greyTitles = titles.filter(
        (title) => title.color === "grey" && title.title !== "NONE",
    );
    return greyTitles[Math.floor(Math.random() * greyTitles.length)].title;
}

function checkForNewTitles() {
    const availableTitles = getAvailableTitles();

    // Check if player has unlocked any new titles
    availableTitles.forEach((title) => {
        if (
            title &&
            title.title &&
            title.title !== "NONE" &&
            !playerData.ownedTitles.includes(title.title)
        ) {
            showTitleNotification(title);
            playerData.ownedTitles.push(title.title);
            savePlayerData();
        }
    });
}

function spin(player) {
    if (!gameActive) return; // Prevent spinning outside active game

    const results = Array.from({ length: 3 }, () =>
        Math.random() < jackpotProbability ? "J" : "-",
    );
    const slots =
        player === "player"
            ? ["player-slot-1", "player-slot-2", "player-slot-3"]
            : ["ai-slot-1", "ai-slot-2", "ai-slot-3"];
    slots.forEach((slot, index) => {
        document.getElementById(slot).textContent = results[index];
    });
    const jackpotCount = results.filter((r) => r === "J").length;
    if (jackpotCount === 3) {
        updateDots(player);
    }
    if (checkWinCondition()) {
        clearInterval(spinInterval);
        endGame(player === "player");
    }
}

// Add event listener to the spin button
// Note: Spin button uses inline onclick handler in HTML, no getElementById("spin-button") exists
// document.getElementById("spin-button").addEventListener("click", () => {
//     if (gameActive) {
//         spin("player");
//     }
// });

function getSpinInterval(mmr) {
    if (mmr >= 1400) return 110;
    if (mmr >= 1314) return 130; // S1 GRAND CHAMPION
    if (mmr >= 994) return 170; // S1 CHAMPION
    if (mmr >= 754) return 190; // S1 DIAMOND
    if (mmr >= 594) return 200; // S1 PLATINUM
    if (mmr >= 414) return 250; // S1 GOLD
    if (mmr >= 231) return 270; // S1 SILVER
    return 400; // S1 BRONZE and below
}

function aiAutoSpin() {
    const spinSpeed = getSpinInterval(aiData.mmr); // Get spin interval based on AI rank
    spinInterval = setInterval(() => {
        spin("ai");
    }, spinSpeed);
}

function updateDots(player) {
    const dots = player === "player" ? "player-dots" : "ai-dots";
    const dotElements = document
        .getElementById(dots)
        .getElementsByClassName("dot");
    for (let dot of dotElements) {
        if (!dot.classList.contains("active")) {
            dot.classList.remove("inactive");
            dot.classList.add("active");
            break;
        }
    }
}

function checkWinCondition() {
    const playerDots = document
        .getElementById("player-dots")
        .getElementsByClassName("active").length;
    const aiDots = document
        .getElementById("ai-dots")
        .getElementsByClassName("active").length;
    return playerDots === 5 || aiDots === 5;
}

function calculateMMRChange(playerMMR, opponentMMR, playerWon) {
    // Constants for MMR calculation
    const K = 32; // Base K-factor
    const MMR_SCALE = 400; // Scale factor for MMR difference
    const MIN_MMR_CHANGE = 8; // Minimum MMR change
    const MAX_MMR_CHANGE = 50; // Maximum MMR change

    // Calculate expected score using logistic function
    const expectedScore =
        1 / (1 + Math.pow(10, (opponentMMR - playerMMR) / MMR_SCALE));

    // Calculate actual score (1 for win, 0 for loss)
    const actualScore = playerWon ? 1 : 0;

    // Calculate base MMR change
    let mmrChange = Math.round(K * (actualScore - expectedScore));

    // Apply scaling based on MMR difference
    const mmrDiff = Math.abs(playerMMR - opponentMMR);
    if (mmrDiff > 200) {
        // Scale down MMR changes for large MMR differences
        const scaleFactor = Math.max(0.5, 1 - (mmrDiff - 200) / 1000);
        mmrChange = Math.round(mmrChange * scaleFactor);
    }

    // Ensure MMR change stays within bounds
    mmrChange = Math.max(
        MIN_MMR_CHANGE,
        Math.min(MAX_MMR_CHANGE, Math.abs(mmrChange)),
    );

    // Return positive or negative based on win/loss
    return playerWon ? mmrChange : -mmrChange;
}

function endGame(playerWon) {
    if (!gameActive) return;

    gameActive = false;
    clearInterval(spinInterval);
    clearInterval(countdownInterval);

    // Store old rank for season title comparison
    const oldRank = getRank(playerData.mmr);

    // Calculate MMR change using the new system
    const oldMMR = playerData.mmr;
    const mmrChange = calculateMMRChange(playerData.mmr, aiData.mmr, playerWon);
    playerData.mmr += mmrChange;

    // Get new rank for season title comparison
    const newRank = getRank(playerData.mmr);

    // Update stats and coins (unchanged)
    let coinsEarned = 0;
    if (playerWon) {
        playerData.wins++;
        coinsEarned = Math.floor(Math.random() * 6) + 10;
        playerData.coins += coinsEarned;
    } else {
        playerData.losses++;
    }

    // Handle placement matches
    if (playerData.inPlacements) {
        playerData.placementMatches++;
        if (playerData.placementMatches >= 5) {
            playerData.inPlacements = false;
            console.log("Placement matches completed!");
        }
    }

    // Update peak MMR (unchanged)
    if (playerData.mmr > playerData.peakMMR) {
        playerData.peakMMR = playerData.mmr;
    }

    // Check for season title unlocks when rank changes
    checkForSeasonTitleUnlock(oldRank, newRank, playerData.currentSeason);

    // If player is SSL and opponent is SSL AI, update AI's MMR
    if (
        playerData.mmr >= 1864 &&
        aiData.username &&
        specialAIs.superSlotLegends.some((ai) => ai.name === aiData.username)
    ) {
        const ai = specialAIs.superSlotLegends.find(
            (ai) => ai.name === aiData.username,
        );
        if (ai) {
            const aiMMRChange = calculateMMRChange(ai.mmr, oldMMR, !playerWon);
            ai.mmr = Math.max(1864, Math.min(2400, ai.mmr + aiMMRChange));
            saveAIData(ai);
        }
    }

    // Check for new titles (unchanged)
    checkForNewTitles();

    // Save data (unchanged)
    savePlayerData();

    // Show end screen (unchanged)
    document.getElementById("match-screen").classList.add("hidden");
    document.getElementById("end-screen").classList.remove("hidden");

    // Update end screen info (unchanged)
    document.getElementById("result").textContent = playerWon
        ? "Victory!"
        : "Defeat";
    document.getElementById("old-mmr").textContent = oldMMR;
    document.getElementById("new-mmr").textContent = playerData.mmr;
    document.getElementById("mmr-change").textContent =
        `MMR Change: ${mmrChange > 0 ? "+" : ""}${mmrChange}`;

    if (playerWon) {
        const coinsElement = document.getElementById("player-coins");
        coinsElement.textContent = `Coins Earned: +${coinsEarned}`;
        coinsElement.style.color = "#ffcc00";
    } else {
        const coinsElement = document.getElementById("player-coins");
        coinsElement.textContent = "";
    }

    // Update menu display (unchanged)
    updateMenu();
}

if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            console.log("Notification permission granted.");
        } else {
            console.log("Notification permission denied.");
        }
    });
}

function showDesktopNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Match Found!", {
            body: "A match has been found. Get ready to play!",
            icon: "images/match-icon.png", // Replace with your own icon path
        });

        notification.onclick = () => {
            // Bring the tab to focus when notification is clicked
            window.focus();
        };
    } else if (
        "Notification" in window &&
        Notification.permission !== "denied"
    ) {
        // Ask for permission again if it was not denied previously
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                showDesktopNotification();
            }
        });
    }
}

function goToMenu() {
    // Ensure data is saved before refresh
    savePlayerData();

    // Refresh page to fix bugs when returning to menu
    window.location.reload();
}
function getRankImage(rank) {
    // Remove division info if present (e.g., "Gold III - Div 2" → "Gold III")
    const baseRank = rank.split(" - ")[0];

    const rankImages = {
        "Bronze I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/939597fb-c29f-4607-9a76-9a6c5f1edf48.image.png?v=1724334781837",
        "Bronze II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/9965effe-4989-4504-9200-7f04b6b665a2.image.png?v=1724334793116",
        "Bronze III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a274e890-4257-4cd9-a02a-56bc80be47d3.image.png?v=1724334816902",
        "Silver I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/28b40287-5562-45ab-a236-5647e96f1d48.image.png?v=1724334852235",
        "Silver II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/6caddf21-bee3-46c3-9d27-05823806cb67.image.png?v=1724334861872",
        "Silver III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/faa8edc7-b482-4cc4-b5b0-ceed84627079.image.png?v=1724334871163",
        "Gold I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/df499a57-8fc0-4524-bdd0-2fae76ec9301.image.png?v=1724334902060",
        "Gold II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a0dedb5b-6bc3-4322-afbb-77cc07184fec.image.png?v=1724334909730",
        "Gold III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/d3a3b2fc-6fcf-4bdc-85cc-8da4f40b2993.image.png?v=1724334914955",
        "Platinum I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/2f23a5f7-efe3-45ee-9cb8-acd533b0d6c4.image.png?v=1724335263302",
        "Platinum II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/3103ab33-c432-43ff-93c3-69a08d1ca602.image.png?v=1724335271866",
        "Platinum III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/c0fa94d0-d195-42d1-92f1-cb082976bdff.image.png?v=1724335280781",
        "Diamond I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/db671aad-2dd6-4328-897f-3f259be82fc5.image.png?v=1724335489836",
        "Diamond II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/76c9b43e-d0f6-4b05-9f32-7243d522c5f1.image.png?v=1724335504082",
        "Diamond III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/07082c63-cce6-4ff1-bff3-c3fceedf2e54.image.png?v=1724335508559",
        "Champion I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a10c88af-e70d-4891-99e7-57abf90002d5.image.png?v=1724335525065",
        "Champion II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/3d397ae6-e026-45af-b4e3-180318bd415a.image.png?v=1724335551068",
        "Champion III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/c28f3b1a-1396-4f24-aec7-f289695e5695.image.png?v=1724335556235",
        "Grand Champion I":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/90ecba8a-55f9-457c-8834-2ec4ee1c97fe.image.png?v=1724335571459",
        "Grand Champion II":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a90fa27e-2330-45d1-8b74-377fb4028842.image.png?v=1724335635668",
        "Grand Champion III":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/30d7ef7b-605e-4830-aa4d-153e5f77d67b.image.png?v=1724335639506",
        "SuperSlot Legend":
            "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/21405196-dbc9-4527-91e7-9a41abc6a698.image.png?v=1724335671471",
    };

    return rankImages[baseRank] || rankImages["Unranked"];
}

function getPlayerWorldRank() {
    // Get all SSL AIs and sort by MMR
    const allPlayers = [...specialAIs.superSlotLegends];

    // Add player if they're SSL
    if (playerData.mmr >= 1864) {
        allPlayers.push({
            name: playerData.username,
            mmr: playerData.mmr,
            isPlayer: true,
        });
    }

    // Sort by MMR (highest to lowest)
    allPlayers.sort((a, b) => b.mmr - a.mmr);

    // Find player's rank
    const playerIndex = allPlayers.findIndex(
        (p) => p.name === playerData.username,
    );
    return playerIndex !== -1 ? playerIndex + 1 : null;
}

function updateMenu() {
    document.getElementById("username-display").textContent =
        playerData.username;

    // Update season information
    document.getElementById("current-season").textContent =
        playerData.currentSeason;
    const placementStatus = document.getElementById("placement-status");
    if (playerData.inPlacements) {
        placementStatus.textContent = `Placement matches: ${playerData.placementMatches}/5`;
        placementStatus.style.display = "block";
    } else {
        placementStatus.style.display = "none";
    }

    document.getElementById("wins").textContent = playerData.wins;
    document.getElementById("losses").textContent = playerData.losses;
    const totalGames = playerData.wins + playerData.losses;
    const winRate =
        totalGames > 0 ? ((playerData.wins / totalGames) * 100).toFixed(1) : 0;
    document.getElementById("winrate").textContent = `${winRate}%`;
    document.getElementById("peak-mmr").textContent = playerData.peakMMR;
    document.getElementById("peak-rank").textContent = getRank(
        playerData.peakMMR,
    );
    const rank = getRank(playerData.mmr);
    document.getElementById("current-rank").textContent = rank;
    document.getElementById("current-mmr").textContent = playerData.mmr;
    document.getElementById("rank-image").src = getRankImage(rank);
    document.getElementById("player-coins").textContent = playerData.coins;

    // Add leaderboard button if not already present
    if (!document.getElementById("leaderboard-button")) {
        const menuButtons = document.querySelector(
            "#menu-screen .button-container",
        );
        const leaderboardButton = document.createElement("button");
        leaderboardButton.id = "leaderboard-button";
        leaderboardButton.className = "button";
        leaderboardButton.textContent = "Leaderboard";
        leaderboardButton.onclick = () => {
            loadLeaderboard();
            openPopup("leaderboard-popup");
        };
        menuButtons.appendChild(leaderboardButton);
    }

    // Start season countdown timer
    startSeasonTimer();

    // Don't auto-save here - let explicit changes save themselves
    console.log(
        "updateMenu completed - NOT auto-saving to avoid overriding changes",
    );
}

function loadLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    leaderboardList.innerHTML = "";

    // Get all SSL AIs and sort by current MMR
    const allPlayers = [...specialAIs.superSlotLegends];

    // Add player if they're SSL
    if (playerData.mmr >= 1864) {
        allPlayers.push({
            name: playerData.username,
            mmr: playerData.mmr,
            isPlayer: true,
        });
    }

    // Sort by current MMR (highest to lowest)
    allPlayers.sort((a, b) => b.mmr - a.mmr);

    // Take top 25
    const top25 = allPlayers.slice(0, 50);

    // Create leaderboard entries
    top25.forEach((player, index) => {
        const entry = document.createElement("div");
        entry.className = `leaderboard-entry${player.isPlayer ? " player-entry" : ""}`;

        entry.innerHTML = `
            <div class="leaderboard-rank">#${index + 1}</div>
            <div class="leaderboard-player">
                <span class="leaderboard-username">${player.name}</span>
            </div>
            <div class="leaderboard-mmr">${Math.round(player.mmr)}</div>
        `;

        leaderboardList.appendChild(entry);
    });

    // Find player's rank in the full list
    const playerRank =
        allPlayers.findIndex((p) => p.name === playerData.username) + 1;

    // Add player stats above the close button
    const popupContent = document.querySelector(
        "#leaderboard-popup .popup-content",
    );
    const closeButton = popupContent.querySelector(".close-button");

    // Remove existing player stats if they exist
    const existingStats = popupContent.querySelector(".player-stats");
    if (existingStats) {
        existingStats.remove();
    }

    const playerStats = document.createElement("div");
    playerStats.className = "player-stats";
    playerStats.innerHTML = `
        <div class="player-stats-header">Your Stats</div>
        <div class="player-stats-content">
            <div class="player-stats-rank">Rank: ${playerRank ? `#${playerRank}` : "--"}</div>
            <div class="player-stats-mmr">MMR: ${Math.round(playerData.mmr)}</div>
        </div>
    `;

    // Insert player stats before the close button
    closeButton.parentNode.insertBefore(playerStats, closeButton);
}

function getTrendIndicator(player) {
    // For simplicity, we'll randomly show trends for AIs
    if (player.isPlayer) return ""; // Don't show for player

    const trend = Math.random();
    if (trend > 0.7) return "↑"; // Up trend
    if (trend < 0.3) return "↓"; // Down trend
    return "→"; // Neutral
}
function getRank(mmr) {
    const ranks = [
        { name: "Bronze I", min: 0, max: 173 },
        { name: "Bronze II", min: 174, max: 233 },
        { name: "Bronze III", min: 234, max: 293 },
        { name: "Silver I", min: 294, max: 354 },
        { name: "Silver II", min: 355, max: 414 },
        { name: "Silver III", min: 415, max: 474 },
        { name: "Gold I", min: 475, max: 534 },
        { name: "Gold II", min: 546, max: 594 },
        { name: "Gold III", min: 595, max: 654 },
        { name: "Platinum I", min: 655, max: 714 },
        { name: "Platinum II", min: 715, max: 763 },
        { name: "Platinum III", min: 764, max: 834 },
        { name: "Diamond I", min: 835, max: 892 },
        { name: "Diamond II", min: 893, max: 981 },
        { name: "Diamond III", min: 995, max: 1074 },
        { name: "Champion I", min: 1075, max: 1185 },
        { name: "Champion II", min: 1186, max: 1299 },
        { name: "Champion III", min: 1300, max: 1402 },
        { name: "Grand Champion I", min: 1403, max: 1574 },
        { name: "Grand Champion II", min: 1575, max: 1699 },
        { name: "Grand Champion III", min: 1708, max: 1864 },
        { name: "SuperSlot Legend", min: 1864, max: 9999 },
    ];
    // Find the rank based on MMR
    for (const rank of ranks) {
        if (mmr >= rank.min && mmr <= rank.max) {
            if (rank.name === "SuperSlot Legend") {
                return rank.name; // No divisions for this rank
            }
            // Calculate division (5 divisions)
            const divisionSize = Math.floor((rank.max - rank.min + 1) / 5);
            const division = Math.min(
                5,
                Math.floor((mmr - rank.min) / divisionSize) + 1,
            );
            return `${rank.name} - Div ${division}`;
        }
    }

    return "Unranked";
}

function getAvailableTitles() {
    const rscsOrder = [
        "WORLD CHAMPION",
        "WORLDS CONTENDER",
        "MAJOR CHAMPION",
        "MAJOR FINALIST",
        "MAJOR CONTENDER",
        "REGIONAL CHAMPION",
        "REGIONAL FINALIST",
        "REGIONAL CONTENDER",
        "ELITE",
        "CONTENDER",
        "CHALLENGER",
    ];

    const rankedOrder = ["SUPERSLOT LEGEND", "GRAND CHAMPION"];

    return titles
        .filter((title) => {
            if (title.title === "NONE") return true;
            if (title.wlUsers.includes(playerData.username)) return true;
            if (title.minMMR && playerData.mmr >= title.minMMR) return true;
            if (
                playerData.ownedTitles &&
                playerData.ownedTitles.includes(title.title)
            )
                return true;
            return false;
        })
        .sort((a, b) => {
            if (a.title === "NONE") return -1;
            if (b.title === "NONE") return 1;

            // Helper to classify title category
            const getCategory = (title) => {
                const isRSCS = title.startsWith("RSCS");
                const hasSeason = /S\d+/.test(title);
                const isChallenger = title.includes("CHALLENGER");
                const isRanked =
                    /^S\d+/.test(title) &&
                    rankedOrder.some((t) => title.includes(t));

                if (isRSCS && !hasSeason) return 0; // RSCS global
                if (isRSCS && hasSeason && isChallenger) return 2; // RSCS Challenger
                if (isRSCS && hasSeason) return 1; // RSCS S# Season
                if (isRanked) return 3; // Ranked
                return 4; // Other
            };

            const catA = getCategory(a.title);
            const catB = getCategory(b.title);
            if (catA !== catB) return catA - catB;

            // Sort inside same category
            if (catA === 0) {
                const aTier = rscsOrder.findIndex((t) => a.title.includes(t));
                const bTier = rscsOrder.findIndex((t) => b.title.includes(t));
                return aTier - bTier;
            }

            if (catA === 1 || catA === 2) {
                const aSeason = parseInt(a.title.match(/S(\d+)/)?.[1] || 0);
                const bSeason = parseInt(b.title.match(/S(\d+)/)?.[1] || 0);
                if (aSeason !== bSeason) return bSeason - aSeason;

                const aTier = rscsOrder.findIndex((t) => a.title.includes(t));
                const bTier = rscsOrder.findIndex((t) => b.title.includes(t));
                return aTier - bTier;
            }

            if (catA === 3) {
                const aSeason = parseInt(a.title.match(/S(\d+)/)?.[1] || 0);
                const bSeason = parseInt(b.title.match(/S(\d+)/)?.[1] || 0);
                if (aSeason !== bSeason) return bSeason - aSeason;

                const aRank = rankedOrder.findIndex((t) => a.title.includes(t));
                const bRank = rankedOrder.findIndex((t) => b.title.includes(t));
                return aRank - bRank;
            }

            // Grey last
            if (a.color === "grey" && b.color !== "grey") return 1;
            if (a.color !== "grey" && b.color === "grey") return -1;

            // Fallback alphabetical
            return a.title.localeCompare(b.title);
        });
}

function showTitleNotification(title) {
    const popup = document.getElementById("notification-popup");
    const titleElement = document.getElementById("new-title");

    // Set title text and style
    titleElement.textContent = title.title;
    titleElement.style.color = title.color;

    // Handle glow effect
    if (title.glow) {
        titleElement.classList.add("glowing-title");
    } else {
        titleElement.classList.remove("glowing-title");
    }

    // Show popup with animation
    popup.classList.remove("hidden");

    // Add event listeners for buttons
    document.getElementById("ok-button").onclick = () => {
        popup.classList.add("hidden");
    };

    document.getElementById("equip-now-button").onclick = () => {
        equipTitle(title.title);
        popup.classList.add("hidden");
    };
}

function equipTitle(title) {
    if (title === "NONE") {
        playerData.title = "NONE"; // Set to "NONE" instead of empty string
    } else {
        playerData.title = title;
    }
    savePlayerData();
    updateTitleDisplay();
    closePopup("title-popup");
}

function updateTitleDisplay() {
    const titleDisplay = document.getElementById("title-display");
    const currentTitleName = playerData.title || "NONE";
    const currentTitle = titles.find((t) => t.title === currentTitleName);

    if (currentTitle) {
        titleDisplay.textContent = currentTitle.title;
        titleDisplay.style.color = currentTitle.color;
        if (currentTitle.glow) {
            titleDisplay.classList.add("glowing-title");
        } else {
            titleDisplay.classList.remove("glowing-title");
        }
    }
}

function loadTitlesPopup() {
    const titlesList = document.getElementById("titles-list");
    titlesList.innerHTML = "";

    const availableTitles = getAvailableTitles();

    if (availableTitles.length === 0) {
        titlesList.innerHTML = "<p>No titles available</p>";
        return;
    }

    availableTitles.forEach((title) => {
        const titleElement = document.createElement("div");
        titleElement.classList.add("title-item");

        const titleSpan = document.createElement("span");
        titleSpan.textContent = title.title;
        titleSpan.style.color = title.color;
        if (title.glow) {
            titleSpan.classList.add("glowing-title");
        }

        // Add a checkmark if this is the currently equipped title
        if (title.title === playerData.title) {
            const checkmark = document.createElement("span");
            checkmark.textContent = " ✓";
            checkmark.style.color = "#00ff00";
            titleSpan.appendChild(checkmark);
        }

        titleElement.appendChild(titleSpan);
        titleElement.onclick = () => equipTitle(title.title);

        titlesList.appendChild(titleElement);
    });
}

updateMenu();
// Save data before page unloads
window.addEventListener("beforeunload", savePlayerData);

// Auto-save every 30 seconds to ensure data persistence
setInterval(() => {
    console.log("Auto-save triggered, current playerData:", playerData);
    savePlayerData();
    console.log("Auto-save: Player data saved");
}, 30000);

// Save on visibility change (when user switches tabs)
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        savePlayerData();
        console.log("Visibility change: Player data saved");
    }
});
