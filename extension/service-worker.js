console.log('code in service-worker.js');
chrome.runtime.onInstalled.addListener(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (msg) => {
        reload(msg.data);
    };
    setInterval(() => {
        ws.send('keep alive');
    }, 20 * 1000);
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "reload-extensions") {
        reloadAll();
    }
});

let lock = false;

async function reload(name) {
    if (lock) {
        return;
    }
    lock = true;
    console.log(`Reload extension with name = ${name}`);
    const extensions = await chrome.management.getAll();
    let found = false;
    for (let i = 0; i < extensions.length; i++) {
        if (extensions[i].name === name) {
            console.log('Find the target extension, reload it');
            found = true;
            const id = extensions[i].id;
            await chrome.management.setEnabled(id, false);
            await chrome.management.setEnabled(id, true);
            break;
        }
    }
    if (!found) {
        console.log(`Extension with name = ${name} not found`);
    }
    setTimeout(() => {
        lock = false;
    }, 1000);
}

async function reloadAll() {
    if (lock) {
        return;
    }
    lock = true;
    console.log('Reload all extensions');
    const self = await chrome.management.getSelf();
    const extensions = await chrome.management.getAll();
    for (let i = 0; i < extensions.length; i++) {
        if (extensions[i].id === self.id) {
            console.log('Skip my self');
        } else {
            const id = extensions[i].id;
            await chrome.management.setEnabled(id, false);
            await chrome.management.setEnabled(id, true);
        }
    }

    setTimeout(() => {
        lock = false;
    }, 1000);
}
