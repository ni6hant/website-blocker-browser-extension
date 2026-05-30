const api = typeof browser !== "undefined" ? browser : chrome;

let blockedSites = [];

const defaultSites = [
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "reddit.com"
];

// --- Streak Timer Helpers ---

// Saves the current timestamp as the streak start (i.e. resets the streak to now)
function resetStreakTimer() {
  api.storage.local.set({ streakStart: Date.now() });
  console.log("Streak timer reset.");
}

// Called once on startup: ensures a streakStart exists in storage.
// If it doesn't exist yet (fresh install or was wiped), start the clock now.
function initStreakTimer() {
  api.storage.local.get(["streakStart"], (result) => {
    if (!result.streakStart) {
      resetStreakTimer();
    }
  });
}

// --- On install / update / browser-start ---
// onInstalled fires when the extension is first installed OR re-installed after removal.
// We reset the streak in all those cases so re-installing counts as breaking the streak.
api.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Brand-new install: start the streak clock now
    resetStreakTimer();
  } else if (details.reason === "update") {
    // Extension updated (not reinstalled) — keep the existing streak, don't reset
    initStreakTimer();
  }
});

// onStartup fires when the browser launches with the extension already installed.
// We just make sure streakStart is set (won't overwrite an existing one).
api.runtime.onStartup.addListener(() => {
  initStreakTimer();
});

// --- Load blocked sites from storage when extension starts ---
api.storage.local.get(["blockedSites"], (result) => {
  if (result.blockedSites && result.blockedSites.length > 0) {
    blockedSites = result.blockedSites;
  } else {
    blockedSites = defaultSites;
    api.storage.local.set({ blockedSites: defaultSites });
  }
  // Ensure streak timer is always initialised on background script load
  initStreakTimer();
});

// --- Live Updates ---
// Any change to blockedSites (add or remove) resets the streak,
// because the user modified their commitment.
api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
    console.log("Updated blocked sites:", blockedSites);
    // Only reset when the list actually changes content, not just on init
    if (changes.blockedSites.oldValue !== undefined) {
      resetStreakTimer();
    }
  }
});


// Listens for ANY tab update event in the browser.
api.webNavigation.onBeforeNavigate.addListener((details) => {
  //When a page has fully loaded and the tab actually has a url(some tabs don't), then the if statement becomes true and the rest of the code is executed.

  // Only main page (ignore iframes)
  if (details.frameId !== 0) return;

  // Extract the URL of the current tab and check if the current URL matches any blocked site
  const url = details.url;
  const hostname = new URL(url).hostname;

  const isBlocked = blockedSites.some(site =>
    hostname === site || hostname.endsWith("." + site) //Sub-domains are also blocked
  );

  //If it is blocked, display blocked.html page instead of that page
  if (isBlocked) {
    api.tabs.update(details.tabId, {
      url: api.runtime.getURL("blocked.html")
    });
  }

});