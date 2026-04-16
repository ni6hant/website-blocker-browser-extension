//List of Blocked Website. Add your own website here in proper format.
const blockedSites = [
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "youtube.com"
  ];
  

  // Listens for ANY tab update event in the browser.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    //When a page has fully loaded and the tab actually has a url(some tabs don't), then the if statement becomes true and the rest of the code is executed.
    if (changeInfo.status === "complete" && tab.url) {
      
      // Extract the URL of the current tab
      const url = tab.url;
  
      // Check if the current URL matches any blocked site
      const isBlocked = blockedSites.some(site => url.includes(site));
  
      //If it is blocked, display blocked.html page instead of that page
      if (isBlocked) {
        chrome.tabs.update(tabId, {
          url: chrome.runtime.getURL("blocked.html")
        });
      }
    }
  });