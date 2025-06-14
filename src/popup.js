const DEFAULT_SETTINGS = {
  url: 'https://events.ycombinator.com/ai-sus',
  cadence: 5,
  prompt: 'Tell me the important changes in 2 sentences',
  provider: 'no-llm',
  apiKey: '',
  snapshot: ''
};

const elements = {
  url: document.getElementById('url'),
  cadence: document.getElementById('cadence'),
  cadenceValue: document.getElementById('cadence-value'),
  prompt: document.getElementById('prompt'),
  providers: document.querySelectorAll('input[name="provider"]'),
  apiKey: document.getElementById('api-key'),
  apiKeySection: document.getElementById('api-key-section'),
  saveBtn: document.getElementById('save-btn'),
  testBtn: document.getElementById('test-btn'),
  status: document.getElementById('status')
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
}

function updateApiKeyVisibility() {
  const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
  const needsApiKey = selectedProvider === 'openai' || selectedProvider === 'gemini';
  
  elements.apiKeySection.style.display = needsApiKey ? 'block' : 'none';
}

function showStatus(message, type = 'info', duration = 3000) {
  elements.status.textContent = message;
  elements.status.className = `status ${type}`;
  elements.status.style.display = 'block';
  
  setTimeout(() => {
    elements.status.style.display = 'none';
  }, duration);
}

async function saveSettings() {
  const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
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
    const response = await chrome.runtime.sendMessage({ action: 'testNow' });
    
    if (response.success) {
      showStatus('Test completed! Check for notifications.', 'success');
    } else {
      showStatus(`Test failed: ${response.error}`, 'error');
    }
  } catch (error) {
    showStatus(`Test failed: ${error.message}`, 'error');
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