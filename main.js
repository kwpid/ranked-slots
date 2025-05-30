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
    "PulseRider"
  ];
  
  let playerData = {
      username: "Player",
      title: "NONE",
      wins: 0,
      losses: 0,
      mmr: 600,
      peakMMR: 600,
      coins: 0,
      ownedTitles: ["NONE"] // Track all titles the player owns
  };
  let aiData = {
      username: "",
      mmr: 600
  };
  const items = [
      {name: "Centio", type: "hero", price: 1500, rarity: "common", perks: {1: 35, 2: 10}},
      {name: "20XX", type: "skin", price: 250, rarity: "common", perks: {1: 10, 2: 60}},
  ];
  let queueInterval;
  let countdownInterval;
  let spinInterval;
  let gameActive = false; // Flag to control game state
  let spacebarHeld = false; // Flag to track if spacebar is held
  
  const jackpotProbability = 0.29;
  
  document.addEventListener("keydown", (event) => {
      if (event.code === "Space" && !event.repeat && gameActive && !spacebarHeld) {
          spacebarHeld = true;
          spin("player");
          holdSpacebarToSpin();
      }
  });
  function cancelQueue() {
  location.reload();
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
      console.log("Saving player data:", playerData); // Debug log
      localStorage.setItem("playerData", JSON.stringify(playerData));
  }
  
  function loadPlayerData() {
      const savedData = localStorage.getItem("playerData");
      if (savedData) {
          playerData = JSON.parse(savedData);
          // Initialize ownedTitles if it doesn't exist
          if (!playerData.ownedTitles) {
              playerData.ownedTitles = ["NONE"];
              // Add current title to owned titles if it's not NONE
              if (playerData.title && playerData.title !== "NONE") {
                  playerData.ownedTitles.push(playerData.title);
              }
              savePlayerData();
          }
          console.log("Loaded player data:", playerData); // Debug log
      }
  }
  function loadShop() {
      console.log("Loading Shop..."); // Debug log
      const shopContainer = document.getElementById("shop-hero");
      
      if (!shopContainer) {
          console.error("Shop container not found!");
          return;
      }
      
      shopContainer.innerHTML = ""; // Clear existing content
  
      const availableItems = items.filter(item => item.type === "hero");
      console.log("Available Hero Items:", availableItems); // Debug log
      
      if (availableItems.length === 0) {
          shopContainer.innerHTML = "<p>No heroes available for purchase.</p>";
          return;
      }
  
      availableItems.forEach(item => {
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
  
      playerData.inventory.forEach(itemName => {
          const item = items.find(i => i.name === itemName);
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
      const item = items.find(i => i.name === itemName);
      if (!item || playerData.inventory.includes(itemName)) return;
      
      if (playerData.coins >= item.price) {
          if (confirm(`Are you sure you want to buy ${item.name} for ${item.price} coins?`)) {
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
    loadShop();
    updateTitleDisplay();
     simulateAIMatches();

    // Proper close button binding
    document.getElementById("close-title-popup").addEventListener("click", function(e) {
        e.preventDefault();
        closePopup("title-popup");
    });

    // Other existing code...
    document.getElementById("ok-button").onclick = () => closePopup("notification-popup");
    document.getElementById("equip-now-button").onclick = () => {
        closePopup("notification-popup");
        openPopup("title-popup");
    };
};
  function editUsername() {
      const newUsername = prompt("Enter your username (1-20 characters):", playerData.username);
      if (newUsername && newUsername.length <= 20) {
          playerData.username = newUsername;
          document.getElementById("username-display").textContent = newUsername;
      }
  }
  // Opens a popup
  function openPopup(popupId) {
    if (popupId === "title-popup") {
        loadTitlesPopup();
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
      tabs.forEach(tabContent => tabContent.classList.add('hidden'));
  
      // Show the selected tab
      document.getElementById(`${section}-${tab}`).classList.remove('hidden');
  
      // Update active button style
      let buttons = document.querySelectorAll(`#${section}-popup .tab-button`);
      buttons.forEach(button => button.classList.remove('active'));
  
      document.querySelector(`#${section}-popup .tab-button:nth-child(${tab === 'hero' ? 1 : tab === 'skin' ? 2 : 3})`).classList.add('active');
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
      document.querySelector("#queue-screen p:nth-of-type(2)").textContent = `Estimated Time: ${maxQueueTime}s`;
  
      // Randomize the actual match start time (±20% of maxQueueTime)
      const actualMatchTime = Math.floor(maxQueueTime * (0.8 + Math.random() * 0.2)); // Between 80% and 120% of maxQueueTime
  
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
        wlUsers: [""]
    },
    {
        title: "RSCS MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },

    // SEASON 1
    {
        title: "RSCS S1 CHALLENGER",
        color: "#4da1f6",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 REGIONAL CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 REGIONAL FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 MAJOR CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 MAJOR FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 WORLDS CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S1 WORLD CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },

     

    // SEASON 2
    {
        title: "RSCS S2 CHALLENGER",
        color: "#4da1f6",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 REGIONAL CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 REGIONAL FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 MAJOR CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 MAJOR FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 WORLDS CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 WORLD CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },

      // SEASON 3
      {
        title: "RSCS S3 CHALLENGER",
        color: "#4da1f6",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S3 CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S3 ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S2 REGIONAL CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S3 REGIONAL FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S3 REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S3 MAJOR CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S3 MAJOR FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S3 MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S3 WORLDS CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
    {
        title: "RSCS S3 WORLD CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: [""]
    },
      // SEASON 3
      {
        title: "RSCS S4 CHALLENGER",
        color: "#4da1f6",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 ELITE",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 REGIONAL CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 REGIONAL FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 REGIONAL CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 MAJOR CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 MAJOR FINALIST",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 MAJOR CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 WORLDS CONTENDER",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
    },
    {
        title: "RSCS S4 WORLD CHAMPION",
        color: "aqua",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"]
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
        title: "S3 GRAND CHAMPION",
        color: "red",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"],
    },
    {
        title: "S3 SUPERSLOT LEGEND",
        color: "white",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"],
    },
      {
        title: "S4 GRAND CHAMPION",
        color: "gold",
        glow: true,
        minMMR: 1403,
        wlUsers: [""],
    },
    {
        title: "S4 SUPERSLOT LEGEND",
        color: "white",
        glow: true,
        minMMR: 1864,
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
    }
];
  
  
  
  
      function showNotification(title) {
      }
  
  const specialAIs = {
    superSlotLegends: [
        { name: "yumi", title: "RSCS S1 MAJOR CONTENDER", mmr: 2166 },
        { name: "drali", title: "S1 SUPERSLOT LEGEND", mmr: 1879 },
        { name: "wez", title: "RSCS S1 WORLD CHAMPION", mmr: 2233 },
        { name: "brickbybrick", title: "RSCS S1 CHALLENGER", mmr: 1973 },
        { name: "Rw9", title: "RSCS S2 ELITE", mmr: 2338 },
        { name: "dark", title: "S1 GRAND CHAMPION", mmr: 1961 },
        { name: "mawykzy!", title: "S1 TOP CHAMPION", mmr: 2194 },
        { name: "Speed", title: "S1 SUPERSLOT LEGEND", mmr: 2167 },
        { name: ".", title: "RSCS S1 CHALLENGER", mmr: 2218 },
        { name: "koto", title: "RSCS S1 WORLDS CONTENDER", mmr: 2139 },
        { name: "dani", title: "RSCS S1 ELITE", mmr: 2139 },
        { name: "Qwert (OG)", title: "S1 GRAND CHAMPION", mmr: 2129 },
        { name: "dr.k", title: "S1 SUPERSLOT LEGEND", mmr: 1865 },
        { name: "Void", title: "RSCS REGIONAL CHAMPION", mmr: 2178 },
        { name: "moon.", title: "RSCS S1 WORLDS CONTENDER", mmr: 1931 },
        { name: "Lru", title: "RSCS S1 CHALLENGER", mmr: 1891 },
        { name: "Kha0s", title: "RSCS S1 MAJOR CONTENDER", mmr: 1989 },
        { name: "rising.", title: "RSCS S1 GRAND CHAMPION", mmr: 1948 },
        { name: "?", title: "S1 RSCS ELITE", mmr: 2182 },
        { name: "dynamo", title: "S1 SUPERSLOT LEGEND", mmr: 2123 },
        { name: "f", title: "RSCS S2 MAJOR CHAMPION", mmr: 2257 },
        { name: "Hawk!", title: "RSCS S2 WORLDS CONTENDER", mmr: 2309 },
        { name: "newpo", title: "RSCS S2 REGIONAL CONTENDER", mmr: 2248 },
        { name: "zen", title: "RSCS MAJOR CHAMPION", mmr: 2289 },
        { name: "v", title: "RSCS S1 CHALLENGER", mmr: 2140 },
        { name: "a7md", title: "S1 SUPERSLOT LEGEND", mmr: 1992 },
        { name: "sieko", title: "RSCS S2 WORLD CHAMPION", mmr: 2111 },
        { name: "Mino", title: "S1 GRAND CHAMPION", mmr: 1908 },
        { name: "dyinq", title: "S1 GRAND CHAMPION", mmr: 1913 },
        { name: "toxin", title: "RSCS S1 MAJOR CONTENDER", mmr: 1981 },
        { name: "Bez", title: "S1 GRAND CHAMPION", mmr: 2156 },
        { name: "velocity", title: "S1 SUPERSLOT LEGEND", mmr: 1899 },
        { name: "Chronic", title: "S1 GRAND CHAMPION", mmr: 1873 },
        { name: "Flinch", title: "S1 GRAND CHAMPION", mmr: 2305 },
        { name: "vatsi", title: "NONE", mmr: 2154 },
        { name: "Xyzle", title: "RSCS S2 WORLDS CONTENDER", mmr: 2139 },
        { name: "ca$h", title: "RSCS S1 CHALLENGER", mmr: 2139 },
        { name: "Darkmode", title: "RSCS S1 MAJOR CHAMPION", mmr: 2139 },
        { name: "nu3.", title: "S1 SUPERSLOT LEGEND", mmr: 1879 },
        { name: "LetsG0Brand0n", title: "RSCS S1 WORLDS CONTENDER", mmr: 1983 },
        { name: "VAWQK.", title: "S1 GRAND CHAMPION TOURNAMENT WINNER", mmr: 1911 },
        { name: "helu30", title: "RSCS S1 MAJOR CHAMPION", mmr: 1998 },
        { name: "wizz", title: "S1 GRAND CHAMPION", mmr: 2101 },
        { name: "Sczribbles.", title: "RSCS S1 MAJOR CONTENDER", mmr: 1940 },
        { name: "7up", title: "RSCS S1 REGIONAL CONTENDER", mmr: 1954 },
        { name: "unkown", title: "RSCS S1 WORLDS CONTENDER", mmr: 2062 },
        { name: "t0es", title: "RSCS S1 REGIONAL CHAMPION", mmr: 1865 },
        { name: "Jynx.", title: "RSCS S1 CHALLENGER", mmr: 1962 },
        { name: "Zapz", title: "RSCS S1 CONTENDER", mmr: 1920 },
        { name: "Aur0", title: "S1 SUPERSLOT LEGEND", mmr: 1984 },
        { name: "Knight", title: "RSCS S1 MAJOR CHAMPION", mmr: 2133 },
        { name: "Cliqz", title: "NONE", mmr: 2054 },
        { name: "Pyro.", title: "RSCS MAJOR CHAMPION", mmr: 2085 },
        { name: "dash!", title: "S1 GRAND CHAMPION", mmr: 2047 },
        { name: "ven", title: "S1 GRAND CHAMPION", mmr: 2079 },
        { name: "flow.", title: "RSCS S1 REGIONAL CONTENDER", mmr: 2002 },
        { name: "zenith", title: "RSCS S1 WORLDS CONTENDER", mmr: 1969 },
        { name: "volty", title: "RSCS S1 CHALLENGER", mmr: 1930 },
        { name: "Aqua!", title: "S1 GRAND CHAMPION", mmr: 2056 },
        { name: "Styx", title: "S1 SUPERSLOT LEGEND", mmr: 1895 },
        { name: "cheeseboi", title: "S1 SUPERSLOT LEGEND", mmr: 1883 },
        { name: "Heat.", title: "RSCS S1 REGIONAL CHAMPION", mmr: 1960 },
        { name: "Slyde", title: "S1 SUPERSLOT LEGEND", mmr: 2000 },
        { name: "fl1p", title: "RSCS S1 CONTENDER", mmr: 1920 },
        { name: "Otto", title: "S1 SUPERSLOT LEGEND", mmr: 1964 },
        { name: "jetz", title: "S1 GRAND CHAMPION", mmr: 1954 },
        { name: "Crisp", title: "RSCS S1 MAJOR CHAMPION", mmr: 2139 },
        { name: "snailracer", title: "S1 GRAND CHAMPION", mmr: 2019 },
        { name: "Flickz", title: "RSCS S1 MAJOR CONTENDER", mmr: 2031 },
        { name: "tempo", title: "S1 SUPERSLOT LEGEND", mmr: 1902 },
        { name: "Blaze.", title: "RSCS S1 REGIONAL CHAMPION", mmr: 1965 },
        { name: "skyfall", title: "RSCS S1 MAJOR CONTENDER", mmr: 2040 },
        { name: "steam", title: "S1 SUPERSLOT LEGEND", mmr: 1902 },
        { name: "storm", title: "RSCS S2 CHALLENGER", mmr: 2028 },
        { name: "rek:3", title: "S1 GRAND CHAMPION", mmr: 1956 },
        { name: "vyna1", title: "S1 GRAND CHAMPION", mmr: 1914 },
        { name: "deltairlines", title: "RSCS S2 CONTENDER", mmr: 1987 },
        { name: "ph", title: "S1 SUPERSLOT LEGEND", mmr: 1872 },
        { name: "trace", title: "S1 GRAND CHAMPION", mmr: 1935 },
        { name: "avidic", title: "S1 SUPERSLOT LEGEND", mmr: 1921 },
        { name: "tekk!", title: "S1 GRAND CHAMPION", mmr: 1943 },
        { name: "fluwo", title: "RSCS S2 REGIONAL CONTENDER", mmr: 2012 },
        { name: "climp?", title: "S1 SUPERSLOT LEGEND", mmr: 1893 },
        { name: "zark", title: "RSCS S1 CHALLENGER", mmr: 1908 },
        { name: "diza", title: "RSCS S1 WORLDS CONTENDER", mmr: 1946 },
        { name: "O", title: "S1 GRAND CHAMPION", mmr: 1951 },
        { name: "Snooze", title: "S1 SUPERSLOT LEGEND", mmr: 1879 },
        { name: "gode", title: "RSCS S1 MAJOR CONTENDER", mmr: 1994 },
        { name: "cola", title: "S1 GRAND CHAMPION", mmr: 1940 },
        { name: "hush(!)", title: "S1 GRAND CHAMPION", mmr: 1917 },
        { name: "sh4oud", title: "SALT MINE 1 CHAMPION", mmr: 2042 },
        { name: "vvv", title: "S1 SUPERSLOT LEGEND", mmr: 1884 },
        { name: "critt", title: "S1 SUPERSLOT LEGEND", mmr: 1930 },
        { name: "darkandlost2009", title: "RSCS S1 MAJOR CONTENDER", mmr: 1989 },
        { name: "pulse jubbo", title: "S1 GRAND CHAMPION", mmr: 1917 },
        { name: "pl havicic", title: "RSCS S1 REGIONAL CHAMPION", mmr: 2006 },
        { name: "ryft.", title: "S1 SUPERSLOT LEGEND", mmr: 1895 },
        { name: "Lyric", title: "RSCS S1 CONTENDER", mmr: 1913 },
        { name: "dryft.", title: "S1 GRAND CHAMPION", mmr: 1959 },
        { name: "horiz", title: "RSCS S1 REGIONAL CHAMPION", mmr: 1975 },
        { name: "zeno", title: "S1 GRAND CHAMPION", mmr: 1927 },
        { name: "octane", title: "S1 SUPERSLOT LEGEND", mmr: 1901 },
        { name: "wavetidess", title: "SALT MINE 2 QUALIFIER", mmr: 2020 },
        { name: "loster", title: "RSCS S1 CHALLENGER", mmr: 2125 },
        { name: "mamba", title: "S1 GRAND CHAMPION", mmr: 1942 },
        { name: "Jack", title: "S1 GRAND CHAMPION", mmr: 1938 },
        { name: "innadeze", title: "RSCS S1 MAJOR CONTENDER", mmr: 1982 },
        { name: "s", title: "S1 GRAND CHAMPION", mmr: 1964 },
        { name: "offtenlost", title: "S1 GRAND CHAMPION", mmr: 1929 },
        { name: "bivo", title: "RSCS S1 REGIONAL CHAMPION", mmr: 1986 },
        { name: "Trace", title: "SALT MINE 3 MAIN EVENT QUALIFIER", mmr: 2017 },
        { name: "Talon", title: "S1 GRAND CHAMPION", mmr: 1918 },
        { name: ".", title: "RSCS S1 CHALLENGER", mmr: 1882 },
        { name: "{?}", title: "S1 GRAND CHAMPION", mmr: 1911 },
        { name: "rraze", title: "RSCS S1 CONTENDER", mmr: 1905 },
        { name: "Dark{?}", title: ".", mmr: 1872 },
        { name: "zenhj", title: "S1 GRAND CHAMPION", mmr: 1928 },
        { name: "rinshoros bf", title: "RSCS S1 CHALLENGER", mmr: 1933 },
        { name: "Cipher", title: "S1 SUPERSLOT LEGEND", mmr: 1897 },
        { name: "nova", title: "RSCS S1 CHALLENGER", mmr: 1919 },
        { name: "juzz", title: "S1 GRAND CHAMPION", mmr: 1886 },
        { name: "officer", title: ".", mmr: 1869 },
        { name: "strike", title: "S1 SUPERSLOT LEGEND", mmr: 1878 },
        { name: "Titan", title: "S1 GRAND CHAMPION", mmr: 1925 },
        { name: "comp", title: "RSCS S1 CHALLENGER", mmr: 1941 },
        { name: "pahnton", title: "S1 SUPERSLOT LEGEND", mmr: 1891 },
        { name: "Mirage", title: "S1 GRAND CHAMPION", mmr: 1930 },
        { name: "space", title: "S1 SUPERSLOT LEGEND", mmr: 1866 },
        { name: "boltt", title: "RSCS S1 CHALLENGER", mmr: 1910 },
        { name: "reeper", title: "RSCS S1 CHALLENGER", mmr: 1952 },
        { name: "piza", title: "S1 SUPERSLOT LEGEND", mmr: 1881 },
        { name: "cheese.", title: "RSCS S1 CONTENDER", mmr: 1894 },
        { name: "frostbite", title: "S1 GRAND CHAMPION", mmr: 1907 },
        { name: "warthunderisbest", title: "S1 SUPERSLOT LEGEND", mmr: 1875 },
        { name: "eecipe", title: "RSCS S1 CHALLENGER", mmr: 1888 },
        { name: "quantum", title: "S1 SUPERSLOT LEGEND", mmr: 1867 },
        { name: "vexz", title: "S1 GRAND CHAMPION", mmr: 1945 },
    { name: "zylo", title: "RSCS S1 CHALLENGER", mmr: 1923 },
    { name: "frzno", title: "S1 SUPERSLOT LEGEND", mmr: 1889 },
    { name: "blurr", title: "NONE", mmr: 1955 },
    { name: "scythe!", title: "S1 GRAND CHAMPION", mmr: 1977 },
    { name: "wvr", title: "RSCS S1 CHALLENGER", mmr: 1904 },
    { name: "nxt", title: "S1 SUPERSLOT LEGEND", mmr: 1876 },
    { name: "griz", title: "S1 GRAND CHAMPION", mmr: 1932 },
    { name: "jolt", title: "RSCS S1 CHALLENGER", mmr: 1915 },
    { name: "sift", title: "NONE", mmr: 1968 },
    { name: "kryo", title: "S1 SUPERSLOT LEGEND", mmr: 1890 },
    { name: "wvn", title: "S1 GRAND CHAMPION", mmr: 1947 },
    { name: "brixx", title: "RSCS S1 CHALLENGER", mmr: 1926 },
    { name: "twixt", title: "NONE", mmr: 1971 },
    { name: "nyx", title: "S1 SUPERSLOT LEGEND", mmr: 1885 },
    { name: "slyth", title: "S1 GRAND CHAMPION", mmr: 1936 },
    { name: "drex", title: "RSCS S1 CHALLENGER", mmr: 1912 },
    { name: "qwi", title: "NONE", mmr: 1960 },
    { name: "voxx", title: "S1 SUPERSLOT LEGEND", mmr: 1877 },
    { name: "triz", title: "S1 GRAND CHAMPION", mmr: 1944 },
    { name: "jynx", title: "RSCS S1 CHALLENGER", mmr: 1909 },
    { name: "plyx", title: "NONE", mmr: 1974 },
    { name: "kryp", title: "S1 SUPERSLOT LEGEND", mmr: 1880 },
    { name: "zex", title: "S1 GRAND CHAMPION", mmr: 1937 },
    { name: "brix", title: "RSCS S1 CHALLENGER", mmr: 1921 },
    { name: "twixz", title: "NONE", mmr: 1963 },
    { name: "vyn", title: "S1 SUPERSLOT LEGEND", mmr: 1874 },
    { name: "sypher", title: "S1 GRAND CHAMPION", mmr: 1949 },
    { name: "jyn", title: "RSCS S1 CHALLENGER", mmr: 1916 },
    { name: "qry", title: "NONE", mmr: 1967 },
    { name: "neoo", title: "NONE", mmr: 1967 },
    { name: "kwpid", title: "NONE", mmr: 2145 }
    
    ].map(ai => {
        // Try to load saved MMR from localStorage
        const savedAI = localStorage.getItem(`ssl_ai_${ai.name}`);
        if (savedAI) {
            const parsed = JSON.parse(savedAI);
            // Ensure MMR stays within bounds (1864-2400)
            parsed.mmr = Math.max(1864, Math.min(2400, parsed.mmr));
            return parsed;
        }
        return ai;
    })
};
  function saveAIData(ai) {
    localStorage.setItem(`ssl_ai_${ai.name}`, JSON.stringify(ai));
}
function getRandomOpponent(currentAI) {
    const opponents = specialAIs.superSlotLegends.filter(a => a.name !== currentAI.name);
    if (opponents.length === 0) return null;
    
    // Weight towards opponents with similar MMR
    const viableOpponents = opponents.filter(opp => 
        Math.abs(opp.mmr - currentAI.mmr) <= 400
    );
    
    const pool = viableOpponents.length > 0 ? viableOpponents : opponents;
    return pool[Math.floor(Math.random() * pool.length)];
}
function simulateAIMatches() {
    const lastSimulation = localStorage.getItem('last_ai_simulation');
    const now = new Date().getTime();
    
    // Only simulate if at least 1 hour has passed since last simulation
    if (lastSimulation && (now - parseInt(lastSimulation)) < 3600000) {
        return;
    }
    
    // Update all SSL AIs
    specialAIs.superSlotLegends.forEach(ai => {
        // Determine how many matches to simulate (0-3)
        const matchesToPlay = Math.floor(Math.random() * 4);
        
        for (let i = 0; i < matchesToPlay; i++) {
            const opponent = getRandomOpponent(ai);
            if (!opponent) continue;
            
            // Simulate match outcome (weighted toward higher MMR player winning)
            const aiWinProbability = 1 / (1 + Math.pow(10, (opponent.mmr - ai.mmr) / 400));
            const aiWon = Math.random() < aiWinProbability;
            
            // Calculate MMR change
            const mmrChange = calculateMMRChange(ai.mmr, opponent.mmr, aiWon);
            
            // Update MMR (keeping within bounds)
            ai.mmr = Math.max(1864, Math.min(2400, ai.mmr + mmrChange));
            
            // If opponent is another AI, update their MMR too
            if (aiWon) {
                opponent.mmr = Math.max(1864, Math.min(2400, opponent.mmr - mmrChange));
                saveAIData(opponent);
            }
        }
        
        // Save this AI's data
        saveAIData(ai);
    });
    
    // Record when we last simulated matches
    localStorage.setItem('last_ai_simulation', now.toString());
}
  function startMatch() {
    document.getElementById("queue-screen").classList.add("hidden");
    document.getElementById("match-screen").classList.remove("hidden");
    
    // Set player info (unchanged)
    document.getElementById("player-username").textContent = playerData.username;
    const playerTitleElement = document.getElementById("player-title");
    playerTitleElement.textContent = playerData.title;
    const playerTitle = titles.find(t => t.title === playerData.title);
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

    // Set AI info based on player's MMR
    if (playerData.mmr >= 1864) {
        // SuperSlot Legend rank - can face SSL AIs
        // Filter AIs within a reasonable MMR range (±200) of the player
        const eligibleAIs = specialAIs.superSlotLegends.filter(
            ai => Math.abs(ai.mmr - playerData.mmr) <= 200
        );
        
        // If no AIs in range, expand to ±300, then any SSL
        let selectedAI;
        if (eligibleAIs.length > 0) {
            selectedAI = eligibleAIs[Math.floor(Math.random() * eligibleAIs.length)];
        } else {
            const widerPool = specialAIs.superSlotLegends.filter(
                ai => Math.abs(ai.mmr - playerData.mmr) <= 300
            );
            selectedAI = widerPool.length > 0 
                ? widerPool[Math.floor(Math.random() * widerPool.length)]
                : specialAIs.superSlotLegends[Math.floor(Math.random() * specialAIs.superSlotLegends.length)];
        }
        
        aiData = {
            username: selectedAI.name,
            title: selectedAI.title,
            mmr: selectedAI.mmr
        };
    } else {
        // Regular AI with random grey title
        const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
        aiData = {
            username: aiName,
            mmr: playerData.mmr + (Math.random() * 200 - 100),
            title: getRandomGreyTitle()
        };
    }
    
    // Set AI display info (unchanged)
    document.getElementById("ai-username").textContent = aiData.username;
    const aiTitleElement = document.getElementById("ai-title");
    aiTitleElement.textContent = aiData.title;
    const aiTitle = titles.find(t => t.title === aiData.title);
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
    
    // Start countdown (unchanged)
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
      const greyTitles = titles.filter(title => title.color === "grey" && title.title !== "NONE");
      return greyTitles[Math.floor(Math.random() * greyTitles.length)].title;
  }
  
  function checkForNewTitles() {
      const availableTitles = getAvailableTitles();
      
      // Check if player has unlocked any new titles
      availableTitles.forEach(title => {
          if (title && title.title && 
              title.title !== "NONE" && 
              !playerData.ownedTitles.includes(title.title)) {
              showTitleNotification(title);
              playerData.ownedTitles.push(title.title);
              savePlayerData();
          }
      });
  }
  
  function spin(player) {
      if (!gameActive) return; // Prevent spinning outside active game
  
      const results = Array.from({ length: 3 }, () => Math.random() < jackpotProbability ? "J" : "-");
      const slots = player === "player" ? ["player-slot-1", "player-slot-2", "player-slot-3"] : ["ai-slot-1", "ai-slot-2", "ai-slot-3"];
      slots.forEach((slot, index) => {
          document.getElementById(slot).textContent = results[index];
      });
      const jackpotCount = results.filter(r => r === "J").length;
      if (jackpotCount === 3) {
          updateDots(player);
      }
      if (checkWinCondition()) {
          clearInterval(spinInterval);
          endGame(player === "player");
      }
  }
  
  // Add event listener to the spin button
  document.getElementById("spin-button").addEventListener("click", () => {
      if (gameActive) {
          spin("player");
      }
  });
  
  
  function getSpinInterval(mmr) {
    if (mmr >= 1400) return 110;
      if (mmr >= 1314) return 130; // S1 GRAND CHAMPION
      if (mmr >= 994) return 170;  // S1 CHAMPION
      if (mmr >= 754) return 190;  // S1 DIAMOND
      if (mmr >= 594) return 200;  // S1 PLATINUM
      if (mmr >= 414) return 250;  // S1 GOLD
      if (mmr >= 231) return 270;  // S1 SILVER
      return 400;                  // S1 BRONZE and below
  }
  
  function aiAutoSpin() {
      const spinSpeed = getSpinInterval(aiData.mmr); // Get spin interval based on AI rank
      spinInterval = setInterval(() => {
          spin("ai");
      }, spinSpeed);
  }
  
  
  function updateDots(player) {
      const dots = player === "player" ? "player-dots" : "ai-dots";
      const dotElements = document.getElementById(dots).getElementsByClassName("dot");
      for (let dot of dotElements) {
          if (!dot.classList.contains("active")) {
              dot.classList.remove("inactive");
              dot.classList.add("active");
              break;
          }
      }
  }
  
  function checkWinCondition() {
      const playerDots = document.getElementById("player-dots").getElementsByClassName("active").length;
      const aiDots = document.getElementById("ai-dots").getElementsByClassName("active").length;
      return playerDots === 5 || aiDots === 5;
  }
  
  function calculateMMRChange(playerMMR, opponentMMR, playerWon) {
      // Constants for MMR calculation
      const K = 32; // Base K-factor
      const MMR_SCALE = 400; // Scale factor for MMR difference
      const MIN_MMR_CHANGE = 8; // Minimum MMR change
      const MAX_MMR_CHANGE = 50; // Maximum MMR change
      
      // Calculate expected score using logistic function
      const expectedScore = 1 / (1 + Math.pow(10, (opponentMMR - playerMMR) / MMR_SCALE));
      
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
      mmrChange = Math.max(MIN_MMR_CHANGE, Math.min(MAX_MMR_CHANGE, Math.abs(mmrChange)));
      
      // Return positive or negative based on win/loss
      return playerWon ? mmrChange : -mmrChange;
  }
  
  function endGame(playerWon) {
    if (!gameActive) return;
    
    gameActive = false;
    clearInterval(spinInterval);
    clearInterval(countdownInterval);
    
    // Calculate MMR change using the new system
    const oldMMR = playerData.mmr;
    const mmrChange = calculateMMRChange(playerData.mmr, aiData.mmr, playerWon);
    playerData.mmr += mmrChange;
    
    // Update stats and coins (unchanged)
    let coinsEarned = 0;
    if (playerWon) {
        playerData.wins++;
        coinsEarned = Math.floor(Math.random() * 6) + 10;
        playerData.coins += coinsEarned;
    } else {
        playerData.losses++;
    }
    
    // Update peak MMR (unchanged)
    if (playerData.mmr > playerData.peakMMR) {
        playerData.peakMMR = playerData.mmr;
    }
    
    // If player is SSL and opponent is SSL AI, update AI's MMR
    if (playerData.mmr >= 1864 && aiData.username && 
        specialAIs.superSlotLegends.some(ai => ai.name === aiData.username)) {
        
        const ai = specialAIs.superSlotLegends.find(ai => ai.name === aiData.username);
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
    document.getElementById("result").textContent = playerWon ? "Victory!" : "Defeat";
    document.getElementById("old-mmr").textContent = oldMMR;
    document.getElementById("new-mmr").textContent = playerData.mmr;
    document.getElementById("mmr-change").textContent = `MMR Change: ${mmrChange > 0 ? "+" : ""}${mmrChange}`;
    
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
      Notification.requestPermission().then(permission => {
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
      } else if ("Notification" in window && Notification.permission !== "denied") {
          // Ask for permission again if it was not denied previously
          Notification.requestPermission().then(permission => {
              if (permission === "granted") {
                  showDesktopNotification();
              }
          });
      }
  }
  
  function goToMenu() {
      location.reload(); // Refresh the page to return to the menu
  }
  function getRankImage(rank) {
      // Remove division info if present (e.g., "Gold III - Div 2" → "Gold III")
      const baseRank = rank.split(" - ")[0];
  
      const rankImages = {
          "Bronze I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/939597fb-c29f-4607-9a76-9a6c5f1edf48.image.png?v=1724334781837",
          "Bronze II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/9965effe-4989-4504-9200-7f04b6b665a2.image.png?v=1724334793116",
          "Bronze III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a274e890-4257-4cd9-a02a-56bc80be47d3.image.png?v=1724334816902",
          "Silver I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/28b40287-5562-45ab-a236-5647e96f1d48.image.png?v=1724334852235",
          "Silver II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/6caddf21-bee3-46c3-9d27-05823806cb67.image.png?v=1724334861872",
          "Silver III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/faa8edc7-b482-4cc4-b5b0-ceed84627079.image.png?v=1724334871163",
          "Gold I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/df499a57-8fc0-4524-bdd0-2fae76ec9301.image.png?v=1724334902060",
          "Gold II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a0dedb5b-6bc3-4322-afbb-77cc07184fec.image.png?v=1724334909730",
          "Gold III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/d3a3b2fc-6fcf-4bdc-85cc-8da4f40b2993.image.png?v=1724334914955",
          "Platinum I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/2f23a5f7-efe3-45ee-9cb8-acd533b0d6c4.image.png?v=1724335263302",
          "Platinum II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/3103ab33-c432-43ff-93c3-69a08d1ca602.image.png?v=1724335271866",
          "Platinum III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/c0fa94d0-d195-42d1-92f1-cb082976bdff.image.png?v=1724335280781",
          "Diamond I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/db671aad-2dd6-4328-897f-3f259be82fc5.image.png?v=1724335489836",
          "Diamond II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/76c9b43e-d0f6-4b05-9f32-7243d522c5f1.image.png?v=1724335504082",
          "Diamond III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/07082c63-cce6-4ff1-bff3-c3fceedf2e54.image.png?v=1724335508559",
          "Champion I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a10c88af-e70d-4891-99e7-57abf90002d5.image.png?v=1724335525065",
          "Champion II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/3d397ae6-e026-45af-b4e3-180318bd415a.image.png?v=1724335551068",
          "Champion III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/c28f3b1a-1396-4f24-aec7-f289695e5695.image.png?v=1724335556235",
          "Grand Champion I": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/90ecba8a-55f9-457c-8834-2ec4ee1c97fe.image.png?v=1724335571459",
          "Grand Champion II": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/a90fa27e-2330-45d1-8b74-377fb4028842.image.png?v=1724335635668",
          "Grand Champion III": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/30d7ef7b-605e-4830-aa4d-153e5f77d67b.image.png?v=1724335639506",
        "SuperSlot Legend": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/21405196-dbc9-4527-91e7-9a41abc6a698.image.png?v=1724335671471",
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
              isPlayer: true
          });
      }

      // Sort by MMR (highest to lowest)
      allPlayers.sort((a, b) => b.mmr - a.mmr);

      // Find player's rank
      const playerIndex = allPlayers.findIndex(p => p.name === playerData.username);
      return playerIndex !== -1 ? playerIndex + 1 : null;
  }
  
  function updateMenu() {
      document.getElementById("username-display").textContent = playerData.username;
    
      document.getElementById("wins").textContent = playerData.wins;
      document.getElementById("losses").textContent = playerData.losses;
      const totalGames = playerData.wins + playerData.losses;
      const winRate = totalGames > 0 ? ((playerData.wins / totalGames) * 100).toFixed(1) : 0;
      document.getElementById("winrate").textContent = `${winRate}%`;
      document.getElementById("peak-mmr").textContent = playerData.peakMMR;
    document.getElementById("peak-rank").textContent = getRank(playerData.peakMMR);
      const rank = getRank(playerData.mmr);
      document.getElementById("current-rank").textContent = rank;
      document.getElementById("current-mmr").textContent = playerData.mmr;
      document.getElementById("rank-image").src = getRankImage(rank);
      document.getElementById("player-coins").textContent = playerData.coins;
  
      // Add leaderboard button if not already present
      if (!document.getElementById("leaderboard-button")) {
          const menuButtons = document.querySelector("#menu-screen .button-container");
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

      savePlayerData();
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
            isPlayer: true
        });
    }

    // Sort by current MMR (highest to lowest)
    allPlayers.sort((a, b) => b.mmr - a.mmr);

    // Take top 25
    const top25 = allPlayers.slice(0, 25);

    // Create leaderboard entries
    top25.forEach((player, index) => {
        const entry = document.createElement("div");
        entry.className = `leaderboard-entry${player.isPlayer ? ' player-entry' : ''}`;
        
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
    const playerRank = allPlayers.findIndex(p => p.name === playerData.username) + 1;

    // Add player stats above the close button
    const popupContent = document.querySelector("#leaderboard-popup .popup-content");
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
            <div class="player-stats-rank">Rank: ${playerRank ? `#${playerRank}` : '--'}</div>
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
          { name: "SuperSlot Legend", min: 1864, max: 9999 }
      ];
    // Find the rank based on MMR
      for (const rank of ranks) {
          if (mmr >= rank.min && mmr <= rank.max) {
              if (rank.name === "SuperSlot Legend") {
                  return rank.name; // No divisions for this rank
              }
              // Calculate division (5 divisions)
              const divisionSize = Math.floor((rank.max - rank.min + 1) / 5);
              const division = Math.min(5, Math.floor((mmr - rank.min) / divisionSize) + 1);
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
        "CHALLENGER"
    ];

    const rankedOrder = [
        "SUPERSLOT LEGEND",
        "GRAND CHAMPION"
    ];

    return titles.filter(title => {
        if (title.title === "NONE") return true;
        if (title.wlUsers.includes(playerData.username)) return true;
        if (title.minMMR && playerData.mmr >= title.minMMR) return true;
        if (playerData.ownedTitles && playerData.ownedTitles.includes(title.title)) return true;
        return false;
    }).sort((a, b) => {
        if (a.title === "NONE") return -1;
        if (b.title === "NONE") return 1;

        // Helper to classify title category
        const getCategory = (title) => {
            const isRSCS = title.startsWith("RSCS");
            const hasSeason = /S\d+/.test(title);
            const isChallenger = title.includes("CHALLENGER");
            const isRanked = /^S\d+/.test(title) && rankedOrder.some(t => title.includes(t));

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
            const aTier = rscsOrder.findIndex(t => a.title.includes(t));
            const bTier = rscsOrder.findIndex(t => b.title.includes(t));
            return aTier - bTier;
        }

        if (catA === 1 || catA === 2) {
            const aSeason = parseInt(a.title.match(/S(\d+)/)?.[1] || 0);
            const bSeason = parseInt(b.title.match(/S(\d+)/)?.[1] || 0);
            if (aSeason !== bSeason) return bSeason - aSeason;

            const aTier = rscsOrder.findIndex(t => a.title.includes(t));
            const bTier = rscsOrder.findIndex(t => b.title.includes(t));
            return aTier - bTier;
        }

        if (catA === 3) {
            const aSeason = parseInt(a.title.match(/S(\d+)/)?.[1] || 0);
            const bSeason = parseInt(b.title.match(/S(\d+)/)?.[1] || 0);
            if (aSeason !== bSeason) return bSeason - aSeason;

            const aRank = rankedOrder.findIndex(t => a.title.includes(t));
            const bRank = rankedOrder.findIndex(t => b.title.includes(t));
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
      const currentTitle = titles.find(t => t.title === currentTitleName);
      
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
    
    availableTitles.forEach(title => {
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
