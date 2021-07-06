const {app, BrowserWindow, ipcMain, dialog} = require("electron");
const fs = require("fs");
const sharp = require("sharp");
const dirName = "rezised";
const jsonStorage = "params.json";

function createWindow(){
    const win = new BrowserWindow({
        width:800,
        height:600,
        webPreferences:{
            nodeIntegration: true,
            contextIsolation:false,
            enableRemoteModule: true
        }
    });
    win.loadFile("mainPage.html");

    ipcMain.on("fetchRepository", function(event, args){
        let dir = dialog.showOpenDialog({
            title: "Choisissez votre dossier d'images",
            defaultPath: "C:\\Users",
            buttonLabel: "Selectionner ce dossier",
            properties:["openDirectory"]
        }).then((path)=>{

            if(fs.existsSync(jsonStorage)){
               fs.unlinkSync(jsonStorage);
            }

            fs.writeFileSync(jsonStorage,JSON.stringify({imgPath:path.filePaths[0]}),function (err){
                if(err){
                    return console.log(err);
                }
            });
            win.webContents.send("getRepositoryPath", path.filePaths);
        });
    });

    ipcMain.on("generateRezisedImg", function (event, args){
        const size = args.value.split("*");
        const rawData = fs.readFileSync(jsonStorage, "utf-8");
        const imagePath = JSON.parse(rawData).imgPath;

        const files = fs.readdirSync(imagePath);

        if(!fs.existsSync(imagePath+"\\"+dirName)){
            fs.mkdirSync(imagePath+"\\"+dirName);
        }

        files.forEach((elem, idx)=>{
            let pathImg = imagePath+"\\"+elem;

            sharp(pathImg)
                .resize(parseInt(size[0]), parseInt(size[1]))
                .toFile(imagePath+"\\"+dirName+'\\image'+idx+'.jpg');
        });
    });
}

app.whenReady().then(()=>{
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
