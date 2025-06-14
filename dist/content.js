// Content script for AI SUS Watcher
// Runs in the context of web pages to read authenticated content

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    console.log('Content script: Received getPageContent request');
    
    try {
      // Get the full HTML content of the page
      const pageContent = document.documentElement.outerHTML;
      
      // Send the content back to the background script
      sendResponse({
        success: true,
        content: pageContent,
        url: window.location.href
      });
      
      console.log('Content script: Sent page content back to background');
    } catch (error) {
      console.error('Content script: Failed to get page content:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
  
  // Return true to indicate we will respond asynchronously
  return true;
});

console.log('AI SUS Watcher content script loaded on:', window.location.href);