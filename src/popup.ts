interface Settings {
  url: string;
  cadence: number;
  prompt: string;
  provider: string;
  apiKey: string;
  snapshot: string;
  monitoringActive: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  url: 'https://events.ycombinator.com/ai-sus',
  cadence: 5,
  prompt: 'Tell me the important changes in 10 words',
  provider: 'no-llm',
  apiKey: '',
  snapshot: '',
  monitoringActive: false
};

interface ElementRefs {
  url: HTMLInputElement;
  cadence: HTMLInputElement;
  cadenceValue: HTMLElement;
  prompt: HTMLTextAreaElement;
  providers: NodeListOf<HTMLInputElement>;
  apiKey: HTMLInputElement;
  apiKeySection: HTMLElement;
  saveBtn: HTMLButtonElement;
  testBtn: HTMLButtonElement;
  status: HTMLElement;
  monitoringToggle: HTMLButtonElement;
}

const elements: ElementRefs = {
  url: document.getElementById('url') as HTMLInputElement,
  cadence: document.getElementById('cadence') as HTMLInputElement,
  cadenceValue: document.getElementById('cadence-value') as HTMLElement,
  prompt: document.getElementById('prompt') as HTMLTextAreaElement,
  providers: document.querySelectorAll('input[name="provider"]') as NodeListOf<HTMLInputElement>,
  apiKey: document.getElementById('api-key') as HTMLInputElement,
  apiKeySection: document.getElementById('api-key-section') as HTMLElement,
  saveBtn: document.getElementById('save-btn') as HTMLButtonElement,
  testBtn: document.getElementById('test-btn') as HTMLButtonElement,
  status: document.getElementById('status') as HTMLElement,
  monitoringToggle: document.getElementById('monitoring-toggle') as HTMLButtonElement
};

async function loadSettings() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  
  elements.url.value = settings.url;
  elements.cadence.value = settings.cadence;
  
  // Update cadence display
  const cadenceValue = parseFloat(settings.cadence);
  if (cadenceValue < 1) {
    elements.cadenceValue.textContent = `${Math.round(cadenceValue * 60)} sec`;
  } else {
    elements.cadenceValue.textContent = `${cadenceValue} min`;
  }
  
  elements.prompt.value = settings.prompt;
  elements.apiKey.value = settings.apiKey;
  
  elements.providers.forEach(radio => {
    radio.checked = radio.value === settings.provider;
  });
  
  updateApiKeyVisibility();
  updateMonitoringStatus(settings.monitoringActive);
}

function updateApiKeyVisibility() {
  const selectedProvider = (document.querySelector('input[name="provider"]:checked') as HTMLInputElement).value;
  const needsApiKey = selectedProvider === 'openai' || selectedProvider === 'gemini';
  
  elements.apiKeySection.style.display = needsApiKey ? 'block' : 'none';
}

function updateMonitoringStatus(isActive: boolean) {
  const toggleText = elements.monitoringToggle.querySelector('.toggle-text') as HTMLElement;
  
  toggleText.textContent = isActive ? 'ON' : 'OFF';
  
  if (isActive) {
    elements.monitoringToggle.classList.add('active');
    elements.monitoringToggle.title = 'Stop monitoring';
  } else {
    elements.monitoringToggle.classList.remove('active');
    elements.monitoringToggle.title = 'Start monitoring';
  }
}

