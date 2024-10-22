import express, { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import fs from 'fs';
import path from 'path';

// Create Express app
const app = express();
const PORT = 3000;

// Create proxy server
const proxy = httpProxy.createProxyServer({});

// Log files path
const searchLogsPath = path.join(__dirname, '../logs/Search Logs.txt');
const errorLogsPath = path.join(__dirname, '../logs/Recent Error Logs.txt');

// Middleware to log user searches
app.use((req: Request, res: Response, next) => {
    const searchLog = `[${new Date().toISOString()}] Search URL: ${req.url}\n`;
    fs.appendFileSync(searchLogsPath, searchLog, 'utf8');
    next();
});

// Serve the homepage
app.get('/', (req: Request, res: Response) => {
    res.send(`
        <html>
            <head>
                <title>Proxy Service</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #101820FF; color: #FEE715FF; }
                    h1 { color: #FEE715FF; }
                    input, button { padding: 10px; margin: 10px; font-size: 16px; }
                </style>
            </head>
            <body>
                <h1>Welcome to the Proxy Service</h1>
                <form method="GET" action="/proxy">
                    <input type="text" name="url" placeholder="Enter URL to proxy" required>
                    <button type="submit">Proxy</button>
                </form>
            </body>
        </html>
    `);
});

// Proxy request handler
app.get('/proxy', (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl) {
        return res.status(400).send('URL is required');
    }

    proxy.web(req, res, { target: targetUrl }, (err) => {
        const errorLog = `[${new Date().toISOString()}] Error: ${err.message}\n`;
        fs.appendFileSync(errorLogsPath, errorLog, 'utf8');
        res.status(500).send('Error occurred while proxying the request.');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
