const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

let counter = 0;
let lastUpdate = Date.now();
let currentEventIndex = 0;

// Different event scenarios to rotate through
const eventScenarios = [
  {
    title: "🚀 AI Product Launch Workshop",
    description: "Learn how to launch AI products that users love",
    sessions: [
      "Market Validation for AI Products - 9:00 AM",
      "Building MVP with AI APIs - 10:30 AM", 
      "User Testing AI Interfaces - 12:00 PM",
      "Scaling AI Infrastructure - 2:00 PM"
    ],
    speaker: "Sarah Chen, Former Product Lead at OpenAI",
    announcement: "🎉 New: Hands-on workshop with GPT-4 integration demos!",
    attendeeRange: [80, 120],
    specialInfo: "Bring your laptop - we'll be coding live!"
  },
  {
    title: "💰 AI Startup Fundraising Bootcamp", 
    description: "Master the art of raising capital for AI companies",
    sessions: [
      "Crafting Your AI Pitch Deck - 9:30 AM",
      "Understanding AI Valuations - 11:00 AM",
      "Meeting with VCs Panel - 1:30 PM", 
      "Term Sheet Negotiations - 3:00 PM"
    ],
    speaker: "Michael Rodriguez, Partner at Andreessen Horowitz",
    announcement: "💡 Special: 3 VCs confirmed for live pitch feedback session!",
    attendeeRange: [150, 200],
    specialInfo: "Pitch deck reviews available - submit by noon!"
  },
  {
    title: "🧠 Machine Learning in Production",
    description: "Deploy, monitor, and scale ML models in real-world applications", 
    sessions: [
      "MLOps Best Practices - 10:00 AM",
      "Model Monitoring & Drift Detection - 11:30 AM",
      "A/B Testing ML Models - 1:00 PM",
      "Scaling ML Infrastructure - 2:30 PM"
    ],
    speaker: "Dr. Lisa Wang, ML Engineering Director at Meta",
    announcement: "🔥 Hot Topic: How ChatGPT handles 100M+ users",
    attendeeRange: [200, 300],
    specialInfo: "Live demo: Deploying a model to production in 30 minutes"
  },
  {
    title: "🤖 Building AI Agents & Assistants",
    description: "Create intelligent agents that can perform complex tasks",
    sessions: [
      "Agent Architecture Patterns - 9:00 AM", 
      "Tool Use & Function Calling - 10:45 AM",
      "Memory & Context Management - 12:15 PM",
      "Multi-Agent Coordination - 2:00 PM"
    ],
    speaker: "Alex Kim, Head of AI at Anthropic",
    announcement: "🚨 Breaking: Claude 3.5 Sonnet features revealed exclusively!",
    attendeeRange: [120, 180],
    specialInfo: "Special guest: Team lead from CrewAI joining remotely"
  },
  {
    title: "📊 AI for Data Science & Analytics",
    description: "Leverage AI to supercharge your data analysis workflows",
    sessions: [
      "AutoML for Business Analytics - 9:30 AM",
      "AI-Powered Data Visualization - 11:00 AM", 
      "Natural Language to SQL - 12:30 PM",
      "Predictive Analytics with LLMs - 2:15 PM"
    ],
    speaker: "David Thompson, Chief Data Scientist at Snowflake", 
    announcement: "📈 New: Integration demos with latest business intelligence tools!",
    attendeeRange: [90, 140],
    specialInfo: "Free access to premium datasets for workshop participants"
  }
];

const baseContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI SUS Watcher Test Page</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        .update-info {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .content {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 30px;
        }
        .dynamic-content {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px;
            margin: 20px 0;
        }
        .timestamp {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{EVENT_TITLE}}</h1>
        <p>{{EVENT_DESCRIPTION}}</p>
    </div>
    
    <div class="update-info">
        <h2>📊 Page Update Information</h2>
        <p><strong>Refresh Counter:</strong> <span class="dynamic-content">{{COUNTER}}</span></p>
        <p><strong>Last Updated:</strong> <span class="timestamp">{{TIMESTAMP}}</span></p>
        <p><em>Page refreshes to show different event content for extension testing.</em></p>
    </div>
    
    <div class="content">
        <h2>📅 Today's Event Schedule</h2>
        
        <div class="dynamic-content">
            <h3>{{ANNOUNCEMENT}}</h3>
        </div>
        
        <h3>📋 Session Lineup</h3>
        <ul>
            {{SESSION_LIST}}
        </ul>
        
        <div class="dynamic-content">
            <h3>🎤 Featured Speaker</h3>
            <p><strong>{{SPEAKER}}</strong></p>
        </div>
        
        <h3>📍 Venue Information</h3>
        <p><strong>Location:</strong> Y Combinator, Mountain View, CA</p>
        <p><strong>Address:</strong> 335 Pioneer Way, Mountain View, CA 94041</p>
        
        <div class="dynamic-content">
            <h4>💡 Special Info</h4>
            <p>{{SPECIAL_INFO}}</p>
        </div>
        
        <h3>🔗 Resources & Materials</h3>
        <ul>
            <li><a href="#materials">Download Session Materials</a></li>
            <li><a href="#networking">Networking Guide</a></li>
            <li><a href="#followup">Follow-up Resources</a></li>
            <li><a href="#recordings">Session Recordings</a></li>
        </ul>
        
        <div class="dynamic-content">
            <h4>⚡ Live Stats</h4>
            <p>Current attendees: <strong>{{ATTENDEE_COUNT}}</strong> registered</p>
            <p>WiFi Network: <strong>YC-Guest</strong> | Password: <strong>AI{{WIFI_CODE}}</strong></p>
            <p>Next session starts in: <strong>{{TIME_TO_NEXT}}</strong></p>
        </div>
    </div>
</body>
</html>
`;

function generateRandomContent() {
    // Cycle through different event scenarios on each request
    const currentEvent = eventScenarios[currentEventIndex];
    currentEventIndex = (currentEventIndex + 1) % eventScenarios.length;
    
    // Generate session list HTML
    const sessionListHtml = currentEvent.sessions
        .map(session => `<li><strong>${session}</strong></li>`)
        .join('\n            ');
    
    // Generate random attendee count within the event's range
    const [minAttendees, maxAttendees] = currentEvent.attendeeRange;
    const attendeeCount = Math.floor(Math.random() * (maxAttendees - minAttendees + 1)) + minAttendees;
    
    // Generate time to next session (random)
    const timesToNext = ['15 minutes', '32 minutes', '1 hour 5 minutes', '45 minutes', '23 minutes'];
    
    return {
        counter: counter,
        timestamp: new Date().toLocaleString(),
        eventTitle: currentEvent.title,
        eventDescription: currentEvent.description,
        sessionList: sessionListHtml,
        speaker: currentEvent.speaker,
        announcement: currentEvent.announcement,
        specialInfo: currentEvent.specialInfo,
        attendeeCount: attendeeCount,
        wifiCode: Math.floor(Math.random() * 9000) + 1000,
        timeToNext: timesToNext[Math.floor(Math.random() * timesToNext.length)]
    };
}

app.get('/page', (req, res) => {
    counter++; // Increment counter on each page request
    const data = generateRandomContent();
    
    // Log the current event for debugging
    console.log(`📄 Page request #${counter} - Showing: ${data.eventTitle}`);
    
    let content = baseContent
        .replace(/\{\{COUNTER\}\}/g, data.counter)
        .replace(/\{\{TIMESTAMP\}\}/g, data.timestamp)
        .replace(/\{\{EVENT_TITLE\}\}/g, data.eventTitle)
        .replace(/\{\{EVENT_DESCRIPTION\}\}/g, data.eventDescription)
        .replace(/\{\{SESSION_LIST\}\}/g, data.sessionList)
        .replace(/\{\{SPEAKER\}\}/g, data.speaker)
        .replace(/\{\{ANNOUNCEMENT\}\}/g, data.announcement)
        .replace(/\{\{SPECIAL_INFO\}\}/g, data.specialInfo)
        .replace(/\{\{ATTENDEE_COUNT\}\}/g, data.attendeeCount)
        .replace(/\{\{WIFI_CODE\}\}/g, data.wifiCode)
        .replace(/\{\{TIME_TO_NEXT\}\}/g, data.timeToNext);
    
    res.send(content);
});

app.get('/static/v1', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Static Test Page v1</title></head>
        <body>
            <h1>Static Test Page - Version 1</h1>
            <p>This is the baseline version for regression testing.</p>
            <p>Content should remain unchanged for diff testing.</p>
        </body>
        </html>
    `);
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI SUS Watcher Dev Server</title>
            <style>
                body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
                .link { display: block; margin: 10px 0; padding: 10px; background: #f5f5f5; text-decoration: none; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>🚀 AI SUS Watcher Dev Server</h1>
            <p>Development server for testing the Chrome extension.</p>
            
            <h2>Test Pages:</h2>
            <a href="/page" class="link">📄 Dynamic Test Page (changes on each refresh)</a>
            <a href="/static/v1" class="link">📄 Static Test Page v1</a>
            
            <h3>Instructions:</h3>
            <ol>
                <li>Use <code>http://localhost:8080/page</code> as your target URL in the extension</li>
                <li>Click "Test now" or wait for automatic polling to see different AI event content</li>
                <li>Each refresh cycles through 5 different event scenarios with unique content</li>
                <li>Watch for notifications as the extension detects substantial content changes</li>
            </ol>
            
            <p><em>Server running on port ${PORT}</em></p>
        </body>
        </html>
    `);
});

console.log(`🚀 AI SUS Watcher dev server starting on http://localhost:${PORT}`);
console.log('📄 Test page available at: http://localhost:8080/page');
console.log('🔄 Page content changes on each refresh (cycles through 5 event scenarios)');

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});