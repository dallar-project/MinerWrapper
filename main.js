
const pathWinCcminerX86 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x86-2.2.3-cuda9.7z';
const pathWinCcminerX64 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x64-2.2.3-cuda9.7z';
var ccminerPath = '';

const electron = require('electron');
const url = require('url');
const path = require('path');
const si = require('systeminformation');
const fs = require('fs');
const request = require('request');
const nrc = require('node-run-cmd');

const app = electron.app;
const { BrowserWindow, Menu, ipcMain} = electron;

// mining var

var miningUser = ' -u bf-az.donate'
var miningPool = ' -o stratum+tcp://us-east.stratum.slushpool.com:3333';
var miningAlgo = ' -a sha256';

//system var
global.sysGpuVendor ='';
global.sysPlatform = '';
global.sysPlatformArch = '';


// SET ENV
process.env.NODE_ENV = 'Dev';//production

let mainWindow,addWindow;
let { zip, unzip } = require('cross-unzip');
console.log(require.resolve('electron'));

//listen for app to be ready
app.on('ready', function(){
    //load system
    //init Main Winodw
    createMainWindow();

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);

    //get CCminer
    //downloadFromInternet(pathWinCcminerX86,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
    
    //initiate getting SystemStat data
    setTimeout(getSystemStats, 1000);
    setTimeout(getSystemInfo, 1000);
    setTimeout(initialSetup, 3000);
});

function initialSetup(){

//set up file structure
    if (!fs.existsSync(__dirname+'/miners/')){
        fs.mkdirSync(__dirname+'/miners/');
    }else
    {
        console.log("Directory already exist");
    }
    if (!fs.existsSync(__dirname+'/miners/ccminer/')){
        fs.mkdirSync(__dirname+'/miners/ccminer/');
    }else
    {
        console.log("Directory already exist");
    }

    //download required miners
    console.log(sysPlatform +' '+ sysGpuVendor +' '+ sysPlatformArch)

    if (sysPlatform == 'Windows'){
        if( sysGpuVendor == 'NVIDIA'){
            if( sysPlatformArch == 'x64'){
                downloadFromInternet(pathWinCcminerX64,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
                ccminerPath = 'ccminer-x64.exe'
            }else if(sysPlatformArch == 'x32'){
                downloadFromInternet(pathWinCcminerX32,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
                ccminerPath = 'ccminer.exe'
            }
        }
    }
    if (sysPlatform == 'Darwin'){//Mac
        
    }
    if (sysPlatform == 'Linux'){
        
    }
}

//Handle create Main Window
function createMainWindow(){
    mainWindow = new BrowserWindow({});//pass in empty object {} cause no configurations
    // load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol:'file:',
        slashes: true
        //file://dirname/mainWindow.html
    })); 
    //quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
}

//Handle  create add window
function createAddWindow(){
    //create new window
    addWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title:'Add item'
    });
    // load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addWindow.html'),
        protocol:'file:',
        slashes: true
    })); 
    //garbage collection handle
    addWindow.on('close', function(){
            addWindow = null;
    });
}
//get system info
function getSystemInfo(){
    si.osInfo()
        .then(data => {
            mainWindow.webContents.send('systemInfoOs', data);
            sysPlatform = data.platform;
            sysPlatformArch = data.arch;
        })
        .catch(error => console.error(error)); 
    
    si.cpu()
        .then(data => {
            mainWindow.webContents.send('systemInfoCpu', data);
        })
        .catch(error => console.error(error)); 
        
    si.graphics(function(data){
        mainWindow.webContents.send('systemInfoGraphics', data);
        sysGpuVendor = data.controllers[0].vendor;
        console.log('GPU = ' +sysGpuVendor);
    });
        
    
    si.networkInterfaces()
        .then(data => {  
            mainWindow.webContents.send('systemInfoNetworkInterfaces', data);
        })
        .catch(error => console.error(error)); 
        
};

function getSystemStats(){
    //keep refreshing 
    setTimeout(getSystemStats, 1000);
    si.currentLoad()
        .then(data => { 
            mainWindow.webContents.send('systemStatsCurrentLoad', data);
        })
        .catch(error => console.error(error)); 
}


//Catch Mining info
ipcMain.on('mining', function(e, miningData){
    console.log(miningData);
    mainWindow.webContents.send('mining', miningData);
    miningUser = miningData[0];
    miningPool = miningData[1];
    miningAlgo = miningData[2];
    addWindow.close();
});
//Catch StartMining Btn
ipcMain.on('startMining', function(e,miningData){
    
    miningUser = miningData[0];
    miningPool = miningData[1];
    miningAlgo = miningData[2];
    miningUserPw = miningData[3];

    console.log('Start Mining ');
    //runs ccminer through CMD
    //console.log(ccminerPath + ' -a '+ miningAlgo +' -o '+ miningPool + ' -u ' + miningUser + ' -p ' + miningUserPw);
    var commands = [
        ccminerPath+miningAlgo+miningPool+miningUser
    ];
    var options = [
        { cwd: __dirname+'/miners/ccminer/', onData: dataCallback ,onError: dataCallback , logger: dataCallback}
    ];
    //async with cmd output data
    var dataCallback = function(data) {
        console.log(data);
    };
    nrc.run('ccminer-x64.exe',{ cwd: __dirname+'/miners/ccminer/', onData: dataCallback });

    
    // nrc.run(commands,options, function(err,stderr) {
    //     console.log('Command failed to run with error: ', err);
    //     console.log('Command failed to run with stderr: ', stderr);
    // });
});

// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[
            {
                label: 'Add item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear items',
                click(){
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'system',
        submenu:[
            {
                label: 'Get System Info',
                click(){
                    getSystemInfo();
                }
            }
        ]
    }
];

//if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',    
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

function downloadFromInternet(url, dest,filename, cb) {
    var file = fs.createWriteStream(dest+filename);
    var sendReq = request.get(url);

    // verify response code
    sendReq.on('response', function(response) {
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }
    });

    // check for request errors
    sendReq.on('error', function (err) {
        fs.unlink(dest);
        return cb(err.message);
    });

    sendReq.pipe(file);

    file.on('finish', function() {
        file.close(cb);  // close() is async, call cb after close completes.
        unzip(dest+filename, dest, err => {
            
            console.log('finished unziping');
            fs.unlink(dest+filename);//remove zip
          })
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};