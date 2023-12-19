const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

fs.watch('..\\extension\\', { recursive: true }, (eventType, filename) => {
  if (eventType === 'change') {
    console.log('file changed');
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('File changed: ' + filename);
      }
    });
  }
});

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
