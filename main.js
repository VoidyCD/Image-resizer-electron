const path = require('path')
const os = require('os')
const fs = require('fs')
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron')

const isDev = process.env.NODE_EV !== 'production'
const isMac = process.platform === 'darwin'

let mainWindow;

//* Create main window
function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Reizer',
        width: isDev ? 1000: 500,
        height: 600,
        webPreferences: {
            contextIsolation: true, 
            nodeIntegration: true,
            //? These 2 are needed for some reason since we just node modules

            preload: path.join(__dirname, 'preload.js'),
          },
          //! Attaching our script to the preload.js file :)
    });

    //* Open Dev tools if in developer enviroment
    if(isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.loadFile(path.join(__dirname, './renderer/index.html')) ;
}


//* Create 'about' window
function createAboutWindow() {
    const aboutWindow = new BrowserWindow({
        title: 'About Image Reizer',
        width: 300,
        height: 300
    });



    aboutWindow.loadFile(path.join(__dirname, './renderer/about.html')) ;
}

//* App is ready

app.whenReady().then(() => {
    createMainWindow();

    //! Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //! Remove main window from memory on close.
    mainWindow.on('closed', () => (mainWindow = null))

    app.on('activate', () =>  {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});




//* Menu template
// const menu = [
//     {
//         label: 'File',
//         submenu: [{
//             label: 'Quit',
//             click: () => app.quit(),
//             accelerator: "Alt+F4"
//         }]
//     }
// ]

//? Better to use: role: 'fileMenu'

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }] //* Mac is a pain in the ass
    }] : []),
    {
        role: 'fileMenu',
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow
        }]
    }] : [])
]

//* Respond to ipcRenderer Resize.
ipcMain.on('image:resize', (e,options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    // console.log(options)
    resizeImage(options)
})

async function resizeImage({ imgPath, width, height, dest }) {
    try {
      const newPath = await resizeImg(fs.readFileSync(imgPath), {
        width: +width, //* the + sign converts our width into an int
        height: +height
      });
      
      //* Creating file name
      const filename = path.basename(imgPath) // yes  

      //* Create a dest folder if its not there.
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
      }

      //* Write the file to dest.
      fs.writeFileSync(path.join(dest, filename), newPath)

      //* send success to render.
      mainWindow.webContents.send('image:done')

      //* Open dest folder 
      shell.openPath(dest);
    } catch (error) {
        console.log(error)
    }
}

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})