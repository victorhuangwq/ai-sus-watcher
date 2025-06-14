// Content script for AI SUS Watcher
// Runs in the context of web pages to read authenticated content

interface ContentRequest {
  action: string;
}

interface ContentResponse {
  success: boolean;
  content?: string;
  url?: string;
  error?: string;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request: ContentRequest, _sender: chrome.runtime.MessageSender, sendResponse: (response: ContentResponse) => void) => {
  if (request.action === 'ping') {
    // Simple ping response to check if content script is loaded
    sendResponse({ success: true });
    return true;
  }
  
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
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Return true to indicate we will respond asynchronously
  return true;
});

console.log('AI SUS Watcher content script loaded on:', window.location.href);