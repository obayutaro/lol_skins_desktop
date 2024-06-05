const { app, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const kill = require('tree-kill');

let pythonProcess;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 844,
    icon: path.join(__dirname, './lol_skin_icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  console.log('Creating window...');
  mainWindow.loadURL('http://localhost:5555');

  // メニューバーを削除
  Menu.setApplicationMenu(null);

  // Pythonスクリプトを実行
  const pythonScriptPath = path.join(__dirname, 'application.py');
  pythonProcess = spawn('python', [pythonScriptPath], { cwd: __dirname });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
  });

  // Pythonサーバーが起動するのを待つ
  const checkServer = () => {
    console.log('Checking if server is up...');
    const client = net.createConnection({ port: 5555 }, () => {
      console.log('Server is up, loading URL...');
      client.end();
      mainWindow.loadURL('http://localhost:5555');
    });

    client.on('error', (err) => {
      console.log('Server is not up, retrying...');
      setTimeout(checkServer, 1000);
    });
  };

  checkServer();

  // アプリケーション終了時にPythonプロセスも終了
  mainWindow.on('closed', () => {
    if (pythonProcess) {
      kill(pythonProcess.pid, 'SIGKILL');
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (pythonProcess) {
    kill(pythonProcess.pid, 'SIGKILL');
  }
  if (process.platform !== 'darwin') app.quit();
});
