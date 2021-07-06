const {app, BrowserWindow, ipcMain, dialog} = require("electron");
const fs = require("fs");
const sharp = require("sharp");
const dirName = "rezised";
const dirNameColor = "colored";
const dirRiziseColor = "coloredRezised";
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
    ipcMain.on("generateBlackNWhite", function (event, args){
        const rawData = fs.readFileSync(jsonStorage, "utf-8");
        const imagePath = JSON.parse(rawData).imgPath;
        if(!fs.existsSync(imagePath+"\\"+dirNameColor)){
            fs.mkdirSync(imagePath+"\\"+dirNameColor);
        }

        const files = fs.readdirSync(imagePath);
        files.forEach((elem, idx)=>{
            // C'est pas la façon la plus optimisé d'éviter l'erreur dans la console mais ça marche
            if(elem.split(".")[1]) {
                let pathImg = imagePath + "\\" + elem;
                sharp(pathImg)
                    .greyscale(true)
                    .toFile(imagePath + "\\" + dirNameColor + '\\image' + idx + '.jpg');
            }
        });
    });
    ipcMain.on("generateResizedBlackNwhite", function (event, args){
        const size = args.value.split("*");
        const rawData = fs.readFileSync(jsonStorage, "utf-8");
        const imagePath = JSON.parse(rawData).imgPath;


        if(!fs.existsSync(imagePath+"\\"+dirRiziseColor)){
            fs.mkdirSync(imagePath+"\\"+dirRiziseColor);
        }
        const files = fs.readdirSync(imagePath);

        files.forEach((elem, idx)=>{
            // C'est pas la façon la plus optimisé d'éviter l'erreur dans la console mais ça marche
            if(elem.split(".")[1]) {
                let pathImg = imagePath + "\\" + elem;
                sharp(pathImg)
                    .resize(parseInt(size[0]), parseInt(size[1]))
                    .greyscale(true)
                    .toFile(imagePath + "\\" + dirRiziseColor + '\\image' + idx+"c" + '.jpg');
            }
        });
    });
    ipcMain.on("generateRezisedImg", function (event, args){
        const size = args.value.split("*");
        const rawData = fs.readFileSync(jsonStorage, "utf-8");
        const imagePath = JSON.parse(rawData).imgPath;


        if(!fs.existsSync(imagePath+"\\"+dirName)){
            fs.mkdirSync(imagePath+"\\"+dirName);
        }
        const files = fs.readdirSync(imagePath);

        files.forEach((elem, idx)=>{
            // C'est pas la façon la plus optimisé d'éviter l'erreur dans la console mais ça marche
            if(elem.split(".")[1]){
                let pathImg = imagePath+"\\"+elem;
                sharp(pathImg)
                    .resize(parseInt(size[0]), parseInt(size[1]))
                    .toFile(imagePath+"\\"+dirName+'\\image'+idx+'.jpg');
            }
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
