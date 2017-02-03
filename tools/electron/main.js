const { Menu, app, BrowserWindow } = require('electron')

// Keep a global reference of the window object
let mainWindow

function createWindow()
{
  // Create the browser window
  mainWindow = new BrowserWindow(
  {
    fullscreen: true
  })

  // and load the index.html of the app
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Emitted when the window is closed
  mainWindow.on('closed', function()
  {
    // Dereference the window object
    mainWindow = null
  })

  // Menu template
  const template = [
  {
    submenu: [
    {
      role: 'about'
    },
    {
      type: 'separator'
    },
    {
      role: 'services',
      submenu: []
    },
    {
      type: 'separator'
    },
    {
      role: 'hide'
    },
    {
      role: 'hideothers'
    },
    {
      role: 'unhide'
    },
    {
      type: 'separator'
    },
    {
      role: 'quit'
    }]
  },
  {
    label: 'View',
    submenu: [
    {
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click(item, focusedWindow)
      {
        if (focusedWindow) focusedWindow.reload()
      }
    },
    {
      label: 'Toggle Developer Tools',
      accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
      click(item, focusedWindow)
      {
        if (focusedWindow) focusedWindow.webContents.toggleDevTools()
      }
    },
    {
      type: 'separator'
    },
    {
      role: 'resetzoom'
    },
    {
      role: 'zoomin'
    },
    {
      role: 'zoomout'
    },
    {
      type: 'separator'
    },
    {
      role: 'togglefullscreen'
    }]
  },
  {
    role: 'window',
    submenu: [
    {
      role: 'minimize'
    },
    {
      role: 'close'
    }]
  }];

  // Create a menu from the template
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function()
{
  app.quit()
})

app.on('activate', function()
{
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null)
  {
    createWindow()
  }
})