const { app, BrowserWindow, Menu } = require('electron')
const { exec } = require('child_process')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 844,
    icon: path.join(__dirname, './lol_skin_icon.ico'), 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadURL('http://localhost:5000')

  // メニューバーを削除
  Menu.setApplicationMenu(null)

  exec('python application.py', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`)
      return
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`)
      return
    }
    console.log(`Stdout: ${stdout}`)
  })

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
