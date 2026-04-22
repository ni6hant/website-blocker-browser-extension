# Website Blocker Chrome Extension
Excrusiatingly basic Webstie Blocker extension for Chrome. The only reason this was created was because [BrowsecVPN Extension stole passwords and login sessions](https://www.youtube.com/watch?v=LnoBTkJHxTs) and I could never trust a closed source extension ever again.
<br><Br>I didn't want to do it but using something like this really helped me not lose focus while working.
<br><Br>And, I really wanted to properly study JS and underlying system and then make it and it might take me months to do so on my own and these "AI" but really LLMs ruined my career both from a job prespective and from a tech youtuber perspective, so why not I use them atleast until they are free.
<br><Br>P.S: I would love to write something like this blindly on my own at a later stage but for now I really need something right now.

# LLM Declaration
LLM was used to write the code but not blindly. Each part of the code was understood and tested by me and once I have 100% grasp of this code, this line will be removed.

## How to Use
### Chrome
1. Download the latest release .crx chrome extension.
2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode**
4. Drag and drop the .crx file from before.
5. Either pin the extension or click details→ Manage Extension and add and remove sites you wish to keep here itself.
---

### Firefox (Temporary: Published on Mozilla Add-Ons. Will update link here if it goes live and this won't be needed)
1. Download the latest release .zip firefox extension.
2. Open Firefox and go to:
   ```
   about:debugging
   ```
3. Click on "This Firefox"
4. Click on "Load Temporary Add-on..."
5. Select the zip file.
6. Add-On Button→ Simple Website Blocker→ Options → Add/Remove sites you want from here.
---




## For Developers: Big System Insight
### A very clean Architecture: "Flow"
Storage
<br>blockedSites
<br>↓
<br>UI (derived): loadSites()
<br>↓
<br>User action: (add, remove)
<br>↓
<br>Update storage
<br>↓
<br>Re-render UI


### This pattern is used everywhere
This is a basic version of:<br>
React state management<br>
Redux pattern<br>
Backend CRUD systems

But without frameworks