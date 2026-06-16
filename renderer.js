const buttonsContainer = document.getElementById("buttons");
const logBox = document.getElementById("log");

// const defaultButtons = [
//     { id: "BTN1", name: "TeamsMute", sequence: "CMD+SHIFT+M" },
//     { id: "BTN2", name: "DiscordMute", sequence: "CTRL+CMD+SHIFT+1" },
//     { id: "BTN3", name: "DiscordDeafen", sequence: "CTRL+CMD+SHIFT+2" },
//     { id: "BTN4", name: "DiscordLeave", sequence: "CTRL+CMD+SHIFT+0" },
//     { id: "BTN5", name: "Copy", sequence: "CMD+C" },
//     { id: "BTN6", name: "Paste", sequence: "CMD+V" },
//     { id: "BTN7", name: "SoundJoin", sequence: "CMD+SHIFT+B,DOWN,UP,ENTER" }
// ];

const defaultButtons = [
    { id: "BTN1" },
    { id: "BTN2" },
    { id: "BTN3" },
    { id: "BTN4" },
    { id: "BTN5" },
    { id: "BTN6" },
    { id: "BTN7" }
];

function log(message) {
    logBox.textContent += message + "\n";
    logBox.scrollTop = logBox.scrollHeight;
}

function createButtonRows() {
    buttonsContainer.innerHTML = "";

    for (const btn of defaultButtons) {
        const row = document.createElement("div");
        row.className = "row";

        row.innerHTML = `
      <div class="btn-id">${btn.id}</div>

      <input
        class="name"
        data-btn="${btn.id}"
        value=""
        placeholder="Nombre"
      />

      <input
        class="sequence"
        data-btn="${btn.id}"
        value=""
        placeholder="Ej: CMD+SHIFT+B,DOWN,UP,ENTER"
      />

      <button data-action="save" data-btn="${btn.id}">
        Guardar
      </button>
    `;

        buttonsContainer.appendChild(row);
    }
}

function selectedOS() {
    return document.getElementById("os").value;
}

async function refreshPorts() {
    const portsSelect = document.getElementById("ports");
    portsSelect.innerHTML = "";

    const ports = await window.macropad.listPorts();

    for (const port of ports) {
        const option = document.createElement("option");
        option.value = port.path;
        option.textContent = port.manufacturer == 'Arduino LLC' ? 'Mega Keyboard' : `${port.path} ${port.manufacturer || ""}`;
        portsSelect.appendChild(option);
    }

    log(`Puertos encontrados: ${ports.length}`);
}

async function connect() {
    const port = document.getElementById("ports").value;

    if (!port) {
        log("No hay puerto seleccionado");
        return;
    }

    await window.macropad.connect(port);

    log(`Conectado a ${port}`);

    await send(`LIST ${selectedOS()}`);
}

async function disconnect() {
    await window.macropad.disconnect();
    log("Desconectado");
}

async function send(command) {
    await window.macropad.sendCommand(command);
    log(`Enviado: ${command}`);
}

async function saveButton(btnId) {
    const os = selectedOS();

    const nameInput = document.querySelector(`input.name[data-btn="${btnId}"]`);
    const sequenceInput = document.querySelector(`input.sequence[data-btn="${btnId}"]`);

    const name = nameInput.value.trim();
    const sequence = sequenceInput.value.trim();

    if (!sequence) {
        log(`Secuencia vacía para ${btnId}`);
        return;
    }

    await send(`OS ${os}`);

    if (name) {
        await send(`NAME ${btnId} ${name}`);
    }

    await send(`SET ${btnId} ${sequence}`);
    await send("SAVE");
    await send(`LIST ${os}`);
}

function parseArduinoConfig(line) {
    if (line.startsWith("OS=")) {
        const os = line.replace("OS=", "").trim();

        const osSelect = document.getElementById("os");

        if (os === "MAC" || os === "WINDOWS") {
            osSelect.value = os;
        }

        return;
    }

    if (!line.startsWith("BTN")) {
        return;
    }

    const parts = line.split("|");

    if (parts.length < 3) {
        return;
    }

    const btnId = parts[0];
    const btnName = parts[1];
    const sequence = parts.slice(2).join("|");

    const nameInput = document.querySelector(`input.name[data-btn="${btnId}"]`);
    const sequenceInput = document.querySelector(`input.sequence[data-btn="${btnId}"]`);

    if (nameInput) {
        nameInput.value = btnName;
    }

    if (sequenceInput) {
        sequenceInput.value = sequence;
    }
}

window.macropad.onSerialData((line) => {
    log("Arduino: " + line);
    parseArduinoConfig(line);
});

document.getElementById("refreshPorts").addEventListener("click", refreshPorts);
document.getElementById("connect").addEventListener("click", connect);
document.getElementById("disconnect").addEventListener("click", disconnect);

document.getElementById("saveOs").addEventListener("click", async () => {
    const os = selectedOS();

    await send(`OS ${os}`);
    await send("SAVE");
    await send(`LIST ${os}`);
});

document.getElementById("os").addEventListener("change", async () => {
    const os = selectedOS();

    await send(`OS ${os}`);
    await send(`LIST ${os}`);
});

document.getElementById("listConfig").addEventListener("click", async () => {
    await send(`LIST ${selectedOS()}`);
});

document.getElementById("defaults").addEventListener("click", async () => {
    await send("DEFAULTS");
    await send(`LIST ${selectedOS()}`);
});

buttonsContainer.addEventListener("click", async (event) => {
    const target = event.target;

    if (target.dataset.action === "save") {
        await saveButton(target.dataset.btn);
    }
});

createButtonRows();
refreshPorts();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseArduinoConfig,
        createButtonRows,
        selectedOS,
        log,
        refreshPorts,
        saveButton,
        connect,
        disconnect,
        send,
        defaultButtons
    };
}