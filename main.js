//#region Consts
//miner download links
const pathWinCcminerX86 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x86-2.2.3-cuda9.7z';
const pathWinCcminerX64 = 'https://github.com/dallar-project/ccminer/files/1596594/ccminer-x64.zip';
const pathWinCpuMinerX64 = 'https://github.com/tpruvot/cpuminer-multi/releases/download/v1.3.1-multi/cpuminer-multi-rel1.3.1-x64.zip';
const pathWinSgMinerX86 = 'https://github.com/dallar-project/sgminer/releases/download/d1.0/sgminer-x86.zip';

const scanf = require('scanf');
const sscanf = require('scanf').sscanf;
const electron = require('electron');
const url = require('url');
const path = require('path');
const systemInformation = require('systeminformation');
const fs = require('fs');
const request = require('request');
const nrc = require('node-run-cmd');
const sysOs = require('os');

//https://electronjs.org/docs/api/app
const app = electron.app;

//electron consts
const {
    BrowserWindow,  //https://electronjs.org/docs/api/browser-window
    Menu,           //https://electronjs.org/docs/api/menu
    ipcMain         //https://github.com/electron/electron/blob/master/docs/api/ipc-main.md
} = electron;
//#endregion

//#region Variables
var gpuMinerPath = '', cpuMinerPath = '';

//window vars
// hopefully these valeus will be put into somekind of config file so that the user can edit these values if they want
var cpuStatRefreshInterval = 1000;

// mining var (currently ccminer defaults)
// ccminer args
// https://github.com/cbuchner1/ccminer/blob/master/README.txt
// sgminer args
// https://github.com/sgminer-dev/sgminer/blob/master/doc/MINING.md
var miningStatsTimestamp = [{ 'year': '', 'month': '', 'day': '', 'hour': '', 'miunte': '', 'second': '' }];
var miningUser = ' -u DB5giy94MXx5NAT8SXgQeW31cm4sjWf5sF'
var miningPool = ' -o stratum+tcp://pool.dallar.org:3032';
var miningAlgo = ' -a throestl';

var miningStatsPoolUrl = "stratum+tcp://pool.dallar.org:3032";
var miningStatsUsername = "DB5giy94MXx5NAT8SXgQeW31cm4sjWf5sF"; // ?
var miningStatsPassword = ""; // ?
var miningStatsAlgoCPU = "throestl";
var miningStatsAlgoGPU = "throestl";
var miningStatsStratumDiff = [{ 'stratum_diff': '', 'targetdiff': '' }];
var miningStatsPoolCpuAccepted = [{ 'accepted_count': '', 'total_count': '', 'sharediff': '', 'hashrate': '', 'flag': '', 'solved': '' }];
var miningStatsPoolBlock = [{ 'algo_name': '', 'block_number': '', 'netinfo': '' }];

var deviceCpuInfoManufacturer = "";
var deviceCpuInfoBrand = "";
var deviceCpuInfoNumberCores = "";

var deviceCpuStatsOverallTemp = "";
var deviceCpuStatsTempCore0 = "";
var deviceCpuStatsTempCore1 = "";
var deviceCpuStatsTempCore2 = "";
var deviceCpuStatsTempCore3 = "";
var deviceCpuStatsTempCore4 = "";
var deviceCpuStatsTempCore5 = "";
var deviceCpuStatsTempCore6 = "";
var deviceCpuStatsTempCore7 = "";

var deviceCpuStatsOverallUsage = "";
var deviceCpuStatsUsageCore0 = "";
var deviceCpuStatsUsageCore1 = "";
var deviceCpuStatsUsageCore2 = "";
var deviceCpuStatsUsageCore3 = "";
var deviceCpuStatsUsageCore4 = "";
var deviceCpuStatsUsageCore5 = "";
var deviceCpuStatsUsageCore6 = "";
var deviceCpuStatsUsageCore7 = "";

var deviceCpuStatsOverallHashrate = "";
var deviceCpuStatsHashrateCore = [{ 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }];

//gpu
var deviceGpuInfoVendor = "";
var deviceGpuInfoModel = "";
var deviceGpuInfoVram = "";
var deviceGpuStats = [{ 'core': '', 'clockSpeed': '', 'clockUnits': '', 'hashWattRate': '', 'hashWattRateUnits': '', 'unk1': '', 'unk2': '', 'temp': '', 'tempUnits': '', 'fan': '', 'fanSpeedPercent': '' },
{ 'core': '', 'clockSpeed': '', 'clockUnits': '', 'hashWattRate': '', 'hashWattRateUnits': '', 'unk1': '', 'unk2': '', 'temp': '', 'tempUnits': '', 'fan': '', 'fanSpeedPercent': '' },
{ 'core': '', 'clockSpeed': '', 'clockUnits': '', 'hashWattRate': '', 'hashWattRateUnits': '', 'unk1': '', 'unk2': '', 'temp': '', 'tempUnits': '', 'fan': '', 'fanSpeedPercent': '' },
{ 'core': '', 'clockSpeed': '', 'clockUnits': '', 'hashWattRate': '', 'hashWattRateUnits': '', 'unk1': '', 'unk2': '', 'temp': '', 'tempUnits': '', 'fan': '', 'fanSpeedPercent': '' }
];

var deviceGpuStatsOverallHashrate = "";
var deviceGpuStatsHashrate = [{ 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }, { 'hashRate': '', 'unit': '' }];

//system var
global.sysGpuVendor = '';
global.sysPlatform = '';
global.sysPlatformArch = '';

// SET ENV
process.env.NODE_ENV = 'Dev';//production

