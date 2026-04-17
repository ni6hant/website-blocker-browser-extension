# Website Blocker Chrome Extension
Excrusiatingly basic Webstie Blocker extension for Chrome. The only reason this was created was because [BrowsecVPN Extension stole passwords and login sessions](https://www.youtube.com/watch?v=LnoBTkJHxTs) and I could never trust a closed source extension ever again.
<br><Br>I didn't want to do it but using something like this really helped me not lose focus while working.
<br><Br>And, I really wanted to properly study JS and underlying system and then make it and it might take me months to do so on my own and these "AI" but really LLMs ruined my career both from a job prespective and from a tech youtuber perspective, so why not I use them atleast until they are free.
<br><Br>P.S: I would love to write something like this blindly on my own at a later stage but for now I really need something right now.

# LLM Declaration
LLM was used to write the code but not blindly. Each part of the code was understood and tested by me and once I have 100% grasp of this code, this line will be removed.

## How to Use
1. Add list of websites you wish to block in **background.js** blockSite in the proper format
2. Download this repository as ZIP
3. Extract the ZIP files into a folder.
4. Open Chrome and go to:
   ```
   chrome://extensions/
   ```
5. Enable **Developer Mode**
6. Click **Load unpacked**
7. Select the extracted folder
---


## For Developers: Big System Insight
### A very clean Architecture: "Flow"
1. Storage (truth)
<br>blockedSites
<br>‎ ‎ ‎ ‎ ‎ ‎ ‎ ↓
2. UI (derived)
<br>loadSites()
<br>‎ ‎ ‎ ‎ ‎ ‎ ‎ ↓
3. User action
<br>(add, remove)
<br>‎ ‎ ‎ ‎ ‎ ‎ ‎ ↓
4. Update storage
<br>‎ ‎ ‎ ‎ ‎ ‎ ‎ ↓
5. Re-render UI


### This pattern is used everywhere
This is a basic version of:<br>
React state management<br>
Redux pattern<br>
Backend CRUD systems

But without frameworks