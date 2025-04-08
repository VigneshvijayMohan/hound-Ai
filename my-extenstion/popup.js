// popup.js
document.addEventListener('DOMContentLoaded', function() {
    const apiUrlInput = document.getElementById('api-url');
    const saveButton = document.getElementById('save-settings');
    const statusDiv = document.getElementById('status');
    const extensionActiveToggle = document.getElementById('extension-active');
    
    // Load saved settings
    chrome.storage.sync.get(['apiUrl', 'extensionActive'], function(data) {
      if (data.apiUrl) {
        apiUrlInput.value = data.apiUrl;
      } else {
        apiUrlInput.value = 'http://localhost:8000/api/selection/';
      }
      
      // Set the toggle state based on stored value (default to inactive)
      extensionActiveToggle.checked = data.extensionActive === true;
      updateStatusMessage(data.extensionActive === true);
    });
    
    // Toggle extension active state
    extensionActiveToggle.addEventListener('change', function() {
      const isActive = extensionActiveToggle.checked;
      
      chrome.storage.sync.set({ extensionActive: isActive }, function() {
        // Notify content scripts about the state change
        chrome.tabs.query({}, function(tabs) {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: "toggleExtension",
              isActive: isActive
            }).catch(() => {
              // Ignore errors from tabs that don't have the content script
            });
          });
        });
        
        updateStatusMessage(isActive);
      });
    });
    
    // Save API URL when the button is clicked
    saveButton.addEventListener('click', function() {
      const apiUrl = apiUrlInput.value.trim();
      
      if (!apiUrl) {
        statusDiv.textContent = 'Please enter a valid API URL';
        statusDiv.style.backgroundColor = '#ffdddd';
        return;
      }
      
      chrome.storage.sync.set({ apiUrl: apiUrl }, function() {
        statusDiv.textContent = 'Settings saved successfully!';
        statusDiv.style.backgroundColor = '#ddffdd';
        
        // Reset status message after 2 seconds
        setTimeout(function() {
          updateStatusMessage(extensionActiveToggle.checked);
        }, 2000);
      });
    });
    
    function updateStatusMessage(isActive) {
      if (isActive) {
        statusDiv.textContent = 'Extension is active. Select text on any page to send it to the backend.';
        statusDiv.style.backgroundColor = '#ddffdd';
      } else {
        statusDiv.textContent = 'Extension is disabled. Toggle the switch to enable.';
        statusDiv.style.backgroundColor = '#f0f0f0';
      }
    }
  });