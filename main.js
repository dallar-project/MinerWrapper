
const pathWinCcminerX86 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x86-2.2.3-cuda9.7z';
const pathWinCcminerX64 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x64-2.2.3-cuda9.7z';
const pathWinCpuMinerX64 = 'https://github.com/tpruvot/cpuminer-multi/releases/download/v1.3.1-multi/cpuminer-multi-rel1.3.1-x64.zip';

var gpuMinerPath = '',cpuMinerPath ='';


const electron = require('electron');
const url = require('url');
const path = require('path');
const si = require('systeminformation');
const fs = require('fs');
const request = require('request');
const nrc = require('node-run-cmd');

const sysOs = require('os');

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
global.sysCpuBrand = '';


// SET ENV
process.env.NODE_ENV = 'Dev';//production

let mainWindow,addWindow;
let { zip, unzip } = require('cross-unzip');

//listen for app to be ready
app.on('ready', function(){
    //load system
    //init Main Winodw
    createMainWindow();

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);

    
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
        console.log("/miners/ Directory already exist");
    }
    if (!fs.existsSync(__dirname+'/miners/ccminer/')){
        fs.mkdirSync(__dirname+'/miners/ccminer/');
    }else
    {
        console.log("/miners/ccminer/ Directory already exist");
    }
    if (!fs.existsSync(__dirname+'/miners/cpuminer/')){
        fs.mkdirSync(__dirname+'/miners/cpuminer/');
    }else
    {
        console.log("/miners/cpuminer/ Directory already exist");
    }
//download required miners

    if (sysPlatform == 'Windows'){
        //GPU
        if (sysGpuVendor == 'NVIDIA'){
            if (sysPlatformArch == 'x64'){

                gpuMinerPath = 'ccminer-x64.exe';
                
                if (!fs.existsSync(__dirname+'/miners/ccminer/'+gpuMinerPath))
                    downloadFromInternet(pathWinCcminerX64,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
            }
            else if(sysPlatformArch == 'x32'){
                
                gpuMinerPath = 'ccminer.exe';
                
                if (!fs.existsSync(__dirname+'/miners/ccminer/'+gpuMinerPath))
                    downloadFromInternet(pathWinCcminerX32,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
            }
        }
        else if (sysGpuVendor == 'AMD'){
            //load AMD miner here
        }
        //CPU 
        if ( sysPlatformArch == 'x64' || sysPlatformArch == 'x86') {
            if ( sysCpuBrand.includes('Core',0) && sysCpuBrand.includes('i7',0))
                cpuMinerPath = 'cpuminer-gw64-corei7.exe';
            else if ( sysCpuBrand.includes('Core',0) && sysCpuBrand.includes('2',0))
                cpuMinerPath = 'cpuminer-gw64-corei7.exe';
            else
                cpuMinerPath = 'cpuminer-gw64-avx2.exe';
            
            if (!fs.existsSync(__dirname+'/miners/cpuminer/'+cpuMinerPath))    
                downloadFromInternet(pathWinCpuMinerX64,__dirname+'/miners/cpuminer/','cpuminer.7z');//unzips
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
            global.sysCpuBrand = data.brand;
            //console.log(sysOs.cpus());
        })
        .catch(error => console.error(error)); 
        
    si.graphics(function(data){
        mainWindow.webContents.send('systemInfoGraphics', data);
        sysGpuVendor = data.controllers[0].vendor;
        //console.log('GPU = ' +sysGpuVendor);
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
    si.cpuTemperature()
        .then(data => { 
            mainWindow.webContents.send('systemStatsCpuTemp', data);
            //console.log(data);
        })
        .catch(error => console.error(error)); 
}



//Catch StartMining Btn
ipcMain.on('startMining', function(e,miningData){
    
    miningUser = miningData[0];
    miningPool = miningData[1];
    miningAlgo = miningData[2];
    miningUserPw = miningData[3];
    const miningDevice = miningData[4];
    const cpuCoreSlider = miningData[5];

    console.log('Start Mining ');
    //runs ccminer through CMD
    

    console.log(miningData);

    //async with cmd output data
    var dataCallback = function(data) {
        console.log(data);
    };
    
    if ( miningDevice == 'GPU'){
        console.log(__dirname+'/miners/ccminer/' + gpuMinerPath +  ' -a '+ miningAlgo +' -o '+ miningPool + ' -u ' + miningUser + ' -p ' + miningUserPw);
        nrc.run(gpuMinerPath+ ' -a '+ miningAlgo +' -o '+ miningPool + ' -u ' + miningUser + ' -p ' + miningUserPw + '',    { cwd: __dirname+'/miners/ccminer/', onData: dataCallback });    
    }
    else if (  miningDevice == 'CPU'){
        console.log(__dirname+'/miners/cpuminer/' + cpuMinerPath +  ' -a '+ miningAlgo +' -o '+ miningPool + ' -u ' + miningUser + ' -p ' + miningUserPw + ' -t ' + cpuCoreSlider + ' --no-color');
        nrc.run(cpuMinerPath+ ' -a '+ miningAlgo +' -o '+ miningPool + ' -u ' + miningUser + ' -p ' + miningUserPw + ' -t ' + cpuCoreSlider +' --no-color',  { cwd: __dirname+'/miners/cpuminer/', onData: dataCallback });    
    }

    
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
        file.close()// close() is async, call cb after close completes.
            .then(data => {  
                mainWindow.webContents.send('systemInfoNetworkInterfaces', data);
            })
            .catch(error => console.error(error)); 
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