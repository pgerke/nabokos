const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800, 
    height: 600,
    webPreferences: {
      contextIsolation: true
    }
  });

  // load the dist folder from Angular
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // The following is optional and will open the DevTools:
  // win.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// only a single instance of the application can be started at the same time.
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.allowRendererProcessReuse = true;
app.on('ready', createWindow);

// on macOS, closing the window doesn't quit the app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// initialize the app's main window
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
