const api = typeof browser !== "undefined" ? browser : chrome;

let blockedSites = [];
let timeLocks = [];

const defaultSites = [
  "facebook.com",
  "twitter.com",
  "x.com",
  "instagram.com",
  "youtube.com",
  "reddit.com"
];

// --- Streak Timer Helpers ---

function resetStreakTimer() {
  api.storage.local.set({ streakStart: Date.now() });
  console.log("Streak timer reset.");
}

function initStreakTimer() {
  api.storage.local.get(["streakStart"], (result) => {
    if (!result.streakStart) {
      resetStreakTimer();
    }
  });
}

// --- Time Lock Helpers ---

// Returns true if the current LOCAL time falls within this lock's window.
// Handles overnight ranges (e.g. 22:00–06:00) automatically.
function isWithinTimeLock(lock) {
  if (!lock.enabled) return false;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  const [startH, startM] = lock.startTime.split(":").map(Number);
  const [endH, endM] = lock.endTime.split(":").map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (start <= end) {
    // Normal range e.g. 09:00–17:00
    return current >= start && current < end;
  } else {
    // Overnight range e.g. 22:00–06:00
    return current >= start || current < end;
  }
}

// If no time locks are defined → always block (original behaviour).
// If time locks exist → only block when at least one lock is currently active.
function isBlockingActiveNow() {
  if (timeLocks.length === 0) return true;
  return timeLocks.some(lock => isWithinTimeLock(lock));
}

// --- On install / update / browser-start ---

api.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    resetStreakTimer();
  } else if (details.reason === "update") {
    initStreakTimer();
  }
});

api.runtime.onStartup.addListener(() => {
  initStreakTimer();
});

// --- Load from storage when extension starts ---

api.storage.local.get(["blockedSites", "timeLocks"], (result) => {
  if (result.blockedSites && result.blockedSites.length > 0) {
    blockedSites = result.blockedSites;
  } else {
    blockedSites = defaultSites;
    api.storage.local.set({ blockedSites: defaultSites });
  }

  timeLocks = result.timeLocks || [];

  initStreakTimer();
});

// --- Live Updates ---

api.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;

  if (changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
    console.log("Updated blocked sites:", blockedSites);
    // Reset streak on any real change (not the first-ever write)
    if (changes.blockedSites.oldValue !== undefined) {
      resetStreakTimer();
    }
  }

  if (changes.timeLocks) {
    timeLocks = changes.timeLocks.newValue || [];
    console.log("Updated time locks:", timeLocks);
    // Changing time lock rules counts as modifying your commitment
    if (changes.timeLocks.oldValue !== undefined) {
      resetStreakTimer();
    }
  }
});

// --- Navigation Listener ---

api.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only intercept main page navigations, not iframes
  if (details.frameId !== 0) return;

  const url = details.url;
  const hostname = new URL(url).hostname;

  const isBlocked = blockedSites.some(site =>
    hostname === site || hostname.endsWith("." + site)
  );

  // Block only if the site is on the list AND we are within an active time window
  if (isBlocked && isBlockingActiveNow()) {
    api.tabs.update(details.tabId, {
      url: api.runtime.getURL("blocked.html")
    });
  }
});