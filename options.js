// First: What this file is doing overall

// This file is basically:

// UI ↔ Storage bridge

// Reads data from storage → shows it on screen
// Takes user input → updates storage

// That’s it.




// This function loads the blocked sites from storage
// and displays them in the UI (the <ul> list)
function loadSites() {

    
  // chrome.storage.local.get → async call to fetch stored data
  // ["blockedSites"] → we are asking ONLY for this key
  chrome.storage.local.get(["blockedSites"], (result) => {
    const list = document.getElementById("siteList"); // Get the <ul> element where we will display sites
    list.innerHTML = ""; // Clear existing list (important to avoid duplicates)

    const sites = result.blockedSites || []; // If nothing exists in storage, use empty array

    sites.forEach(site => { // Loop through each site in the list
      const li = document.createElement("li"); // Create a list item <li> for each site
      li.textContent = site; // Set text of <li> to the site name

      const btn = document.createElement("button"); // Create a "Remove" button for each site
      btn.textContent = "Remove"; // Button label

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
// UI is always derived from storage (single source of truth)


// Listen for click on "Add" button
document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("siteInput"); // Get input field
  const newSite = input.value.trim(); // Get user input and remove extra spaces

  if (!newSite) return; // If input is empty → do nothing
//↑ Prevents: empty entries & accidental clicks


  // Get current stored sites
  chrome.storage.local.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || []; // Use existing list or empty array

    //↑ Always read latest data before modifying


    if (!sites.includes(newSite)) {
      sites.push(newSite); // Prevent duplicate entries
    //↑ Only add if not already present

    // Save updated list back to storage
    // After saving → call loadSites() to refresh UI
      chrome.storage.local.set({ blockedSites: sites }, loadSites); // Add new site to list

       //↑ Important Pattern: Update Data then refresh UI

      
    }
  });

  input.value = "";  //Good UX: Clear input field after adding
});

// Function to remove a specific site
function removeSite(siteToRemove) {
  chrome.storage.local.get(["blockedSites"], (result) => { // Get current list from storage
    const updated = (result.blockedSites || []).filter(site => site !== siteToRemove);   // Create new list excluding the site we want to remove

    //↑ .filter() = “keep everything except this one”

    // Save updated list back to storage
    // Then reload UI
    chrome.storage.local.set({ blockedSites: updated }, loadSites);

    //↑     👉 Same pattern again: modify data, save, refresh UI   
  });
}

// When page loads → populate UI immediately
loadSites();