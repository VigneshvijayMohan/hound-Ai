// content.js
let selectedText = '';
let selectedRange = null;
let bubble = null;
let isExtensionActive = false;

// Check extension status when the script loads
chrome.storage.sync.get('extensionActive', function(data) {
  isExtensionActive = data.extensionActive === true;
});

// Listen for mouseup events to capture text selection
document.addEventListener('mouseup', function(event) {
  // Only process if extension is active
  if (!isExtensionActive) return;
  
  const selection = window.getSelection();
  if (selection.toString().trim().length > 0) {
    selectedText = selection.toString().trim();
    selectedRange = selection.getRangeAt(0);
    
    // Send message to background script with selection data
    chrome.runtime.sendMessage({
      action: "processSelectionFromContent",
      data: {
        selection: selectedText,
        url: window.location.href
      }
    });
  } else {
    // If there's no selected text, remove the bubble
    if (bubble) {
      document.body.removeChild(bubble);
      bubble = null;
    }
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "processSelection") {
    // This is triggered from the context menu
    // The selection is already available in the background script
    // We don't need to do anything here as the background script will call us back
  } else if (request.action === "displayResponse") {
    showBubble(request.response);
  } else if (request.action === "displayError") {
    showErrorBubble(request.error);
  } else if (request.action === "toggleExtension") {
    isExtensionActive = request.isActive;
    
    // Remove any existing bubbles when toggling off
    if (!isExtensionActive && bubble) {
      document.body.removeChild(bubble);
      bubble = null;
    }
  } else if (request.action === "notifyDisabled") {
    showNotificationBubble("Extension is disabled. Please enable it from the popup menu.");
  }
  return true;
});

// Function to show response in a bubble
function showBubble(response) {
  // Remove existing bubble if any
  if (bubble) {
    document.body.removeChild(bubble);
  }
  
  // Make sure we have a valid selection
  if (!selectedRange) return;
  
  // Get the bounding rectangle of the selected text
  const rect = selectedRange.getBoundingClientRect();
  
  // Create a bubble element
  bubble = document.createElement('div');
  bubble.className = 'selection-bubble';
  bubble.innerHTML = `
    <div class="bubble-header">
      <span>Analysis Result</span>
      <button class="close-bubble">×</button>
    </div>
    <div class="bubble-content">
      ${formatResponse(response)}
    </div>
  `;
  
  // Style the bubble's position
  const top = rect.bottom + window.scrollY;
  const left = rect.left + window.scrollX;
  
  bubble.style.position = 'absolute';
  bubble.style.top = `${top}px`;
  bubble.style.left = `${left}px`;
  
  // Add the bubble to the document
  document.body.appendChild(bubble);
  
  // Add a close button event listener
  bubble.querySelector('.close-bubble').addEventListener('click', function() {
    document.body.removeChild(bubble);
    bubble = null;
  });
}

// Function to show error in bubble
function showErrorBubble(error) {
  // Same as showBubble but with error styling
  if (bubble) {
    document.body.removeChild(bubble);
  }
  
  if (!selectedRange) return;
  
  const rect = selectedRange.getBoundingClientRect();
  
  bubble = document.createElement('div');
  bubble.className = 'selection-bubble error-bubble';
  bubble.innerHTML = `
    <div class="bubble-header">
      <span>Error</span>
      <button class="close-bubble">×</button>
    </div>
    <div class="bubble-content">
      Failed to process: ${error}
    </div>
  `;
  
  const top = rect.bottom + window.scrollY;
  const left = rect.left + window.scrollX;
  
  bubble.style.position = 'absolute';
  bubble.style.top = `${top}px`;
  bubble.style.left = `${left}px`;
  
  document.body.appendChild(bubble);
  
  bubble.querySelector('.close-bubble').addEventListener('click', function() {
    document.body.removeChild(bubble);
    bubble = null;
  });
}

// Function to show notification in bubble
function showNotificationBubble(message) {
  // Get the cursor position
  const mouseX = window.event ? window.event.clientX : 100;
  const mouseY = window.event ? window.event.clientY : 100;
  
  // Remove existing bubble if any
  if (bubble) {
    document.body.removeChild(bubble);
  }
  
  // Create a bubble element
  bubble = document.createElement('div');
  bubble.className = 'selection-bubble notification-bubble';
  bubble.innerHTML = `
    <div class="bubble-header">
      <span>Notification</span>
      <button class="close-bubble">×</button>
    </div>
    <div class="bubble-content">
      ${message}
    </div>
  `;
  
  // Style the bubble's position
  const top = mouseY + window.scrollY;
  const left = mouseX + window.scrollX;
  
  bubble.style.position = 'absolute';
  bubble.style.top = `${top}px`;
  bubble.style.left = `${left}px`;
  
  // Add the bubble to the document
  document.body.appendChild(bubble);
  
  // Add a close button event listener
  bubble.querySelector('.close-bubble').addEventListener('click', function() {
    document.body.removeChild(bubble);
    bubble = null;
  });
  
  // Auto-dismiss after 3 seconds
  setTimeout(function() {
    if (bubble && document.body.contains(bubble)) {
      document.body.removeChild(bubble);
      bubble = null;
    }
  }, 3000);
}

// Helper function to format the response for display
function formatResponse(response) {
  if (typeof response === 'string') {
    return response;
  } else if (typeof response === 'object') {
    try {
      // Handle different response formats
      if (response.result) {
        return response.result;
      } else if (response.message) {
        return response.message;
      } else {
        return JSON.stringify(response, null, 2);
      }
    } catch (e) {
      return 'Could not parse response: ' + e.message;
    }
  }
  return 'No data';
}