let mainWindow, addWindow;
let { zip, unzip } = require('cross-unzip');
//#endregion

//#region App Entry
// called when the app has finished initializing
// https://electronjs.org/docs/api/app#event-ready
app.on('ready', function () {

    //load system
    //init Main Winodw
    createMainWindow();

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);

    setInitSettings();

    //initiate getting SystemStat data
    //setTimeout()
    //https://nodejs.org/api/timers.html#timers_settimeout_callback_delay_args
    setTimeout(getSystemStats, 1000);
    setTimeout(getSystemInfo, 1000);
    setTimeout(initialSetup, 3000);
});
//#endregion

//#region Init
//creates the main window
function createMainWindow() {

    //creates the main window
    mainWindow = new BrowserWindow({
        width: 900,
        height: 1100
    });

    //load html into window
    //generates local path similar to "//file://dirname/mainWindow.html"
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //quit app when closed
    mainWindow.on('closed', function () {
        app.quit();
    });
}

//get the system stats
function getSystemStats() {

    //keep refreshing the CPU stats
    setTimeout(getSystemStats, cpuStatRefreshInterval);

    //get the current CPU load
    systemInformation.currentLoad()
        .then(data => {
            deviceCpuStatsOverallUsage = data.currentload.toFixed(2);
            deviceCpuStatsUsageCore0 = data.cpus[0].load.toFixed(2);
            deviceCpuStatsUsageCore1 = data.cpus[1].load.toFixed(2);
            deviceCpuStatsUsageCore2 = data.cpus[2].load.toFixed(2);
            deviceCpuStatsUsageCore3 = data.cpus[3].load.toFixed(2);
            deviceCpuStatsUsageCore4 = data.cpus[4].load.toFixed(2);
            deviceCpuStatsUsageCore5 = data.cpus[5].load.toFixed(2);
            deviceCpuStatsUsageCore6 = data.cpus[6].load.toFixed(2);
            deviceCpuStatsUsageCore7 = data.cpus[7].load.toFixed(2);
        })
        .catch(error => console.error(error));

    //get the CPU temps
    systemInformation.cpuTemperature()
        .then(data => {
            deviceCpuStatsOverallTemp = data.main;
            deviceCpuStatsTempCore0 = data.cores[0];
            deviceCpuStatsTempCore1 = data.cores[1];
            deviceCpuStatsTempCore2 = data.cores[2];
            deviceCpuStatsTempCore3 = data.cores[3];
            deviceCpuStatsTempCore4 = data.cores[4];
            deviceCpuStatsTempCore5 = data.cores[5];
            deviceCpuStatsTempCore6 = data.cores[6];
            deviceCpuStatsTempCore7 = data.cores[7];
        })
        .catch(error => console.error(error));

    //update the screen
    updateHTML();
}

//get system info
function getSystemInfo() {

    //get OS
    systemInformation.osInfo()
        .then(data => {
            sysPlatform = data.platform;
            sysPlatformArch = data.arch;
        })
        .catch(error => console.error(error));

    //get CPU info
    systemInformation.cpu()
        .then(data => {
            deviceCpuInfoManufacturer = data.manufacturer;
            deviceCpuInfoBrand = data.brand;
            deviceCpuInfoNumberCores = data.cores;
        })
        .catch(error => console.error(error));

    //get GPU info
    systemInformation.graphics(function (data) {
        deviceGpuInfoVendor = data.controllers[0].vendor;
        deviceGpuInfoModel = data.controllers[0].model;
        deviceGpuInfoVram = data.controllers[0].vram;
    });

    //?
    systemInformation.networkInterfaces()
        .then(data => {
            mainWindow.webContents.send('systemInfoNetworkInterfaces', data);
        })
        .catch(error => console.error(error));

    //update the HTML
    updateHTML();
};

