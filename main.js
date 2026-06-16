const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let port = null;
let parser = null;

function sendToRenderer(channel, payload) {
    BrowserWindow.getAllWindows().forEach((win) => {
        win.webContents.send(channel, payload);
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 900,
        height: 720,
        icon: path.join(__dirname, "assets/icon.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    win.loadFile("index.html");
}

if (require.main === module) {
    app.whenReady().then(createWindow);
}

ipcMain.handle("list-ports", async () => {
    return await SerialPort.list();
});

ipcMain.handle("connect", async (_event, portPath) => {
    if (port && port.isOpen) {
        port.close();
    }

    port = new SerialPort({
        path: portPath,
        baudRate: 9600
    });

    parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

    parser.on("data", (line) => {
        const clean = line.trim();

        console.log("Arduino:", clean);
        sendToRenderer("serial-data", clean);
    });

    return new Promise((resolve, reject) => {
        port.on("open", () => {
            setTimeout(() => {
                resolve(true);
            }, 1200);
        });

        port.on("error", reject);
    });
});

ipcMain.handle("send-command", async (_event, command) => {
    if (!port || !port.isOpen) {
        throw new Error("No hay puerto conectado");
    }

    port.write(command + "\n");

    return true;
});

ipcMain.handle("disconnect", async () => {
    if (port && port.isOpen) {
        port.close();
    }

    port = null;
    parser = null;

    return true;
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendToRenderer
    };
}