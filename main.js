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
    inventory: [],
    unlockedTitles: []
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
          // Initialize unlockedTitles if it doesn't exist
          if (!playerData.unlockedTitles) {
              playerData.unlockedTitles = [];
              // Add current title to unlocked titles if it's not NONE
              if (playerData.title && playerData.title !== "NONE") {
                  playerData.unlockedTitles.push(playerData.title);
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
  // Load data on page load
  window.onload = () => {
      loadPlayerData();
      updateMenu();
      loadShop();
      updateTitleDisplay();
      
      // Add event listeners for title popup buttons
      document.getElementById("close-title-popup").onclick = () => closePopup("title-popup");
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
      document.getElementById(popupId).style.display = "block";
  }
  
  // Closes a popup
  function closePopup(popupId) {
      document.getElementById(popupId).style.display = "none";
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
        sortOrder: 0 // Special sort order for NONE
    },
    {
        title: "S1 GRAND CHAMPION",
        color: "red",
        glow: true,
        minMMR: null,
        wlUsers: ["kwpid"],
        sortOrder: 1
    },
    {
        title: "OG",
        color: "grey",
        glow: false,
        minMMR: 100,
        wlUsers: [""],
        sortOrder: 2
    }
];
  
  
  
  
      function showNotification(title) {
      }
  
  function startMatch() {
      document.getElementById("queue-screen").classList.add("hidden");
      document.getElementById("match-screen").classList.remove("hidden");
      
      // Set player info
      document.getElementById("player-username").textContent = playerData.username;
      document.getElementById("player-title").textContent = playerData.title;
      document.getElementById("player-rank").textContent = getRank(playerData.mmr);
      document.getElementById("player-mmr").textContent = playerData.mmr;
      
      // Set AI info
      const aiName = aiNames[Math.floor(Math.random() * aiNames.length)];
      aiData.username = aiName;
      aiData.mmr = playerData.mmr + (Math.random() * 200 - 100);
      aiData.title = getRandomAITitle();
      
      document.getElementById("ai-username").textContent = aiData.username;
      document.getElementById("ai-title").textContent = aiData.title;
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
  
  function getRandomAITitle() {
      const availableTitles = titles.filter(title => {
          if (title.title === "NONE") return true;
          if (title.wlUsers.includes(aiData.username)) return true;
          if (title.minMMR && aiData.mmr >= title.minMMR) return true;
          return false;
      });
      
      return availableTitles[Math.floor(Math.random() * availableTitles.length)].title;
  }
  
  function checkForNewTitles() {
      const availableTitles = getAvailableTitles();
      const currentTitleName = playerData.title || "NONE";
      
      // Initialize unlockedTitles if it doesn't exist
      if (!playerData.unlockedTitles) {
          playerData.unlockedTitles = [];
      }
      
      // Check if player has unlocked any new titles
      availableTitles.forEach(title => {
          if (title && title.title && 
              title.title !== "NONE" && 
              title.title !== currentTitleName &&
              !playerData.unlockedTitles.includes(title.title)) {
              showTitleNotification(title);
              playerData.unlockedTitles.push(title.title);
              console.log("New title unlocked:", title.title); // Debug log
              console.log("Current unlocked titles:", playerData.unlockedTitles); // Debug log
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
  
  function endGame(playerWon) {
      if (!gameActive) return; // Prevent multiple calls
      
      gameActive = false;
      clearInterval(spinInterval);
      clearInterval(countdownInterval);
      
      // Update MMR
      const oldMMR = playerData.mmr;
      const mmrChange = playerWon ? 25 : -20;
      playerData.mmr += mmrChange;
      
      // Update stats and coins
      let coinsEarned = 0; // Initialize coinsEarned
      if (playerWon) {
          playerData.wins++;
          // Add random coins between 10-15 for wins
          coinsEarned = Math.floor(Math.random() * 6) + 10; // Random number between 10-15
          playerData.coins += coinsEarned;
      } else {
          playerData.losses++;
      }
      
      // Update peak MMR
      if (playerData.mmr > playerData.peakMMR) {
          playerData.peakMMR = playerData.mmr;
      }
      
      // Check for new titles
      checkForNewTitles();
      
      // Save data
      savePlayerData();
      
      // Show end screen
      document.getElementById("match-screen").classList.add("hidden");
      document.getElementById("end-screen").classList.remove("hidden");
      
      // Update end screen info
      document.getElementById("result").textContent = playerWon ? "Victory!" : "Defeat";
      document.getElementById("old-mmr").textContent = oldMMR;
      document.getElementById("new-mmr").textContent = playerData.mmr;
      document.getElementById("mmr-change").textContent = `MMR Change: ${mmrChange > 0 ? "+" : ""}${mmrChange}`;
      
      // Show coins earned if player won
      if (playerWon) {
          const coinsElement = document.getElementById("player-coins");
          coinsElement.textContent = `Coins Earned: +${coinsEarned}`;
          coinsElement.style.color = "#ffcc00"; // Gold color for coins
      } else {
          const coinsElement = document.getElementById("player-coins");
          coinsElement.textContent = ""; // Clear coins text for losses
      }
      
      // Update menu display
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
          "Superslot Legend": "https://cdn.glitch.global/c16ac13c-9db1-4fbb-a599-4c729f45d485/21405196-dbc9-4527-91e7-9a41abc6a698.image.png?v=1724335671471",
      };
  
      return rankImages[baseRank] || rankImages["Unranked"];
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
  
      savePlayerData(); // Save data whenever menu is updated
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
      return titles.filter(title => {
          if (title.title === "NONE") return true;
          if (title.wlUsers.includes(playerData.username)) return true;
          if (title.minMMR && playerData.mmr >= title.minMMR) return true;
          return false;
      }).sort((a, b) => {
          // NONE always first
          if (a.title === "NONE") return -1;
          if (b.title === "NONE") return 1;

          // Season titles (S#) second
          const aIsSeason = a.title.startsWith("S") && !isNaN(parseInt(a.title[1]));
          const bIsSeason = b.title.startsWith("S") && !isNaN(parseInt(b.title[1]));
          
          if (aIsSeason && !bIsSeason) return -1;
          if (!aIsSeason && bIsSeason) return 1;
          
          // If both are season titles, sort by season number
          if (aIsSeason && bIsSeason) {
              const aSeason = parseInt(a.title[1]);
              const bSeason = parseInt(b.title[1]);
              if (aSeason !== bSeason) return bSeason - aSeason; // Higher season first
          }

          // Grey titles last
          if (a.color === "grey" && b.color !== "grey") return 1;
          if (a.color !== "grey" && b.color === "grey") return -1;

          // If both are same type, sort alphabetically
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
      
      availableTitles.forEach(title => {
          const titleElement = document.createElement("div");
          titleElement.classList.add("title-item");
          
          const titleSpan = document.createElement("span");
          titleSpan.textContent = title.title;
          titleSpan.style.color = title.color;
          if (title.glow) {
              titleSpan.classList.add("glow");
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
