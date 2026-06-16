const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("macropad", {
    listPorts: () => ipcRenderer.invoke("list-ports"),

    connect: (portPath) => ipcRenderer.invoke("connect", portPath),

    sendCommand: (command) => ipcRenderer.invoke("send-command", command),

    disconnect: () => ipcRenderer.invoke("disconnect"),

    onSerialData: (callback) =>
        ipcRenderer.on("serial-data", (_event, data) => callback(data))
});