const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const db = require('./db');

function createWindow() {
  const win = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    title: 'Farm Admin',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('db:list', (_e, entity) => db.list(entity));
ipcMain.handle('db:create', (_e, entity, data) => db.create(entity, data));
ipcMain.handle('db:update', (_e, entity, id, data) => db.update(entity, id, data));
ipcMain.handle('db:remove', (_e, entity, id) => db.remove(entity, id));
ipcMain.handle('db:stats', () => db.stats());