async function toggleMonitoring() {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const newState = !settings.monitoringActive;
  
  try {
    // Send message to background script to start/stop monitoring
    const response = await chrome.runtime.sendMessage({ 
      action: newState ? 'startMonitoring' : 'stopMonitoring' 
    });
    
    if (response && response.success) {
      await chrome.storage.local.set({ monitoringActive: newState });
      updateMonitoringStatus(newState);
      showStatus(newState ? 'Monitoring started' : 'Monitoring stopped', 'success');
    } else {
      showStatus(`Failed to ${newState ? 'start' : 'stop'} monitoring: ${response?.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    console.error('Failed to toggle monitoring:', error);
    showStatus(`Failed to ${newState ? 'start' : 'stop'} monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
}

function showStatus(message: string, type: 'info' | 'success' | 'error' = 'info', duration: number = 3000): void {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.style.display = 'block';
  
  setTimeout(() => {
    elements.status.style.display = 'none';
  }, duration);
}

async function saveSettings() {
  const selectedProvider = (document.querySelector('input[name="provider"]:checked') as HTMLInputElement).value;
  const needsApiKey = selectedProvider === 'openai' || selectedProvider === 'gemini';
  
  if (needsApiKey && !elements.apiKey.value.trim()) {
    showStatus('API key is required for this provider', 'error');
    return;
  }
  
  if (!elements.url.value.trim()) {
    showStatus('URL is required', 'error');
    return;
  }
  
  try {
    new URL(elements.url.value);
  } catch {
    showStatus('Please enter a valid URL', 'error');
    return;
  }
  
  const settings = {
    url: elements.url.value.trim(),
    cadence: parseFloat(elements.cadence.value),
    prompt: elements.prompt.value.trim() || DEFAULT_SETTINGS.prompt,
    provider: selectedProvider,
    apiKey: elements.apiKey.value.trim()
  };
  
  await chrome.storage.local.set(settings);
  showStatus('Settings saved successfully!', 'success');
}

async function testNow() {
  elements.testBtn.disabled = true;
  elements.testBtn.textContent = 'Testing...';
  
  try {
    console.log('Sending testNow message to background script');
    const response = await chrome.runtime.sendMessage({ action: 'testNow' });
    console.log('Received response:', response);
    
    if (response && response.pageTest && response.llmTest) {
      // Enhanced response with detailed test results
      let message = '';
      let statusType = 'success';
      
      // Check page test
      if (response.pageTest.success) {
        message += '✓ Page monitoring working. ';
      } else {
        message += '✗ Page test failed. ';
        statusType = 'error';
      }
      
      // Check LLM test
      if (response.llmTest.success) {
        message += `✓ ${response.llmTest.provider === 'no-llm' ? 'No LLM configured' : response.llmTest.provider + ' LLM working'}.`;
      } else {
        message += `✗ LLM test failed: ${response.llmTest.message}.`;
        statusType = 'error';
      }
      
      if (response.success) {
        message += ' Check notifications.';
      }
      
      showStatus(message, statusType as 'success' | 'error', 5000);
    } else if (response && response.success) {
      // Fallback for old response format
      showStatus('Test completed! Check for notifications.', 'success');
    } else {
      showStatus(`Test failed: ${response ? response.error : 'No response'}`, 'error');
    }
  } catch (error) {
    console.error('Test failed with error:', error);
    showStatus(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
  }
  
  elements.testBtn.disabled = false;
  elements.testBtn.textContent = 'Test now';
}


elements.cadence.addEventListener('input', () => {
  const value = parseFloat(elements.cadence.value);
  if (value < 1) {
    elements.cadenceValue.textContent = `${Math.round(value * 60)} sec`;
  } else {
    elements.cadenceValue.textContent = `${value} min`;
  }
});

elements.providers.forEach(radio => {
  radio.addEventListener('change', updateApiKeyVisibility);
});

elements.saveBtn.addEventListener('click', saveSettings);
elements.testBtn.addEventListener('click', testNow);
elements.monitoringToggle.addEventListener('click', toggleMonitoring);

elements.url.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

elements.apiKey.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveSettings();
  }
});

// Automatically open target page when popup opens
async function openTargetPageOnLoad() {
  // Add a small delay to let the popup render first
  setTimeout(async () => {
    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    const targetUrl = settings.url || DEFAULT_SETTINGS.url;
    
    // Get current active tab
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we're already on the target page
    if (currentTab && currentTab.url === targetUrl) {
      // Already on target page, don't do anything
      return;
    }
    
    const tabs = await chrome.tabs.query({ url: targetUrl });
    
    if (tabs.length === 0) {
      // If no tab exists, create a new one in the background
      await chrome.tabs.create({ url: targetUrl, active: false });
    }
    // If tab exists, don't switch to it - let user stay on current page with popup open
  }, 100); // 100ms delay
}

loadSettings();
openTargetPageOnLoad();