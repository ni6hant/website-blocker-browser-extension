// UI ↔ Storage bridge
// Reads data from storage → shows it on screen
// Takes user input → updates storage

const api = typeof browser !== "undefined" ? browser : chrome;

// ═══════════════════════════════════════════
// BLOCKED SITES
// ═══════════════════════════════════════════

function loadSites() {
  api.storage.local.get(["blockedSites"], (result) => {
    const list = document.getElementById("siteList");
    list.innerHTML = "";

    const sites = result.blockedSites || [];

    if (sites.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "No sites blocked yet.";
      list.appendChild(li);
      return;
    }

    sites.forEach(site => {
      const li = document.createElement("li");

      const btn = document.createElement("button");
      btn.textContent = site;
      btn.onclick = () => removeSite(site);

      li.appendChild(btn);
      list.appendChild(li);
    });
  });
}

document.getElementById("addBtn").addEventListener("click", () => {
  const input = document.getElementById("siteInput");
  const newSite = input.value.trim().toLowerCase();

  if (!newSite) return;

  api.storage.local.get(["blockedSites"], (result) => {
    const sites = result.blockedSites || [];

    if (!sites.includes(newSite)) {
      sites.push(newSite);
      api.storage.local.set({ blockedSites: sites }, loadSites);
    }
  });

  input.value = "";
});

function removeSite(siteToRemove) {
  api.storage.local.get(["blockedSites"], (result) => {
    const updated = (result.blockedSites || []).filter(s => s !== siteToRemove);
    api.storage.local.set({ blockedSites: updated }, loadSites);
  });
}

// ═══════════════════════════════════════════
// TIME LOCKS
// ═══════════════════════════════════════════

function loadTimeLocks() {
  api.storage.local.get(["timeLocks"], (result) => {
    const locks = result.timeLocks || [];
    const list = document.getElementById("timeLockList");
    list.innerHTML = "";

    if (locks.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "No time locks set — sites are blocked at all times.";
      list.appendChild(li);
      return;
    }

    locks.forEach((lock, index) => {
      const li = document.createElement("li");
      li.className = "lock-row";

      // Time range display
      const timeSpan = document.createElement("span");
      timeSpan.className = "lock-time " + (lock.enabled ? "lock-enabled" : "lock-disabled");
      timeSpan.textContent = `${lock.startTime} – ${lock.endTime}`;

      // Optional label
      const labelSpan = document.createElement("span");
      labelSpan.className = "lock-label-text";
      labelSpan.textContent = lock.label ? `(${lock.label})` : "";

      // Toggle button
      const toggleBtn = document.createElement("button");
      toggleBtn.textContent = lock.enabled ? "Disable" : "Enable";
      toggleBtn.className = lock.enabled ? "toggle-btn-enabled" : "toggle-btn-disabled";
      toggleBtn.onclick = () => toggleTimeLock(index);

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "Remove";
      removeBtn.onclick = () => removeTimeLock(index);

      li.appendChild(timeSpan);
      li.appendChild(labelSpan);
      li.appendChild(toggleBtn);
      li.appendChild(removeBtn);
      list.appendChild(li);
    });
  });
}

document.getElementById("addLockBtn").addEventListener("click", () => {
  const startTime = document.getElementById("lockStart").value;
  const endTime = document.getElementById("lockEnd").value;
  const label = document.getElementById("lockLabel").value.trim();

  if (!startTime || !endTime) {
    alert("Please set both a start and end time.");
    return;
  }
  if (startTime === endTime) {
    alert("Start and end time cannot be the same.");
    return;
  }

  api.storage.local.get(["timeLocks"], (result) => {
    const locks = result.timeLocks || [];
    locks.push({ startTime, endTime, label, enabled: true });
    api.storage.local.set({ timeLocks: locks }, loadTimeLocks);
  });

  document.getElementById("lockStart").value = "";
  document.getElementById("lockEnd").value = "";
  document.getElementById("lockLabel").value = "";
});

function removeTimeLock(index) {
  api.storage.local.get(["timeLocks"], (result) => {
    const locks = result.timeLocks || [];
    locks.splice(index, 1);
    api.storage.local.set({ timeLocks: locks }, loadTimeLocks);
  });
}

function toggleTimeLock(index) {
  api.storage.local.get(["timeLocks"], (result) => {
    const locks = result.timeLocks || [];
    locks[index].enabled = !locks[index].enabled;
    api.storage.local.set({ timeLocks: locks }, loadTimeLocks);
  });
}

// ═══════════════════════════════════════════
// STREAK TIMER DISPLAY
// ═══════════════════════════════════════════

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

    const sinceDate = new Date(result.streakStart);
    since.textContent = "Started: " + sinceDate.toLocaleString();
  });
}

updateStreakDisplay();
setInterval(updateStreakDisplay, 1000);

// Refresh displays live if storage changes while this tab is open
api.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.streakStart || changes.blockedSites) updateStreakDisplay();
  if (changes.timeLocks) loadTimeLocks();
});

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

loadSites();
loadTimeLocks();