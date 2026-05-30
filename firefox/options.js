// First: What this file is doing overall

// This file is basically:

// UI ↔ Storage bridge

// Reads data from storage → shows it on screen
// Takes user input → updates storage

// That’s it.

//TODO: Why is this line needed?
const api = typeof browser !== "undefined" ? browser : chrome;

// This function loads the blocked sites from storage
// and displays them in the UI (the <ul> list)
function loadSites() {


  // api.storage.local.get → async call to fetch stored data
  // ["blockedSites"] → we are asking ONLY for this key
  api.storage.local.get(["blockedSites"], (result) => {
    const list = document.getElementById("siteList"); // Get the <ul> element where we will display sites
    list.innerHTML = ""; // Clear existing list (important to avoid duplicates)

    const sites = result.blockedSites || []; // If nothing exists in storage, use empty array

    sites.forEach(site => { // Loop through each site in the list
      const li = document.createElement("li"); // Create a list item <li> for each site
      //   li.textContent = site; // Set text of <li> to the site name

      const btn = document.createElement("button"); // Create a "Remove" button for each site
      btn.textContent = site; // Button label is the site itself

      // When button is clicked → call removeSite()
      // We pass the specific site to remove
      btn.onclick = () => removeSite(site);

      // Add button inside the <li>
      li.appendChild(btn);

      // Add <li> to the <ul> list
      list.appendChild(li);
    });
  });
}

// Key idea here
// Every time loadSites() runs:
// 👉 It rebuilds the UI from scratch
// This is important:
// UI is always derived from storage


// Listen for click on "Add" button
document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("siteInput"); // Get input field
  const newSite = input.value.trim(); // Get user input and remove extra spaces

  if (!newSite) return; // If input is empty → do nothing
  //↑ Prevents: empty entries & accidental clicks


  // Get current stored sites
  api.storage.local.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || []; // Use existing list or empty array

    //↑ Always read latest data before modifying


    if (!sites.includes(newSite)) {
      sites.push(newSite); // Prevent duplicate entries
      //↑ Only add if not already present

      // Save updated list back to storage
      // After saving → call loadSites() to refresh UI
      api.storage.local.set({ blockedSites: sites }, loadSites); // Add new site to list

      //↑ Important Pattern: Update Data then refresh UI


    }
  });

  input.value = "";  //Good UX: Clear input field after adding
});

// Function to remove a specific site
function removeSite(siteToRemove) {
  api.storage.local.get(["blockedSites"], (result) => { // Get current list from storage
    const updated = (result.blockedSites || []).filter(site => site !== siteToRemove);   // Create new list excluding the site we want to remove

    //↑ .filter() = “keep everything except this one”

    // Save updated list back to storage
    // Then reload UI
    api.storage.local.set({ blockedSites: updated }, loadSites);

    //↑     👉 Same pattern again: modify data, save, refresh UI   
  });
}

// When page loads → populate UI immediately
loadSites();

// --- Streak Timer Display ---

// Formats a duration in milliseconds into  "Xd Xh Xm Xs"
function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0) parts.push(days + "d");
  if (hours > 0) parts.push(hours + "h");
  if (minutes > 0) parts.push(minutes + "m");
  parts.push(seconds + "s");

  return parts.join(" ");
}

// Reads streakStart from storage and updates the display elements.
function updateStreakDisplay() {
  api.storage.local.get(["streakStart"], (result) => {
    const display = document.getElementById("streakDisplay");
    const since = document.getElementById("streakSince");

    if (!result.streakStart) {
      display.textContent = "0s";
      since.textContent = "";
      return;
    }

    const elapsed = Date.now() - result.streakStart;
    display.textContent = formatDuration(elapsed);

    // Show a human-readable "since" date
    const sinceDate = new Date(result.streakStart);
    since.textContent = "Started: " + sinceDate.toLocaleString();
  });
}

// Update immediately, then tick every second
updateStreakDisplay();
setInterval(updateStreakDisplay, 1000);

// If the blocked list changes while the options page is open,
// the streak will have been reset in the background — refresh the display.
api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes.streakStart || changes.blockedSites)) {
    updateStreakDisplay();
  }
});