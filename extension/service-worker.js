console.log('code in service-worker.js');
chrome.runtime.onInstalled.addListener(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = () => {
        reload();
    };
    setInterval(() => {
        ws.send('keep alive');
    }, 20 * 1000);
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "reload-extensions") {
        reload();
    }
});

let lock = false;

async function reload() {
    if (lock) {
        return;
    }
    lock = true;
    console.log('Reload all installed extensions(except self)');
    const self = await chrome.management.getSelf();
    const extensions = await chrome.management.getAll();
    console.log(self);
    console.log(extensions);
    for (let i = 0; i < extensions.length; i++) {
        const id = extensions[i].id;
        if (id === self.id) {
            console.log('Skip my self');
        } else {
            console.log(`Reload extension: ${id}`);
            await chrome.management.setEnabled(id, false);
            await chrome.management.setEnabled(id, true);
        }
    }
    setTimeout(() => {
        lock = false;
    }, 1000);
}
