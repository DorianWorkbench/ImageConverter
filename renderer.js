const {ipcRenderer} = require("electron");
const { dialog } = require('electron').remote

const btn = document.getElementById('chooseFolder');
const validate = document.getElementById('validate');
const checkbox = document.getElementById('blackNwhite')
validate.addEventListener('click', async function (){

        const res = document.querySelector("#resolutionSelect");
        const folderLink = document.querySelector("#pathFinder");

        // C'est vraiment pas beau pour le coup mais ça fonctionne.
        if(folderLink.innerText && (res.value !== "" || checkbox.checked)){
            dialog.showMessageBox({
                title: "Confirmation",
                message: "Voulez vous vraiment resize vos images ?",
                buttons: [
                    "Oui",
                    "Non"
                ]
            }).then((resm)=>{
                console.log("res");
                console.log(resm.response);
                if(checkbox.checked && resm.response === 0){
                    console.log("checked");
                    ipcRenderer.send("generateBlackNWhite")
                    return
                }
                if(resm.response === 0){
                    ipcRenderer.send("generateRezisedImg", {value:res.value});
                }else{
                    res.value = "";
                    folderLink.innerText = "";
                    checkbox.checked = false;
                }
            });
        }else{
            await dialog.showMessageBox(
                {
                    title: "Erreur",
                    message: "Vous n'avez pas renseigné la résolution ou le chemin d'accès"
                }
            );
        }
});

btn.addEventListener('click', function () {
    const pathFinder = document.querySelector('#pathFinder').style.display = 'block';
    ipcRenderer.send("fetchRepository", "chemin d'accès");
});

ipcRenderer.on("getRepositoryPath", function (event, args){
    document.querySelector('#pathFinder').textContent = args;
});