//inital setup if there isnt any miners have been downloaded
function initialSetup() {

    //set up file structure
    if (!fs.existsSync(__dirname + '/miners/')) {
        fs.mkdirSync(__dirname + '/miners/');
        
        console.log("Creating Directories...");
    } else {
        console.log("/miners/ Directory already exist");
    }

    if (!fs.existsSync(__dirname + '/miners/ccminer/')) {
        fs.mkdirSync(__dirname + '/miners/ccminer/');
    } else {
        console.log("/miners/ccminer/ Directory already exist");
    }

    if (!fs.existsSync(__dirname + '/miners/cpuminer/')) {
        fs.mkdirSync(__dirname + '/miners/cpuminer/');
    } else {
        console.log("/miners/cpuminer/ Directory already exist");
    }

    if (!fs.existsSync(__dirname + '/miners/sgminer/')) {
        fs.mkdirSync(__dirname + '/miners/sgminer/');
    } else {
        console.log("/miners/sgminer/ Directory already exist");
    }

    //download required miners
    if (sysPlatform == 'Windows') {
        //GPU
        if (deviceGpuInfoVendor == 'NVIDIA') {
            if (sysPlatformArch == 'x64') {

                gpuMinerPath = 'ccminer.exe';

                if (!fs.existsSync(__dirname + '/miners/ccminer/' + gpuMinerPath)) {
                    downloadFromInternet(pathWinCcminerX64, __dirname + '/miners/ccminer/', 'ccminer.7z');//unzips
                    console.log("Downloading" + gpuMinerPath.toString());
                }
                else
                    console.log("Already have " + gpuMinerPath.toString());
            }
            else if (sysPlatformArch == 'x32' || sysPlatformArch == 'x86') {

                gpuMinerPath = 'ccminer.exe';

                if (!fs.existsSync(__dirname + '/miners/ccminer/' + gpuMinerPath)) {
                    downloadFromInternet(pathWinCcminerX32, __dirname + '/miners/ccminer/', 'ccminer.7z');//unzips
                    console.log("Downloading" + gpuMinerPath.toString());
                }
                else
                    console.log("Already have " + gpuMinerPath.toString());
            }
        }
        else if (deviceGpuInfoVendor == 'AMD') {
            //load AMD miner here
            if (sysPlatformArch == 'x32' || sysPlatformArch == 'x86') {

                sgMinerPath = 'sgminer.exe';

                if (!fs.existsSync(__dirname + '/miners/sgminer/' + sgMinerPath)) {
                    downloadFromInternet(pathWinSgMinerX86, __dirname + '/miners/sgminer/', 'sgminer-x86.zip');//unzips
                    console.log("Downloading" + sgMinerPath.toString());
                }
                else
                    console.log("Already have " + sgMinerPath.toString());
            }
        }
        //CPU 
        if (sysPlatformArch == 'x64' || sysPlatformArch == 'x86') {
            if (deviceCpuInfoBrand.includes('Core', 0) && deviceCpuInfoBrand.includes('i7', 0))
                cpuMinerPath = 'cpuminer-gw64-corei7.exe';
            else if (deviceCpuInfoBrand.includes('Core', 0) && deviceCpuInfoBrand.includes('2', 0))
                cpuMinerPath = 'cpuminer-gw64-corei7.exe';
            else
                cpuMinerPath = 'cpuminer-gw64-avx2.exe';

            if (!fs.existsSync(__dirname + '/miners/cpuminer/' + cpuMinerPath))
                downloadFromInternet(pathWinCpuMinerX64, __dirname + '/miners/cpuminer/', 'cpuminer.7z');//unzips
        }

    }
    if (sysPlatform == 'Darwin') {//Mac
        console.log("Mac support for miners have not been implimented");
    }
    if (sysPlatform == 'Linux') {
        console.log("Linux support for miners have not been implimented");
    }

}
//#endregion

//Handle create add window
function createAddWindow() {

    //create new window
    addWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: 'Add item'
    });

    // load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //garbage collection handle
    addWindow.on('close', function () {
        addWindow = null;
    });
}

//updates the gui with the variables
function updateHTML() {

    var data = [{
        "miningStatsTimestamp": miningStatsTimestamp, //'year','month','day','hour','miunte','second'
        "miningStatsPoolUrl": miningStatsPoolUrl,
        "miningStatsUsername": miningStatsUsername,
        "miningStatsPassword": miningStatsPassword,
        "miningStatsAlgoCPU": miningStatsAlgoCPU,
        "miningStatsAlgoGPU": miningStatsAlgoGPU,

        "miningStatsPoolCpuAccepted": miningStatsPoolCpuAccepted,  //'accepted_count' , 'total_count' , 'sharediff' , 'hashrate','hashrateunit', 'flag', 'solved'
        "miningStatsPoolBlock": miningStatsPoolBlock, //'algo_name', 'block_number', 'netinfo'
        "miningStatsStratumDiff": miningStatsStratumDiff, //'stratum_diff','targetdiff'

        "deviceCpuInfoManufacturer": deviceCpuInfoManufacturer,
        "deviceCpuInfoBrand": deviceCpuInfoBrand,
        "deviceCpuInfoCores": deviceCpuInfoNumberCores,

        "deviceCpuStatsOverallTemp": deviceCpuStatsOverallTemp,
        "deviceCpuStatsTempCore0": deviceCpuStatsTempCore0,
        "deviceCpuStatsTempCore1": deviceCpuStatsTempCore1,
        "deviceCpuStatsTempCore2": deviceCpuStatsTempCore2,
        "deviceCpuStatsTempCore3": deviceCpuStatsTempCore3,
        "deviceCpuStatsTempCore4": deviceCpuStatsTempCore4,
        "deviceCpuStatsTempCore5": deviceCpuStatsTempCore5,
        "deviceCpuStatsTempCore6": deviceCpuStatsTempCore6,
        "deviceCpuStatsTempCore7": deviceCpuStatsTempCore7,

        "deviceCpuStatsOverallUsage": deviceCpuStatsOverallUsage,
        "deviceCpuStatsUsageCore0": deviceCpuStatsUsageCore0,
        "deviceCpuStatsUsageCore1": deviceCpuStatsUsageCore1,
        "deviceCpuStatsUsageCore2": deviceCpuStatsUsageCore2,
        "deviceCpuStatsUsageCore3": deviceCpuStatsUsageCore3,
        "deviceCpuStatsUsageCore4": deviceCpuStatsUsageCore4,
        "deviceCpuStatsUsageCore5": deviceCpuStatsUsageCore5,
        "deviceCpuStatsUsageCore6": deviceCpuStatsUsageCore6,
        "deviceCpuStatsUsageCore7": deviceCpuStatsUsageCore7,

        "deviceGpuInfoVendor": deviceGpuInfoVendor,
        "deviceGpuInfoModel": deviceGpuInfoModel,
        "deviceGpuInfoVram": deviceGpuInfoVram,
        "deviceGpuStats": deviceGpuStats, //'core','clockSpeed','clockUnits','hashWattRate','hashWattRateUnits','unk1','unk2','temp','tempUnits','fan','fanSpeedPercent'

        "deviceCpuStatsOverallHashrate": deviceCpuStatsOverallHashrate,
        "deviceCpuStatsHashrateCore0": deviceCpuStatsHashrateCore[0], //'hashRate','unit'
        "deviceCpuStatsHashrateCore1": deviceCpuStatsHashrateCore[1], //'hashRate','unit'
        "deviceCpuStatsHashrateCore2": deviceCpuStatsHashrateCore[2], //'hashRate','unit'
        "deviceCpuStatsHashrateCore3": deviceCpuStatsHashrateCore[3], //'hashRate','unit'
        "deviceCpuStatsHashrateCore4": deviceCpuStatsHashrateCore[4], //'hashRate','unit'
        "deviceCpuStatsHashrateCore5": deviceCpuStatsHashrateCore[5], //'hashRate','unit'
        "deviceCpuStatsHashrateCore6": deviceCpuStatsHashrateCore[6], //'hashRate','unit'
        "deviceCpuStatsHashrateCore7": deviceCpuStatsHashrateCore[7], //'hashRate','unit'

        "deviceGpuStatsOverallHashrate": deviceGpuStatsOverallHashrate,
        "deviceGpuStatsHashrate0": deviceGpuStatsHashrate[0], //'hashRate','unit'
        "deviceGpuStatsHashrate1": deviceGpuStatsHashrate[1], //'hashRate','unit'
        "deviceGpuStatsHashrate2": deviceGpuStatsHashrate[2], //'hashRate','unit'
        "deviceGpuStatsHashrate3": deviceGpuStatsHashrate[3], //'hashRate','unit'
    }];

    //sends event to the HTML
    mainWindow.webContents.send('updateHTML', data);
}

