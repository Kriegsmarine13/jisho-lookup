// Set up the context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "jishoLookup",
    title: "Search on Jisho: '%s'",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "jishoLookup" && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    chrome.tabs.create({ url: `https://jisho.org/search/${query}` });
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "lookup-selection") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    try {
      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.getSelection().toString()
      });

      if (result?.trim()) {
        const query = encodeURIComponent(result.trim());
        chrome.tabs.create({ url: `https://jisho.org/search/${query}` });
      } else {
        console.warn("No text selected");
      }
    } catch (e) {
      console.error("Failed to read selection:", e);
    }
  }
});
