jest.resetModules();

test('sendToRenderer forwards messages to all windows', () => {
  const sendMock = jest.fn();
  const fakeWin = { webContents: { send: sendMock } };

  jest.doMock('electron', () => ({
    app: { whenReady: () => Promise.resolve() },
    BrowserWindow: { getAllWindows: () => [fakeWin] },
    ipcMain: { handle: jest.fn() }
  }));

  const main = require('../main.js');

  expect(typeof main.sendToRenderer).toBe('function');

  main.sendToRenderer('serial-data', 'hello');

  expect(sendMock).toHaveBeenCalledWith('serial-data', 'hello');
});
