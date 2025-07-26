import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  //win.webContents.openDevTools();
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('fs:readdir', async (event, dirPath) => {
  try {
    return await fs.promises.readdir(dirPath);
  } catch (e) {
    return null;
  }
});
ipcMain.handle('fs:existsSync', async (event, filePath) => {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
});
ipcMain.handle('fs:mkdirSync', async (event, dirPath) => {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle('fs:writeFileSync', async (event, filePath, content) => {
  try {
    await fs.promises.writeFile(filePath, content);
    return true;
  } catch (e) {
    return false;
  }
});
ipcMain.handle('path:join', async (event, ...args) => {
  return path.join(...args);
});
ipcMain.handle('path:basename', async (event, p, ext) => {
  return path.basename(p, ext);
});
ipcMain.handle('path:extname', async (event, p) => {
  return path.extname(p);
});