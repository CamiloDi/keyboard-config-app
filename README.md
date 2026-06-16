# Keyboard Config App

Desktop configurator for a custom Arduino Pro Micro macropad.

Keyboard Config App is an Electron application that connects to a custom keyboard over a serial port and lets you configure button names, key sequences, and the active operating-system profile without reflashing the firmware.

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Serial Protocol](#serial-protocol)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Build](#build)
- [Notes](#notes)

## About

This project was built for a custom macropad/keyboard based on an Arduino Pro Micro. The app provides a simple desktop UI for selecting the Arduino serial port, reading the current configuration, editing button actions, and saving those changes back to the device.

The application supports two OS profiles:

- `MAC`
- `WINDOWS`

Each profile can store independent button sequences, depending on how the firmware handles the received commands.

## Features

- Serial communication with Arduino-compatible boards.
- Port discovery from the desktop app.
- Configurable buttons from `BTN1` to `BTN7`.
- Optional display name per button.
- Custom key sequences such as `CMD+C`, `CMD+V`, or `CMD+SHIFT+B,DOWN,UP,ENTER`.
- OS profile selection for macOS and Windows shortcuts.
- Live log of commands sent to the device and responses received from the firmware.
- Default configuration restore command.
- Unit tests with Jest.
- Desktop packaging with Electron Builder.

## Tech Stack

- [Electron](https://www.electronjs.org/) for the desktop application.
- [serialport](https://serialport.io/) for USB serial communication.
- [Jest](https://jestjs.io/) for unit testing.
- [Electron Builder](https://www.electron.build/) for distributable builds.

## Requirements

- Node.js and npm.
- Arduino Pro Micro or compatible board.
- Compatible firmware flashed on the board.
- USB cable with data support.

The app expects the firmware to communicate over serial at `9600` baud.

## Getting Started

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd keyboard-config-app
npm install
```

Run the app in development mode:

```bash
npm start
```

## Usage

1. Connect the Arduino Pro Micro/macropad by USB.
2. Open the app with `npm start`.
3. Click `Actualizar puertos`.
4. Select the Arduino serial port.
5. Click `Conectar`.
6. Select the target OS profile: `MAC` or `WINDOWS`.
7. Edit the name and key sequence for each button.
8. Click `Guardar` on the button row you want to save.

When the app connects, it automatically requests the current configuration from the device using the selected OS profile.

## Serial Protocol

The app and firmware communicate through newline-terminated serial messages.

### Commands Sent By The App

```text
LIST <MAC|WINDOWS>
OS <MAC|WINDOWS>
NAME <BTN_ID> <name>
SET <BTN_ID> <sequence>
SAVE
DEFAULTS
```

Examples:

```text
LIST MAC
OS MAC
NAME BTN1 Copy
SET BTN1 CMD+C
SAVE
```

### Responses Expected From The Firmware

The app updates the selected OS when it receives:

```text
OS=MAC
OS=WINDOWS
```

The app updates button fields when it receives lines in this format:

```text
<BTN_ID>|<name>|<sequence>
```

Examples:

```text
BTN1|Copy|CMD+C
BTN2|Paste|CMD+V
BTN3|Meeting mute|CMD+SHIFT+M
```

Lines that do not start with `OS=` or `BTN` are shown in the log but are not parsed as configuration.

## Available Scripts

Start the Electron app:

```bash
npm start
```

Run unit tests and coverage:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Build distributables:

```bash
npm run dist
```

Build for macOS:

```bash
npm run dist:mac
```

Build for Windows:

```bash
npm run dist:win
```

Build for macOS, Windows, and Linux:

```bash
npm run dist:all
```

## Testing

Tests are located in `__tests__/`.

```bash
npm test
```

Current test coverage includes:

- Forwarding serial messages from Electron's main process to renderer windows.
- Rendering the default button rows.
- Parsing Arduino configuration lines.
- Listing serial ports in the UI.

Expected result:

```text
Test Suites: 2 passed, 2 total
Tests: 4 passed, 4 total
```

## Project Structure

```text
.
|-- main.js              # Electron main process and serial IPC handlers
|-- preload.js           # Safe renderer API exposed through contextBridge
|-- renderer.js          # UI logic and Arduino command flow
|-- index.html           # Application interface
|-- assets/              # Application icons
|-- __tests__/           # Unit tests
|-- package.json         # Scripts, dependencies, and build config
`-- package-lock.json
```

## Build

The project uses Electron Builder. Generated distributables are written to `dist/`.

```bash
npm run dist
```

Configured targets:

- macOS: `dmg`, `zip`
- Windows: `nsis`

## Notes

- The renderer process does not access Node.js directly.
- `contextIsolation` is enabled and `nodeIntegration` is disabled.
- The safe frontend API is exposed as `window.macropad` from `preload.js`.
- Serial communication is handled in `main.js`.
- Incoming Arduino lines are forwarded to the renderer through the `serial-data` IPC channel.

