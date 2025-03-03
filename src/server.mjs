import http from 'http';
import https from 'https';
import { createTextEvent, createDoneEvent } from '@copilot-extensions/preview-sdk';

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello, World!\n');
    } else if (req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log('Received input:', body);

            // Process the input data as needed
            const inputData = JSON.parse(body);

            // Access messages.content from inputData.message
            const messageContent = inputData.message?.messages?.content;

            if (!messageContent) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Bad Request: Missing messages.content\n');
                return;
            }

            // Example: Use the input data with the custom extension
            const textEvent = createTextEvent(messageContent);
            const doneEvent = createDoneEvent();

            // Make a POST request to another endpoint with the input data
            const postData = messageContent; // Sending plain text

            const options = {
                hostname: 'probable-happiness-975v7rq979rv3xr46-8080.app.github.dev', // Replace with the target hostname
                port: 443, // HTTPS default port
                path: '/api/azure-ai/chat', // Replace with the target path
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // Set content type to text/plain
                    'Content-Length': Buffer.byteLength(postData)
                },
                rejectUnauthorized: false // Bypass SSL certificate validation
            };

            const postReq = https.request(options, (postRes) => {
                let responseData = '';

                postRes.on('data', (chunk) => {
                    responseData += chunk;
                });

                postRes.on('end', () => {
                    console.log('Response from POST request:', responseData);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end(responseData);
                });
            });

            postReq.on('error', (e) => {
                console.error(`Problem with POST request: ${e.message}`);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error\n');
            });

            // Write data to request body
            postReq.write(postData);
            postReq.end();
        });
    } else {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Method Not Allowed\n');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});