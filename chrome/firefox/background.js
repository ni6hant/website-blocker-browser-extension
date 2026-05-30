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
  
// Load from storage when extension starts
api.storage.local.get(["blockedSites"], (result) => {
  if (result.blockedSites && result.blockedSites.length > 0) {
    blockedSites = result.blockedSites;
  } else {
    blockedSites = defaultSites;
    api.storage.local.set({ blockedSites: defaultSites });
  }
});

//Live Updates

api.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.blockedSites) {
    blockedSites = changes.blockedSites.newValue;
    console.log("Updated blocked sites:", blockedSites);
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