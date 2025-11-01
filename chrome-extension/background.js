// Background service worker for GetNoticed Chrome Extension

// Extension installation and setup
chrome.runtime.onInstalled.addListener(() => {
  console.log('GetNoticed extension installed successfully');
  
  // Set default settings
  chrome.storage.sync.set({
    autoFillEnabled: true,
    showFloatingButton: true,
    notificationsEnabled: true
  });
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'getnoticed-autofill',
    title: 'Auto-fill with GetNoticed',
    contexts: ['editable']
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'openPopup':
      // Handle popup opening logic
      sendResponse({ success: true });
      break;
      
    case 'getProfile':
      // Fetch user profile from main app
      fetchUserProfile()
        .then(profile => sendResponse({ success: true, profile }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'updateApplicationStatus':
      // Update application status in main app
      updateApplicationStatus(request.data)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle tab updates to detect job application pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkIfJobApplicationPage(tab.url, tabId);
  }
});

// Detect job application pages and show badge
function checkIfJobApplicationPage(url, tabId) {
  const jobSites = [
    'linkedin.com/jobs',
    'indeed.com',
    'glassdoor.com',
    'monster.com',
    'ziprecruiter.com',
    'workday.com',
    'greenhouse.io',
    'lever.co',
    'careers.',
    'jobs.',
    '/apply',
    '/application'
  ];
  
  const isJobSite = jobSites.some(site => url.toLowerCase().includes(site));
  
  if (isJobSite) {
    // Show badge to indicate extension is active
    chrome.action.setBadgeText({
      tabId: tabId,
      text: '!'
    });
    
    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#3b82f6'
    });
    
    // Update tooltip
    chrome.action.setTitle({
      tabId: tabId,
      title: 'GetNoticed - Job application detected! Click to auto-fill.'
    });
  } else {
    // Clear badge for non-job pages
    chrome.action.setBadgeText({
      tabId: tabId,
      text: ''
    });
    
    chrome.action.setTitle({
      tabId: tabId,
      title: 'GetNoticed Assistant'
    });
  }
}

// Fetch user profile from chrome storage
async function fetchUserProfile() {
  try {
    const result = await chrome.storage.local.get(['userProfile']);
    
    if (result.userProfile) {
      return result.userProfile;
    }
    
    throw new Error('No profile found. Please upload your CV in the GetNoticed app first.');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update application status in chrome storage
async function updateApplicationStatus(data) {
  try {
    // Get existing applications from storage
    const result = await chrome.storage.local.get(['applications']);
    const applications = result.applications || [];
    
    // Add or update application
    const existingIndex = applications.findIndex(app => app.id === data.id);
    if (existingIndex >= 0) {
      applications[existingIndex] = { ...applications[existingIndex], ...data };
    } else {
      applications.push({ ...data, id: Date.now().toString() });
    }
    
    // Save back to storage
    await chrome.storage.local.set({ applications });
    
    return { success: true, applications };
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically due to manifest configuration
  // But we can add additional logic here if needed
  console.log('Extension icon clicked on tab:', tab.url);
});


// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'getnoticed-autofill') {
    // Send message to content script to trigger auto-fill
    chrome.tabs.sendMessage(tab.id, {
      action: 'triggerAutoFill',
      elementId: info.targetElementId
    });
  }
});

// Periodic health check with main app
setInterval(async () => {
  try {
    const ports = [5173, 3000, 3002];
    let isConnected = false;
    
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}`, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        isConnected = true;
        await chrome.storage.local.set({ appPort: port });
        break;
      } catch (e) {
        continue;
      }
    }
    
    // Store connection status
    await chrome.storage.local.set({ appConnected: isConnected });
    
    // Update badge color based on connection
    const tabs = await chrome.tabs.query({ active: true });
    tabs.forEach(tab => {
      if (tab.url && tab.url.includes('job')) {
        chrome.action.setBadgeBackgroundColor({
          tabId: tab.id,
          color: isConnected ? '#10b981' : '#ef4444'
        });
      }
    });
  } catch (error) {
    // App is not running
    await chrome.storage.local.set({ appConnected: false });
  }
}, 30000); // Check every 30 seconds

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('GetNoticed extension started');
});

// Clean up on extension suspension
chrome.runtime.onSuspend.addListener(() => {
  console.log('GetNoticed extension suspended');
});