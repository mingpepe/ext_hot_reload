const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

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

const manifestPath = path.join(targetPath, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log(`${manifestPath} does not exist`);
  process.exit();
}

const data = fs.readFileSync(manifestPath, 'utf8');
const json = JSON.parse(data);
const name = json.name;

if (!name) {
  console.log(`${manifestPath} does not contain 'name'`);
  process.exit();
}

fs.watch(targetPath, { recursive: true }, (eventType, filename) => {
  if (eventType === 'change') {
    console.log(`file changed: ${filename}`);
    if (filename === 'manifest.json') {
      console.log('Warn: if you change name of the extension, this hot reload will not work');
    }
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(name);
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
