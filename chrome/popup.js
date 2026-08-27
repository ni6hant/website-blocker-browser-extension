const api = typeof browser !== "undefined" ? browser : chrome;

// Matches Date.getDay(): 0 = Sunday … 6 = Saturday
const DAY_CODES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const ALL_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ═══════════════════════════════════════════
// TIME LOCK STATUS
// (mirrors the logic in background.js — JS Date is always local time)
// ═══════════════════════════════════════════

function isWithinTimeLock(lock) {
  if (!lock.enabled) return false;

  // Weekday check — locks saved before this feature have no `days` → all days apply.
  if (Array.isArray(lock.days)) {
    const today = DAY_CODES[new Date().getDay()];
    if (lock.days.length === 0 || !lock.days.includes(today)) return false;
  }

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = lock.startTime.split(":").map(Number);
  const [endH, endM] = lock.endTime.split(":").map(Number);

  const start = startH * 60 + startM;
  const end = endH * 60 + endM;

  if (start <= end) {
    return current >= start && current < end;
  } else {
    // Overnight range e.g. 22:00–06:00
    return current >= start || current < end;
  }
}

function updateStatus() {
  api.storage.local.get(["timeLocks"], (result) => {
    const locks = result.timeLocks || [];
    const statusEl = document.getElementById("statusDisplay");
    const detailEl = document.getElementById("statusDetail");

    // No time locks defined → always blocking
    if (locks.length === 0) {
      statusEl.textContent = "● Always blocking";
      statusEl.style.color = "#2ecc71";
      detailEl.textContent = "No time locks set.";
      return;
    }

    const activeLock = locks.find(lock => isWithinTimeLock(lock));

    if (activeLock) {
      // Currently inside a lock window
      statusEl.textContent = "● Blocking active";
      statusEl.style.color = "#2ecc71";
      detailEl.textContent = `Until ${activeLock.endTime}`;
    } else {
      // Outside all lock windows
      statusEl.textContent = "● Blocking paused";
      statusEl.style.color = "#e67e22";

      // Find which lock fires next
      const enabledLocks = locks.filter(l => l.enabled);
      if (enabledLocks.length === 0) {
        detailEl.textContent = "All time locks are disabled.";
        return;
      }

      // Find which lock fires next (respecting each lock's active days)
      const now = new Date();
      const current = now.getHours() * 60 + now.getMinutes();

      let nextLock = null;
      let minDiff = Infinity;

      for (const lock of enabledLocks) {
        const days = Array.isArray(lock.days) && lock.days.length > 0 ? lock.days : [...ALL_DAYS];
        const [h, m] = lock.startTime.split(":").map(Number);
        const start = h * 60 + m;

        for (let offset = 0; offset < 7; offset++) {
          const dayCode = DAY_CODES[(now.getDay() + offset) % 7];
          if (!days.includes(dayCode)) continue;

          let diff = offset * 24 * 60 + (start - current);
          if (diff <= 0) continue; // Already started earlier today

          if (diff < minDiff) {
            minDiff = diff;
            nextLock = lock;
          }
          break; // Only the earliest occurrence of this lock matters
        }
      }

      detailEl.textContent = nextLock ? `Resumes at ${nextLock.startTime}` : "";
    }
  });
}

// ═══════════════════════════════════════════
// STREAK DISPLAY
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
    since.textContent = "Since " + sinceDate.toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric"
    });
  });
}

// ═══════════════════════════════════════════
// INIT — tick every second
// ═══════════════════════════════════════════

updateStatus();
updateStreakDisplay();

setInterval(() => {
  updateStatus();
  updateStreakDisplay();
}, 1000);

document.getElementById("optionsBtn").addEventListener("click", () => {
  api.runtime.openOptionsPage();
});