function setInitSettings() {

    var data = [{
        "miningStatsTimestamp": miningStatsTimestamp, //'year','month','day','hour','miunte','second'
        "miningStatsPoolUrl": miningStatsPoolUrl,
        "miningStatsUsername": miningStatsUsername,
        "miningStatsPassword": miningStatsPassword,
        "miningStatsAlgoCPU": miningStatsAlgoCPU,
        "miningStatsAlgoGPU": miningStatsAlgoGPU,

        "miningStatsPoolCpuAccepted": miningStatsPoolCpuAccepted,  //'accepted_count' , 'total_count' , 'sharediff' , 'hashrate','hashrateunit', 'flag', 'solved'
        "miningStatsPoolBlock": miningStatsPoolBlock, //'algo_name', 'block_number', 'netinfo'
        "miningStatsStratumDiff": miningStatsStratumDiff, //'stratum_diff','targetdiff'

        "deviceCpuInfoManufacturer": deviceCpuInfoManufacturer,
        "deviceCpuInfoBrand": deviceCpuInfoBrand,
        "deviceCpuInfoCores": deviceCpuInfoNumberCores,

        "deviceCpuStatsOverallTemp": deviceCpuStatsOverallTemp,
        "deviceCpuStatsTempCore0": deviceCpuStatsTempCore0,
        "deviceCpuStatsTempCore1": deviceCpuStatsTempCore1,
        "deviceCpuStatsTempCore2": deviceCpuStatsTempCore2,
        "deviceCpuStatsTempCore3": deviceCpuStatsTempCore3,
        "deviceCpuStatsTempCore4": deviceCpuStatsTempCore4,
        "deviceCpuStatsTempCore5": deviceCpuStatsTempCore5,
        "deviceCpuStatsTempCore6": deviceCpuStatsTempCore6,
        "deviceCpuStatsTempCore7": deviceCpuStatsTempCore7,

        "deviceCpuStatsOverallUsage": deviceCpuStatsOverallUsage,
        "deviceCpuStatsUsageCore0": deviceCpuStatsUsageCore0,
        "deviceCpuStatsUsageCore1": deviceCpuStatsUsageCore1,
        "deviceCpuStatsUsageCore2": deviceCpuStatsUsageCore2,
        "deviceCpuStatsUsageCore3": deviceCpuStatsUsageCore3,
        "deviceCpuStatsUsageCore4": deviceCpuStatsUsageCore4,
        "deviceCpuStatsUsageCore5": deviceCpuStatsUsageCore5,
        "deviceCpuStatsUsageCore6": deviceCpuStatsUsageCore6,
        "deviceCpuStatsUsageCore7": deviceCpuStatsUsageCore7,

        "deviceGpuInfoVendor": deviceGpuInfoVendor,
        "deviceGpuInfoModel": deviceGpuInfoModel,
        "deviceGpuInfoVram": deviceGpuInfoVram,
        "deviceGpuStats": deviceGpuStats, //'core','clockSpeed','clockUnits','hashWattRate','hashWattRateUnits','unk1','unk2','temp','tempUnits','fan','fanSpeedPercent'

        "deviceCpuStatsOverallHashrate": deviceCpuStatsOverallHashrate,
        "deviceCpuStatsHashrateCore0": deviceCpuStatsHashrateCore[0], //'hashRate','unit'
        "deviceCpuStatsHashrateCore1": deviceCpuStatsHashrateCore[1], //'hashRate','unit'
        "deviceCpuStatsHashrateCore2": deviceCpuStatsHashrateCore[2], //'hashRate','unit'
        "deviceCpuStatsHashrateCore3": deviceCpuStatsHashrateCore[3], //'hashRate','unit'
        "deviceCpuStatsHashrateCore4": deviceCpuStatsHashrateCore[4], //'hashRate','unit'
        "deviceCpuStatsHashrateCore5": deviceCpuStatsHashrateCore[5], //'hashRate','unit'
        "deviceCpuStatsHashrateCore6": deviceCpuStatsHashrateCore[6], //'hashRate','unit'
        "deviceCpuStatsHashrateCore7": deviceCpuStatsHashrateCore[7], //'hashRate','unit'

        "deviceGpuStatsOverallHashrate": deviceGpuStatsOverallHashrate,
        "deviceGpuStatsHashrate0": deviceGpuStatsHashrate[0], //'hashRate','unit'
        "deviceGpuStatsHashrate1": deviceGpuStatsHashrate[1], //'hashRate','unit'
        "deviceGpuStatsHashrate2": deviceGpuStatsHashrate[2], //'hashRate','unit'
        "deviceGpuStatsHashrate3": deviceGpuStatsHashrate[3], //'hashRate','unit'
    }];

    //sends event to the HTML
    mainWindow.webContents.send('setInitSettings', data);
}

