// background.js
chrome.runtime.onInstalled.addListener(() => {
    // Set default settings if not already set
    chrome.storage.sync.get(['apiUrl', 'extensionActive'], function(data) {
      const defaults = {};
      
      if (!('apiUrl' in data)) {
        defaults.apiUrl = 'http://localhost:8000/api/selection/';
      }
      
      if (!('extensionActive' in data)) {
        defaults.extensionActive = false; // Disabled by default
      }
      
      if (Object.keys(defaults).length > 0) {
        chrome.storage.sync.set(defaults);
      }
    });
    
    // Create a context menu item
    chrome.contextMenus.create({
      id: "processSelection",
      title: "Process Selected Text",
      contexts: ["selection"]
    });
  });
  
  // Listen for context menu clicks
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "processSelection") {
      // Check if extension is active before processing
      chrome.storage.sync.get('extensionActive', function(data) {
        if (data.extensionActive) {
          chrome.tabs.sendMessage(tab.id, {
            action: "processSelection",
            selection: info.selectionText
          });
        } else {
          // Notify user that extension is disabled
          chrome.tabs.sendMessage(tab.id, {
            action: "notifyDisabled"
          });
        }
      });
    }
  });
  
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processSelectionFromContent") {
      // Check if extension is active before processing
      chrome.storage.sync.get('extensionActive', function(data) {
        if (data.extensionActive) {
          processSelection(request.data, sender.tab.id);
        }
      });
      return true;
    }
  });
  
  // Function to process the selection
  function processSelection(data, tabId) {
    chrome.storage.sync.get('apiUrl', function(settings) {
      const apiUrl = settings.apiUrl || 'http://localhost:8000/api/selection/';
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(responseData => {
        // Send the processed data back to the content script
        chrome.tabs.sendMessage(tabId, {
          action: "displayResponse",
          response: responseData
        });
      })
      .catch(error => {
        chrome.tabs.sendMessage(tabId, {
          action: "displayError",
          error: error.message
        });
      });
    });
  }