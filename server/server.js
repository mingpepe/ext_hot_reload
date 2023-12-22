const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
if (process.argv.length != 3) {
  console.log('Usage: node server.js targetPath');
  process.exit();
}
const targetPath = process.argv[2];
if (!fs.existsSync(targetPath)) {
  console.log(`${targetPath} does not exist`);
  process.exit();
}
fs.watch(targetPath, { recursive: true }, (eventType, filename) => {
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