//Catch StartMining Btn
ipcMain.on('startMining', function (e, data) {
    const miningDevice = data[0].miningDevice;
    var options = "";
    options = options.concat(' -o ', data[0].miningSettingsPool);
    options = options.concat(' -u ', data[0].miningSettingsUsername);
    options = options.concat(' -p ', data[0].miningSettingsPassword);

    if (miningDevice == "CPU") {
        options = options.concat(' -a ', data[0].miningSettingsAlgoCPU);

        if (data[0].opt_miningSettingsCpuThreads.toString() == "true")
            options = options.concat(' --threads ', data[0].miningSettingsCpuThreads);
        if (data[0].opt_miningSettingsCpuMaxTemp.toString() == "true")
            options = options.concat(' --max-temp ', data[0].miningSettingsCpuMaxTemp);
        if (data[0].opt_miningSettingsCpuMaxDiff.toString() == "true")
            options = options.concat(' --max-diff ', data[0].miningSettingsCpuMaxDiff);
        if (data[0].opt_miningSettingsCpuPriority.toString() == "true")
            options = options.concat(' --cpu-priority ', data[0].miningSettingsCpuPriority);
        if (data[0].opt_miningSettingsCpuAffinity.toString() == "true")
            options = options.concat(' --cpu-affinity ', data[0].miningSettingsCpuAffinity);
        if (data[0].opt_miningSettingsRandomize.toString() == "true")
            options = options.concat(' --randomize ');

    }
    if (miningDevice == "GPU" && deviceGpuInfoVendor == 'NVIDIA') {
        options = options.concat(' -a ', data[0].miningSettingsAlgoGPU);

        if (data[0].opt_miningSettingsGpuLaunchConfig.toString() == "true")
            options = options.concat(' -l ', data[0].miningSettingsGpuLaunchConfig);
        if (data[0].opt_miningSettingsGpuIntensity.toString() == "true")
            options = options.concat(' -i ', data[0].miningSettingsGpuIntensity);
        if (data[0].opt_miningSettingsGpuDiffMultiplier.toString() == "true")
            options = options.concat(' --diff-multiplier ', data[0].miningSettingsGpuDiffMultiplier);
        if (data[0].opt_miningSettingsGpuDiffFactor.toString() == "true")
            options = options.concat(' --diff-factor ', data[0].miningSettingsGpuDiffFactor);
        if (data[0].opt_miningSettingsGpuThreads.toString() == "true")
            options = options.concat(' --threads ', data[0].miningSettingsGpuThreads);
        if (data[0].opt_miningSettingsGpuMaxTemp.toString() == "true")
            options = options.concat(' --max-temp ', data[0].miningSettingsGpuMaxTemp);
        if (data[0].opt_miningSettingsGpuMaxDiff.toString() == "true")
            options = options.concat(' --max-diff ', data[0].miningSettingsGpuMaxDiff);
        if (data[0].opt_miningSettingsGpuMemClock.toString() == "true")
            options = options.concat(' --mem-clock ', data[0].miningSettingsGpuMemClock);
        if (data[0].opt_miningSettingsGpuMemClockOffset.toString() == "true")
            options = options.concat(' --mem-clock=+ ', data[0].miningSettingsGpuMemClockOffset);
        if (data[0].opt_miningSettingsGpuClock.toString() == "true")
            options = options.concat(' --gpu-clock ', data[0].miningSettingsGpuClock);
        if (data[0].opt_miningSettingsGpuPlimit.toString() == "true")
            options = options.concat(' --plimit ', data[0].miningSettingsGpuPlimit);
        if (data[0].opt_miningSettingsGpuTlimit.toString() == "true")
            options = options.concat(' --tlimit ', data[0].miningSettingsGpuTlimit);
        if (data[0].opt_miningSettingsGpuTimeLimit.toString() == "true")
            options = options.concat(' --time-limit ', data[0].miningSettingsGpuTimeLimit);
        if (data[0].opt_miningSettingsGpuSharesLimit.toString() == "true")
            options = options.concat(' --shares-limit ', data[0].miningSettingsGpuSharesLimit);
        if (data[0].opt_miningSettingsRetries.toString() == "true")
            options = options.concat(' --retries ', data[0].miningSettingsRetries);

        //-x, --proxy=[PROTOCOL://]HOST[:PORT]  connect through a proxy
        //
        //there are more....

        //required
        options = options.concat(' --no-color ');
    }
    if (miningDevice == "GPU" && deviceGpuInfoVendor == 'AMD') {
        //AMD Settings go here

        options = options.concat(' --algorithm ', data[0].miningSettingsAlgoGPU);

        if (data[0].opt_miningSettingsGpuIntensity.toString() == "true")
            options = options.concat(' -I ', data[0].miningSettingsGpuIntensity);//Intensity of GPU scanning (d or 8 -> 31,default: d to maintain desktop interactivity), overridden by --xintensity or --rawintensity.
        if (data[0].opt_miningSettingsGpuDiffMultiplier.toString() == "true")
            options = options.concat(' --difficulty-multiplier ', data[0].miningSettingsGpuDiffMultiplier);//--difficulty-multiplier <arg> (deprecated) Difficulty multiplier for jobs received from stratum pools
        if (data[0].opt_miningSettingsGpuMaxTemp.toString() == "true")
            options = options.concat(' --temp-cutoff ', data[0].miningSettingsGpuMaxTemp);//--temp-cutoff <arg> Temperature which a device will be automatically disabled at, one value or comma separated list (default: 95)
        if (data[0].opt_miningSettingsGpuSharesLimit.toString() == "true")
            options = options.concat(' --shares ', data[0].miningSettingsGpuSharesLimit);//Quit after mining N shares (default: unlimited
        if (data[0].opt_miningSettingsGpuMemClock.toString() == "true")
            options = options.concat(' --gpu-memclock ', data[0].miningSettingsGpuMemClock);//Set the GPU memory (over)clock in Mhz - one value for all or separate by commas for per card
        if (data[0].opt_miningSettingsGpuClock.toString() == "true")
            options = options.concat(' --gpu-engine ', data[0].miningSettingsGpuClock);//GPU engine (over)clock range in Mhz - one value, range and/or comma separated list (e.g. 850-900,900,750-850)
        if (data[0].opt_miningSettingsGpuThreads.toString() == "true")
            options = options.concat(' --gpu-threads ', data[0].miningSettingsGpuThreads);// Number of threads per GPU - one value or comma separated list (e.g. 1,2,1)

        if (data[0].opt_miningSettingsGpuWorksize.toString() == "true")
            options = options.concat(' --worksize ', data[0].miningSettingsGpuWorksize);//--worksize|-w <arg> Override detected optimal worksize - one value or comma separated list
        if (data[0].opt_miningSettingsGpuGrsAddress.toString() == "true")
            options = options.concat(' --grs-address ', data[0].miningSettingsGpuGrsAddress);//--grs-address <arg> Set dallar target address when solo mining to dallard (mandatory)

        if (data[0].opt_miningSettingsGpuAutoFan.toString() == "true")
            options = options.concat(' --auto-fan  ', data[0].miningSettingsGpuAutoFan);//--auto-fan          Automatically adjust all GPU fan speeds to maintain a target temperature]
        if (data[0].opt_miningSettingsGpuAutoGpu.toString() == "true")
            options = options.concat(' --auto-gpu ', data[0].miningSettingsGpuAutoGpu);//--auto-gpu          Automatically adjust all GPU engine clock speeds to maintain a target temperature
        if (data[0].opt_miningSettingsGpuTempOverheat.toString() == "true")
            options = options.concat(' --temp-overheat ', data[0].miningSettingsGpuTempOverheat);//--temp-overheat <arg> Temperature which a device will be throttled at while automanaging fan and/or GPU, one value or comma separated list (default: 85)
        if (data[0].opt_miningSettingsGpuTempTarget.toString() == "true")
            options = options.concat(' --temp-target ', data[0].miningSettingsGpuTempTarget);//--temp-target <arg> Temperature which a device should stay at while automanaging fan and/or GPU, one value or comma separated list (default: 75)
        if (data[0].opt_miningSettingsGpuTempHysteresis.toString() == "true")
            options = options.concat(' --temp-hysteresis ', data[0].miningSettingsGpuTempHysteresis);//--temp-hysteresis <arg> Set how much the temperature can fluctuate outside limits when automanaging speeds (default: 3)
        if (data[0].opt_miningSettingsGpuMemDiff.toString() == "true")
            options = options.concat(' --gpu-memdiff ', data[0].miningSettingsGpuMemDiff);//--gpu-memdiff <arg> Set a fixed difference in clock speed between the GPU and memory in auto-gpu mode
        if (data[0].opt_miningSettingsGpuBalance.toString() == "true")
            options = options.concat(' --balance ', data[0].miningSettingsGpuBalance);//--balance  Change multipool strategy from failover to even share balance
        if (data[0].opt_miningSettingsGpuDevice.toString() == "true")
            options = options.concat(' --device ', data[0].miningSettingsGpuDevice);//--device|-d <arg>   Select device to use, one value, range and/or comma separated (e.g. 0-2,4) default: all
        if (data[0].opt_miningSettingsGpuDyninterval.toString() == "true")
            options = options.concat(' --gpu-dyninterval ', data[0].miningSettingsGpuDyninterval);//--gpu-dyninterval <arg> Set the refresh interval in ms for GPUs using dynamic intensity (default: 7)
        if (data[0].opt_miningSettingsGpuPlatform.toString() == "true")
            options = options.concat(' --gpu-platform ', data[0].miningSettingsGpuPlatform);//--gpu-platform <arg> Select OpenCL platform ID to use for GPU mining (default: -1)
        if (data[0].opt_miningSettingsGpuFan.toString() == "true")
            options = options.concat(' --gpu-fan ', data[0].miningSettingsGpuFan);//--gpu-fan <arg>     GPU fan percentage range - one value, range and/or comma separated list (e.g. 0-85,85,65)
        if (data[0].opt_miningSettingsGpuMap.toString() == "true")
            options = options.concat(' --gpu-map ', data[0].miningSettingsGpuMap);//--gpu-map <arg>     Map OpenCL to ADL device order manually, paired CSV (e.g. 1:0,2:1 maps OpenCL 1 to ADL 0, 2 to 1)
        if (data[0].opt_miningSettingsGpuPowerTune.toString() == "true")
            options = options.concat(' --gpu-powertune ', data[0].miningSettingsGpuPowerTune);//--gpu-powertune <arg> Set the GPU powertune percentage - one value for all or separate by commas for per card
        if (data[0].opt_miningSettingsGpuReorder.toString() == "true")
            options = options.concat(' --gpu-reorder ', data[0].miningSettingsGpuReorder);//--gpu-reorder       Attempt to reorder GPU devices according to PCI Bus ID
        if (data[0].opt_miningSettingsGpuVddc.toString() == "true")
            options = options.concat(' --gpu-vddc ', data[0].miningSettingsGpuVddc);//--gpu-vddc <arg>    Set the GPU voltage in Volts - one value for all or separate by commas for per card
        if (data[0].opt_miningSettingsGpuXintensity.toString() == "true")
            options = options.concat(' --xintensit ', data[0].miningSettingsGpuXintensity);//--xintensity|-X <arg> Shader based intensity of GPU scanning (1 to 9999), overridden --xintensity|-X and --rawintensity.
        if (data[0].opt_miningSettingsGpuRawintensity.toString() == "true")
            options = options.concat(' --rawintensity ', data[0].miningSettingsGpuRawintensity);//--rawintensity <arg> Raw intensity of GPU scanning (1 to 2147483647), overrides --intensity|-I and --xintensity|-X.
        if (data[0].opt_miningSettingsGpuNetDelay.toString() == "true")
            options = options.concat(' --net-delay ', data[0].miningSettingsGpuNetDelay);//--net-delay         Impose small delays in networking to not overload slow routers
        if (data[0].opt_miningSettingsGpuPerDeviceStats.toString() == "true")
            options = options.concat(' --per-device-stat ', data[0].miningSettingsGpuPerDeviceStats);//--per-device-stats  Force verbose mode and output per-device statistics
        if (data[0].opt_miningSettingsGpuProtocolDump.toString() == "true")
            options = options.concat(' --protocol-dump ', data[0].miningSettingsGpuProtocolDump);//--protocol-dump|-P  Verbose dump of protocol-level activities
        if (data[0].opt_miningSettingsGpuSchedStart.toString() == "true")
            options = options.concat(' --sched-start ', data[0].miningSettingsGpuSchedStart);//--sched-start <arg> Set a time of day in HH:MM to start mining (a once off without a stop time)
        if (data[0].opt_miningSettingsGpuSchedStop.toString() == "true")
            options = options.concat(' --sched-stop ', data[0].miningSettingsGpuSchedStop);//--sched-stop <arg>  Set a time of day in HH:MM to stop mining (will quit without a start time)
        if (data[0].opt_miningSettingsGpuSocksProxy.toString() == "true")
            options = options.concat(' --socks-proxy ', data[0].miningSettingsGpuSocksProxy);//--socks-proxy <arg> Set socks4 proxy (host:port)        
        if (data[0].opt_miningSettingsGpuShowCoinDiff.toString() == "true")
            options = options.concat(' --show-coindiff ', data[0].miningSettingsGpuShowCoinDiff);//--show-coindiff     Show coin difficulty rather than hash value of a share      


        //required
        options = options.concat(' --no-submit-stale ');
        options = options.concat(' --log-show-date '); //maybe

    }


    console.log("options  =  " + options);

    //async with cmd output data
    var dataCallback = function (data) {

        console.log(data);
        mainWindow.webContents.send('consoleOutput', data);

        //parse output for CPUminer
        miningStatsTimestamp = sscanf(data.toString(), '[%d-%d-%d %d:%d:%d]', 'year', 'month', 'day', 'hour', 'miunte', 'second');//year,month,day hour:miunte:second
        var message = data.slice(data.search("]") + 2);   //remove timestamp

        // message = stdout with out timestamp
        if (message.search("CPU") !== -1) {
            var cpuHash = sscanf(message.toString(), 'CPU #%d: %f %s', 'core', 'hashRate', 'unit');
            deviceCpuStatsHashrateCore[cpuHash.core] = [cpuHash.hashRate, cpuHash.unit];
        }
        if (message.search("Stratum difficulty") !== -1) {
            var stratumDiff = sscanf(message.toString(), 'Stratum difficulty set to %d (%f)', 'stratum_diff', 'targetdiff');
            miningStatsStratumDiff = stratumDiff;
            /*
            LOG_WARNING
                "Stratum difficulty set to %g%s"    ,   stratum_diff, sdiff
                                                            sdiff       =   " (%.5f)"           ,    work->targetdiff
            */
        }
        if (message.search("accepted:") !== -1) {
            var accepted = sscanf(message.toString(), 'accepted: %u/%u (diff %f), %f %s %s%s', 'accepted_count', 'total_count', 'sharediff', 'hashrate', 'hashrateunit', 'flag', 'solved');
            miningStatsPoolCpuAccepted = accepted;
            /*
            LOG_NOTICE
                "accepted: %lu/%lu (%s), %s %s%s"   ,   accepted_count , (accepted_count+rejected_count) , suppl , hashrate, flag, solved;
                                                            suppl       =   "diff %.3f"         ,   sharediff
                                                                        |=   "%.2f%%"            ,   100. * accepted_count / (accepted_count + rejected_count))
                                                            hashrate    =   %f %s 
                                                            flag        =   "YAY" | "BOO"
                                                            solved      =   " solved: %u"       ,   solved_count
            */
        }
        if (message.search(" block ") !== -1) {
            var accepted = sscanf(message.toString(), '%s block %d, diff %f', 'algo_name', 'block_number', 'netinfo');
            miningStatsPoolBlock = accepted;
            /*
            LOG_BLUE
                "%s block %d, %s"                   ,	lgo_names[opt_algo], work->height, netinfo
                                                            netinfo     =   "diff %.2f"         ,   net_diff
                                                                        |=   "diff %.2f, net "   ,   net_diff,sr
            */
        }

        // posible messages from CCminer
        /*
            LOG_ERR
                            // LoOk into      reject reason: low difficulty share of 1.4728836769975157e-7
            LOG_INFO
                "Adding %u threads to intensity %u, %u cuda threads"    ,   adds, v, gpus_intensity[n]
                "NVML GPU monitoring enabled."
                "NVAPI GPU monitoring enabled."
                "GPU monitoring is not available."
                "%d miner thread%s started, using '%s' algorithm."      ,   opt_n_threads, opt_n_threads > 1 ? "s":"",  algo_names[opt_algo]
            LOG_BLUE
                "Starting on %s"                    ,   stratum.url
            LOG_WARNING
                "Stratum connection timed out"
                "Stratum connection interrupted"
        */


        //GPU #0: Intensity set to 19, 524288 cuda threads
        if (message.search("GPU") !== -1 && message.search(": Intensity set to ") !== -1) {
            var gpuSettings = sscanf(message.toString(), 'GPU #%d: Intensity set to %d, %u cuda threads', 'core', 'intensity', 'cudaThreads');
            mainWindow.webContents.send('miningStatsGpuSettings', gpuSettings);
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            console.log(gpuSettings);
        }
        //GPU #0: EVGA GTX 750 Ti, 5989.90 kH/s
        if (message.search("GPU") !== -1 && message.search("kH/s") !== -1) {
            var gpuHash = [];
            gpuHash = gpuHash.concat(sscanf(message.toString(), 'GPU #%d:', 'core').core);
            message = message.slice(message.search(","));
            gpuHash = gpuHash.concat(sscanf(message, ' %f %s', 'hashRate', 'unit').hashRate, sscanf(message, ' %f %s', 'hashRate', 'unit').unit);
            deviceGpuStatsHashrate[gpuHash[0]] = [gpuHash[1], gpuHash[2]];
        }
        //GPU #0: 1161 MHz 60.91 MH/W 0W 48C FAN 42%
        if (message.search("GPU") !== -1 && message.search("Hz") !== -1 && message.search("H/W") !== -1) {
            var gpuStats = [];
            gpuStats = sscanf(message.toString(), 'GPU #%d: %d %s %f %s %f%s %f%s %s %d%', 'core', 'clockSpeed', 'clockUnits', 'hashWattRate', 'hashWattRateUnits', 'unk1', 'unk2', 'temp', 'tempUnits', 'fan', 'fanSpeedPercent');
            console.log(gpuStats);
            deviceGpuStats[gpuStats.core] = gpuStats;
            console.log(deviceGpuStats);
        }
        updateHTML();

    };

    //runs through CMD
    if (miningDevice == 'GPU' && deviceGpuInfoVendor == 'NVIDIA') {
        console.log(__dirname + '/miners/ccminer/' + gpuMinerPath + options);
        nrc.run(__dirname + '/miners/ccminer/' + gpuMinerPath + options, { cwd: __dirname + '/miners/ccminer/', onData: dataCallback });
    }
    else if (miningDevice == 'GPU' && deviceGpuInfoVendor == 'AMD') {
        console.log(__dirname + '/miners/sgminer/' + sgMinerPath + options);
        nrc.run(__dirname + '/miners/sgminer/' + sgMinerPath + options, { cwd: __dirname + '/miners/sgminer/', onData: dataCallback });   //perhaps create another data callback for sgminer 
    }
    else if (miningDevice == 'CPU') {
        console.log(__dirname + '/miners/cpuminer/' + cpuMinerPath + options);
        nrc.run(__dirname + '/miners/cpuminer/' + cpuMinerPath + options, { cwd: __dirname + '/miners/cpuminer/', onData: dataCallback });
    }

});

