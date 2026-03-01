const express = require('express');
const path = require('path');

const app = express();
const PORT = 3131;

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'WebContainer server is running' });
});

// API endpoint for testing
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Hello from WebContainer!',
        timestamp: new Date().toISOString(),
        environment: process.versions
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📦 Serving static files from ${__dirname}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🔍 Test API: http://localhost:${PORT}/api/test`);
});