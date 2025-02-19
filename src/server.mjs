import http from 'http';
import { createTextEvent, createDoneEvent } from '@copilot-extensions/preview-sdk';

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Hello, World!\n');
    } else {
        res.write(createTextEvent('Hello, World!'));
        res.write(createDoneEvent());
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});