//Catch stopMining Btn
ipcMain.on('stopMining', function (e) {

    //async with cmd output data
    var dataCallback = function (data) {
        console.log(data);
    };

    nrc.run('Taskkill /IM ' + cpuMinerPath + ' /F');
    nrc.run('Taskkill /IM ' + gpuMinerPath + ' /F');

    for (i = 0; i < 8; i++) {
        deviceGpuStatsHashrate[i] = ['', ''];
        deviceCpuStatsHashrateCore[i] = ['', ''];
    }
});

// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear items',
                click() {
                    mainWindow.webContents.send('item:clear')
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'System',
        submenu: [
            {
                label: 'Get System Info',
                click() {
                    getSystemInfo();
                }
            }
        ]
    }
];

//if mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}

//downloads a file from the internet
function downloadFromInternet(url, dest, filename, cb) {

    //the file name
    var file = fs.createWriteStream(dest + filename);
    //the request
    var sendReq = request.get(url);

    // verify response code
    sendReq.on('response', function (response) {
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

    file.on('finish', function () {
        file.close(cb)// close() is async, call cb after close completes.

        unzip(dest + filename, dest, err => {
            console.log('finished unziping');
            fs.unlink(dest + filename);//remove zip
        })
    });

    file.on('error', function (err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        return cb(err.message);
    });
};