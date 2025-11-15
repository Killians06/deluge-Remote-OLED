const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let streamServerProcess;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icons/icon-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: false,
    },
    backgroundColor: '#09090b',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About DEx',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/yourusername/deluge-extensions');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startStreamServer() {
  if (isDev) {
    console.log('Stream server should be started separately in dev mode');
    return;
  }

  const serverPath = path.join(__dirname, '../dist-server/streamServer.js');
  
  try {
    streamServerProcess = spawn('node', [serverPath], {
      stdio: 'inherit',
      env: { ...process.env }
    });

    streamServerProcess.on('error', (err) => {
      console.error('Failed to start stream server:', err);
    });

    streamServerProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Stream server exited with code ${code}`);
      }
    });
  } catch (err) {
    console.error('Error starting stream server:', err);
  }
}

app.whenReady().then(() => {
  createWindow();
  startStreamServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (streamServerProcess) {
    streamServerProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (streamServerProcess) {
    streamServerProcess.kill();
  }
});
