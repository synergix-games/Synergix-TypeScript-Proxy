// server.ts

import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

// Home Page HTML for the input
const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Proxy</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #121212;
            color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        input {
            padding: 10px;
            border: none;
            border-radius: 5px;
            width: 300px;
        }
        button {
            padding: 10px 20px;
            background-color: #03a9f4;
            color: white;
            border: none;
            border-radius: 5px;
            margin-top: 10px;
            cursor: pointer;
        }
        button:hover {
            background-color: #0288d1;
        }
    </style>
</head>
<body>
    <h1>Enter a URL to Proxy</h1>
    <form action="/" method="GET">
        <input type="text" name="url" placeholder="Enter a URL" required>
        <button type="submit">Proxy</button>
    </form>
</body>
</html>
`;

// Create the Deno server
const server = serve({ port: 8080 });
console.log("Server running on http://localhost:8080");

for await (const req of server) {
    try {
        const url = new URL(req.url, `http://${req.headers.get("host")}`);
        const targetUrl = url.searchParams.get("url");

        // If no URL provided, show home page
        if (!targetUrl) {
            req.respond({ body: homePage, headers: new Headers({ "Content-Type": "text/html" }) });
            continue;
        }

        // Fetch and proxy the target URL
        const proxiedResponse = await fetch(targetUrl);
        const body = await proxiedResponse.text();
        const headers = new Headers(proxiedResponse.headers);

        req.respond({ body, headers });
    } catch (error) {
        req.respond({ body: "Error fetching the URL", status: 500 });
    }
}
