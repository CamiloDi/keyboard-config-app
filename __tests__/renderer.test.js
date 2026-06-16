/** @jest-environment jsdom */

let renderer;

beforeEach(() => {
  jest.resetModules();
  document.body.innerHTML = `
    <div id="buttons"></div>
    <pre id="log"></pre>
    <select id="os"><option value="MAC">MAC</option><option value="WINDOWS">WINDOWS</option></select>
    <select id="ports"></select>
    <button id="refreshPorts"></button>
    <button id="connect"></button>
    <button id="disconnect"></button>
    <button id="saveOs"></button>
    <button id="listConfig"></button>
    <button id="defaults"></button>
  `;

  // Provide a mock macropad API expected by renderer
  window.macropad = {
    listPorts: jest.fn().mockResolvedValue([{ path: '/dev/ttyUSB0', manufacturer: 'Arduino LLC' }, { path: '/dev/ttyS1', manufacturer: 'Other' }]),
    connect: jest.fn().mockResolvedValue(true),
    disconnect: jest.fn().mockResolvedValue(true),
    sendCommand: jest.fn().mockResolvedValue(true),
    onSerialData: (cb) => { window._onSerial = cb; }
  };

  // require renderer after DOM and mocks are ready so its initial calls run here
  renderer = require('../renderer.js');
});

test('createButtonRows inserts default rows', () => {
  renderer.createButtonRows();

  const rows = document.querySelectorAll('#buttons .row');
  expect(rows.length).toBe(renderer.defaultButtons.length);

  const firstNameInput = document.querySelector('input.name[data-btn="BTN1"]');
  expect(firstNameInput).not.toBeNull();
});

test('parseArduinoConfig sets OS and button inputs', () => {
  // ensure rows exist
  renderer.createButtonRows();

  renderer.parseArduinoConfig('OS=MAC');
  expect(document.getElementById('os').value).toBe('MAC');

  // Simulate BTN line
  renderer.parseArduinoConfig('BTN1|MyName|CMD+V');
  const name = document.querySelector('input.name[data-btn="BTN1"]').value;
  const seq = document.querySelector('input.sequence[data-btn="BTN1"]').value;

  expect(name).toBe('MyName');
  expect(seq).toBe('CMD+V');
});

test('refreshPorts populates ports and logs count', async () => {
  // wait for initial async refreshPorts call in renderer
  await new Promise((r) => setTimeout(r, 0));

  const ports = document.querySelectorAll('#ports option');
  expect(ports.length).toBe(2);

  expect(document.getElementById('log').textContent).toContain('Puertos encontrados: 2');
});
