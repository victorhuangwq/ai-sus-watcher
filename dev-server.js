const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

let counter = 0;
let lastUpdate = Date.now();

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
        <h1>🚀 AI Startup School Event Page</h1>
        <p>Test page for AI SUS Watcher Chrome Extension</p>
    </div>
    
    <div class="update-info">
        <h2>📊 Page Update Information</h2>
        <p><strong>Update Counter:</strong> <span class="dynamic-content">{{COUNTER}}</span></p>
        <p><strong>Last Updated:</strong> <span class="timestamp">{{TIMESTAMP}}</span></p>
        <p><em>This page automatically updates every 2 minutes to test the extension's diff detection.</em></p>
    </div>
    
    <div class="content">
        <h2>📅 Upcoming Sessions</h2>
        
        <div class="dynamic-content">
            <h3>Session Update #{{COUNTER}}</h3>
            <p><strong>New Session Added:</strong> "Building AI Products That Scale" - Session {{RANDOM_SESSION}}</p>
            <p><strong>Time:</strong> {{RANDOM_TIME}}</p>
            <p><strong>Speaker:</strong> {{RANDOM_SPEAKER}}</p>
        </div>
        
        <h3>Core Sessions</h3>
        <ul>
            <li><strong>Introduction to AI Startups</strong> - 10:00 AM PDT</li>
            <li><strong>Market Research for AI Products</strong> - 11:30 AM PDT</li>
            <li><strong>Building Your AI Team</strong> - 1:00 PM PDT</li>
            <li><strong>Fundraising for AI Startups</strong> - 2:30 PM PDT</li>
        </ul>
        
        <h3>📍 Venue Information</h3>
        <p><strong>Location:</strong> Y Combinator, Mountain View, CA</p>
        <p><strong>Address:</strong> 335 Pioneer Way, Mountain View, CA 94041</p>
        
        <div class="dynamic-content">
            <p><strong>Updated Parking Info:</strong> Lot {{PARKING_LOT}} is now available with {{PARKING_SPOTS}} spots remaining.</p>
        </div>
        
        <h3>🔗 Important Links</h3>
        <ul>
            <li><a href="#session1">Session Materials</a></li>
            <li><a href="#networking">Networking Guide</a></li>
            <li><a href="#resources">Additional Resources</a></li>
        </ul>
        
        <div class="dynamic-content">
            <h4>⚡ Live Update</h4>
            <p>Current attendee count: <strong>{{ATTENDEE_COUNT}}</strong> registered participants</p>
            <p>WiFi Password: <strong>AISus{{WIFI_CODE}}</strong></p>
        </div>
    </div>
</body>
</html>
`;

function generateRandomContent() {
    const sessions = ['A', 'B', 'C', 'D', 'E'];
    const times = ['3:00 PM PDT', '3:30 PM PDT', '4:00 PM PDT', '4:30 PM PDT', '5:00 PM PDT'];
    const speakers = ['Dr. Sarah Chen', 'Mike Rodriguez', 'Alex Kim', 'Prof. Lisa Wang', 'David Thompson'];
    const lots = ['A', 'B', 'C', 'Premium'];
    
    return {
        counter: counter,
        timestamp: new Date().toLocaleString(),
        randomSession: sessions[Math.floor(Math.random() * sessions.length)],
        randomTime: times[Math.floor(Math.random() * times.length)],
        randomSpeaker: speakers[Math.floor(Math.random() * speakers.length)],
        parkingLot: lots[Math.floor(Math.random() * lots.length)],
        parkingSpots: Math.floor(Math.random() * 50) + 10,
        attendeeCount: Math.floor(Math.random() * 200) + 150,
        wifiCode: Math.floor(Math.random() * 9000) + 1000
    };
}

app.get('/page', (req, res) => {
    const data = generateRandomContent();
    
    let content = baseContent
        .replace(/\{\{COUNTER\}\}/g, data.counter)
        .replace(/\{\{TIMESTAMP\}\}/g, data.timestamp)
        .replace(/\{\{RANDOM_SESSION\}\}/g, data.randomSession)
        .replace(/\{\{RANDOM_TIME\}\}/g, data.randomTime)
        .replace(/\{\{RANDOM_SPEAKER\}\}/g, data.randomSpeaker)
        .replace(/\{\{PARKING_LOT\}\}/g, data.parkingLot)
        .replace(/\{\{PARKING_SPOTS\}\}/g, data.parkingSpots)
        .replace(/\{\{ATTENDEE_COUNT\}\}/g, data.attendeeCount)
        .replace(/\{\{WIFI_CODE\}\}/g, data.wifiCode);
    
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
            <a href="/page" class="link">📄 Dynamic Test Page (updates every 2 minutes)</a>
            <a href="/static/v1" class="link">📄 Static Test Page v1</a>
            
            <h3>Instructions:</h3>
            <ol>
                <li>Use <code>http://localhost:8080/page</code> as your target URL in the extension</li>
                <li>Set polling cadence to 1-2 minutes for faster testing</li>
                <li>Watch for notifications as the page content changes</li>
            </ol>
            
            <p><em>Server running on port ${PORT}</em></p>
        </body>
        </html>
    `);
});

setInterval(() => {
    counter++;
    lastUpdate = Date.now();
    console.log(`Content updated - Counter: ${counter}, Time: ${new Date().toLocaleString()}`);
}, 120000); // Update every 2 minutes

console.log(`🚀 AI SUS Watcher dev server starting on http://localhost:${PORT}`);
console.log('📄 Test page available at: http://localhost:8080/page');
console.log('⏱️  Page content updates every 2 minutes');

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});