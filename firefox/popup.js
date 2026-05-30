const api = typeof browser !== "undefined" ? browser : chrome;

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (days > 0)    parts.push(days + "d");
  if (hours > 0)   parts.push(hours + "h");
  if (minutes > 0) parts.push(minutes + "m");
  parts.push(seconds + "s");

  return parts.join(" ");
}

function updateStreakDisplay() {
  api.storage.local.get(["streakStart"], (result) => {
    const display = document.getElementById("streakDisplay");
    const since   = document.getElementById("streakSince");

    if (!result.streakStart) {
      display.textContent = "0s";
      since.textContent   = "";
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

updateStreakDisplay();
setInterval(updateStreakDisplay, 1000);

// Open the options page in a tab when the button is clicked
document.getElementById("optionsBtn").addEventListener("click", () => {
  api.runtime.openOptionsPage();
});
