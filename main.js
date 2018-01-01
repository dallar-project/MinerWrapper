
const pathWinCcminerX86 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x86-2.2.3-cuda9.7z';
const pathWinCcminerX64 = 'https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x64-2.2.3-cuda9.7z';
const pathWinCpuMinerX64 = 'https://github.com/tpruvot/cpuminer-multi/releases/download/v1.3.1-multi/cpuminer-multi-rel1.3.1-x64.zip';

var gpuMinerPath = '',cpuMinerPath ='';

const scanf = require('scanf');
const sscanf = require('scanf').sscanf;
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
var miningStatsTimestamp = [{'year':'','month':'','day':'','hour':'','miunte':'','second':''}];
var miningUser = ' -u bf-az.donate'
var miningPool = ' -o stratum+tcp://us-east.stratum.slushpool.com:3333';
var miningAlgo = ' -a sha256';

var miningStatsPoolUrl= "stratum+tcp://vtc.poolmining.org:3096";
var miningStatsUsername= "VviPkfhDDidTJwZUgYjDfhXqBVjKjVTpVN";
var miningStatsPassword= "d=8";
var miningStatsAlgoCPU= "scrypt";
var miningStatsAlgoGPU= "scrypt";
var miningStatsStratumDiff= [{'stratum_diff':'','targetdiff':''}];
var miningStatsPoolCpuAccepted= [{'accepted_count':'' , 'total_count':'' , 'sharediff':'' , 'hashrate':'', 'flag':'', 'solved':''}];
var miningStatsPoolBlock = [{'algo_name':'', 'block_number':'', 'netinfo':''}]; 

var deviceCpuInfoManufacturer= "";
var deviceCpuInfoBrand= "";
var deviceCpuInfoNumberCores= "";

var deviceCpuStatsOverallTemp= "";
var deviceCpuStatsTempCore0= "";
var deviceCpuStatsTempCore1= "";
var deviceCpuStatsTempCore2= "";
var deviceCpuStatsTempCore3= "";
var deviceCpuStatsTempCore4= "";
var deviceCpuStatsTempCore5= "";
var deviceCpuStatsTempCore6= "";
var deviceCpuStatsTempCore7= "";

var deviceCpuStatsOverallUsage= "";
var deviceCpuStatsUsageCore0= "";
var deviceCpuStatsUsageCore1= "";
var deviceCpuStatsUsageCore2= "";
var deviceCpuStatsUsageCore3= "";
var deviceCpuStatsUsageCore4= "";
var deviceCpuStatsUsageCore5= "";
var deviceCpuStatsUsageCore6= "";
var deviceCpuStatsUsageCore7= "";

var deviceCpuStatsOverallHashrate= "";
var deviceCpuStatsHashrateCore = [{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''}];

//gpu
var deviceGpuInfoVendor= "";
var deviceGpuInfoModel= "";
var deviceGpuInfoVram= "";
var deviceGpuStats = [{'core':'','clockSpeed':'','clockUnits':'','hashWattRate':'','hashWattRateUnits':'','unk1':'','unk2':'','temp':'','tempUnits':'','fan':'','fanSpeedPercent':'' },
                        {'core':'','clockSpeed':'','clockUnits':'','hashWattRate':'','hashWattRateUnits':'','unk1':'','unk2':'','temp':'','tempUnits':'','fan':'','fanSpeedPercent':'' },
                        {'core':'','clockSpeed':'','clockUnits':'','hashWattRate':'','hashWattRateUnits':'','unk1':'','unk2':'','temp':'','tempUnits':'','fan':'','fanSpeedPercent':'' },
                        {'core':'','clockSpeed':'','clockUnits':'','hashWattRate':'','hashWattRateUnits':'','unk1':'','unk2':'','temp':'','tempUnits':'','fan':'','fanSpeedPercent':'' }                    
                     ];


var deviceGpuStatsOverallHashrate = "";
var deviceGpuStatsHashrate = [{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''},{'hashRate':'','unit':''}];




//system var
global.sysGpuVendor ='';
global.sysPlatform = '';
global.sysPlatformArch = '';


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
        //alert("Setting up folder structure");
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
        if (deviceGpuInfoVendor == 'NVIDIA'){
            if (sysPlatformArch == 'x64'){

                gpuMinerPath = 'ccminer-x64.exe';
                
                if (!fs.existsSync(__dirname+'/miners/ccminer/'+gpuMinerPath)){
                    downloadFromInternet(pathWinCcminerX64,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
                    console.log("Downloading" +gpuMinerPath.toString());
                }
                else
                    console.log("Already exsists" +gpuMinerPath.toString());
            }
            else if(sysPlatformArch == 'x32'){
                
                gpuMinerPath = 'ccminer.exe';
                
                if (!fs.existsSync(__dirname+'/miners/ccminer/'+gpuMinerPath)){
                    downloadFromInternet(pathWinCcminerX32,__dirname+'/miners/ccminer/','ccminer.7z');//unzips
                    console.log("Downloading" +gpuMinerPath.toString());
                }
                else
                    console.log("Already exsists" +gpuMinerPath.toString());
            }
        }
        else if (deviceGpuInfoVendor == 'AMD'){
            //load AMD miner here
        }
        //CPU 
        console.log(deviceCpuInfoBrand);
        if ( sysPlatformArch == 'x64' || sysPlatformArch == 'x86') {
            if ( deviceCpuInfoBrand.includes('Core',0) && deviceCpuInfoBrand.includes('i7',0))
                cpuMinerPath = 'cpuminer-gw64-corei7.exe';
            else if ( deviceCpuInfoBrand.includes('Core',0) && deviceCpuInfoBrand.includes('2',0))
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
    mainWindow = new BrowserWindow({
        width:900,
        height:1100
    });//pass in empty object {} cause no configurations
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
            sysPlatform = data.platform;
            sysPlatformArch = data.arch;
        })
        .catch(error => console.error(error)); 
    
    si.cpu()
        .then(data => {
            deviceCpuInfoManufacturer = data.manufacturer;
            deviceCpuInfoBrand = data.brand;
            deviceCpuInfoNumberCores = data.cores;
        })
        .catch(error => console.error(error)); 
        
    si.graphics(function(data){
        deviceGpuInfoVendor = data.controllers[0].vendor;
        deviceGpuInfoModel = data.controllers[0].model;
        deviceGpuInfoVram = data.controllers[0].vram;
    });

    si.networkInterfaces()
        .then(data => {  
            mainWindow.webContents.send('systemInfoNetworkInterfaces', data);
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////
        })
        .catch(error => console.error(error)); 
    updateHTML();
        
};



function getSystemStats(){
    //keep refreshing 
    setTimeout(getSystemStats, 1000);
    si.currentLoad()
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
    si.cpuTemperature()
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
    updateHTML();
}

function updateHTML(){

    var data = [ {
        "miningStatsTimestamp":miningStatsTimestamp, //'year','month','day','hour','miunte','second'
        "miningStatsPoolUrl":miningStatsPoolUrl,
        "miningStatsUsername":miningStatsUsername,
        "miningStatsPassword":miningStatsPassword,
        "miningStatsAlgoCPU":miningStatsAlgoCPU,
        "miningStatsAlgoGPU":miningStatsAlgoGPU,
        "miningStatsPoolCpuAccepted":miningStatsPoolCpuAccepted,  //'accepted_count' , 'total_count' , 'sharediff' , 'hashrate','hashrateunit', 'flag', 'solved'
        "miningStatsPoolBlock": miningStatsPoolBlock, //'algo_name', 'block_number', 'netinfo'
        "miningStatsStratumDiff":miningStatsStratumDiff, //'stratum_diff','targetdiff'
        
        "deviceCpuInfoManufacturer":deviceCpuInfoManufacturer,
        "deviceCpuInfoBrand":deviceCpuInfoBrand,
        "deviceCpuInfoCores":deviceCpuInfoNumberCores,
        
        "deviceCpuStatsOverallTemp":deviceCpuStatsOverallTemp,
        "deviceCpuStatsTempCore0":deviceCpuStatsTempCore0,
        "deviceCpuStatsTempCore1":deviceCpuStatsTempCore1,
        "deviceCpuStatsTempCore2":deviceCpuStatsTempCore2,
        "deviceCpuStatsTempCore3":deviceCpuStatsTempCore3,
        "deviceCpuStatsTempCore4":deviceCpuStatsTempCore4,
        "deviceCpuStatsTempCore5":deviceCpuStatsTempCore5,
        "deviceCpuStatsTempCore6":deviceCpuStatsTempCore6,
        "deviceCpuStatsTempCore7":deviceCpuStatsTempCore7,
        
        "deviceCpuStatsOverallUsage":deviceCpuStatsOverallUsage,
        "deviceCpuStatsUsageCore0":deviceCpuStatsUsageCore0,
        "deviceCpuStatsUsageCore1":deviceCpuStatsUsageCore1,
        "deviceCpuStatsUsageCore2":deviceCpuStatsUsageCore2,
        "deviceCpuStatsUsageCore3":deviceCpuStatsUsageCore3,
        "deviceCpuStatsUsageCore4":deviceCpuStatsUsageCore4,
        "deviceCpuStatsUsageCore5":deviceCpuStatsUsageCore5,
        "deviceCpuStatsUsageCore6":deviceCpuStatsUsageCore6,
        "deviceCpuStatsUsageCore7":deviceCpuStatsUsageCore7,
        
        "deviceGpuInfoVendor":deviceGpuInfoVendor,
        "deviceGpuInfoModel":deviceGpuInfoModel,
        "deviceGpuInfoVram":deviceGpuInfoVram,
        "deviceGpuStats":deviceGpuStats, //'core','clockSpeed','clockUnits','hashWattRate','hashWattRateUnits','unk1','unk2','temp','tempUnits','fan','fanSpeedPercent'
        
        
        "deviceCpuStatsOverallHashrate":deviceCpuStatsOverallHashrate,
        "deviceCpuStatsHashrateCore0":deviceCpuStatsHashrateCore[0], //'hashRate','unit'
        "deviceCpuStatsHashrateCore1":deviceCpuStatsHashrateCore[1], //'hashRate','unit'
        "deviceCpuStatsHashrateCore2":deviceCpuStatsHashrateCore[2], //'hashRate','unit'
        "deviceCpuStatsHashrateCore3":deviceCpuStatsHashrateCore[3], //'hashRate','unit'
        "deviceCpuStatsHashrateCore4":deviceCpuStatsHashrateCore[4], //'hashRate','unit'
        "deviceCpuStatsHashrateCore5":deviceCpuStatsHashrateCore[5], //'hashRate','unit'
        "deviceCpuStatsHashrateCore6":deviceCpuStatsHashrateCore[6], //'hashRate','unit'
        "deviceCpuStatsHashrateCore7":deviceCpuStatsHashrateCore[7], //'hashRate','unit'
        
        "deviceGpuStatsOverallHashrate":deviceGpuStatsOverallHashrate,
        "deviceGpuStatsHashrate0":deviceGpuStatsHashrate[0], //'hashRate','unit'
        "deviceGpuStatsHashrate1":deviceGpuStatsHashrate[1], //'hashRate','unit'
        "deviceGpuStatsHashrate2":deviceGpuStatsHashrate[2], //'hashRate','unit'
        "deviceGpuStatsHashrate3":deviceGpuStatsHashrate[3], //'hashRate','unit'
    }];
    
    mainWindow.webContents.send('updateHTML', data);

}

//Catch StartMining Btn
ipcMain.on('startMining', function(e,data){
    const miningDevice = data[0].miningDevice;
    var options = "";
    options = options.concat(' -o ', data[0].miningSettingsPool);
    options = options.concat(' -u ', data[0].miningSettingsUsername);
    options = options.concat(' -p ', data[0].miningSettingsPassword);
    if ( miningDevice == "CPU"){
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
    if ( miningDevice == "GPU"){
        options = options.concat(' -a ', data[0].miningSettingsAlgoGPU);
        
        if (data[0].opt_miningSettingsGpuLaunchConfig.toString() == "true")
            options = options.concat(' -l ', data[0].miningSettingsGpuLaunchConfig);
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
    }

    if (data[0].opt_miningSettingsRetries.toString() == "true")
        options = options.concat(' --retries ', data[0].miningSettingsRetries);
    
    options = options.concat(' --no-color ');

        console.log("options  =  " + options);
    
    

    //async with cmd output data
    var dataCallback = function(data) {

        console.log(data);
        mainWindow.webContents.send('consoleOutput', data);

        //parse output for CPUminer
        miningStatsTimestamp = sscanf(data.toString(),'[%d-%d-%d %d:%d:%d]','year','month','day','hour','miunte','second');//year,month,day hour:miunte:second
            //console.log(timestamp);
        var message = data.slice(data.search("]")+2)
        // console.log(message);
        
            // message = stdout with out timestamp
            if (message.search("CPU") !== -1){
                var cpuHash = sscanf(message.toString(),'CPU #%d: %f %s','core','hashRate','unit');

                deviceCpuStatsHashrateCore[cpuHash.core] = [cpuHash.hashRate, cpuHash.unit];
            }
            if (message.search("Stratum difficulty") !== -1){
                var stratumDiff = sscanf(message.toString(),'Stratum difficulty set to %d (%f)','stratum_diff','targetdiff');
                miningStatsStratumDiff = stratumDiff;
            }
            if (message.search("accepted:") !== -1){
                var accepted = sscanf(message.toString(),'accepted: %u/%u (diff %f), %f %s %s%s','accepted_count' , 'total_count' , 'sharediff' , 'hashrate','hashrateunit', 'flag', 'solved');
                miningStatsPoolCpuAccepted = accepted;
            }
            if (message.search(" block ") !== -1){
                var accepted = sscanf(message.toString(),'%s block %d, diff %f'  ,	'algo_name', 'block_number', 'netinfo');
                miningStatsPoolBlock = accepted;
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
                LOG_NOTICE
                    "accepted: %lu/%lu (%s), %s %s%s"   ,   accepted_count , (accepted_count+rejected_count) , suppl , hashrate, flag, solved;
                                                                suppl       =   "diff %.3f"         ,   sharediff
                                                                           |=   "%.2f%%"            ,   100. * accepted_count / (accepted_count + rejected_count))
                                                                hashrate    =   %f %s 
                                                                flag        =   "YAY" | "BOO"
                                                                solved      =   " solved: %u"       ,   solved_count
                LOG_BLUE
                    "%s block %d, %s"                   ,	lgo_names[opt_algo], work->height, netinfo
                                                                netinfo     =   "diff %.2f"         ,   net_diff
                                                                           |=   "diff %.2f, net "   ,   net_diff,srate
                    "Starting on %s"                    ,   stratum.url
                LOG_WARNING
                    "Stratum difficulty set to %g%s"    ,   stratum_diff, sdiff
                                                                sdiff       =   " (%.5f)"           ,    work->targetdiff
                    "Stratum connection timed out"
                    "Stratum connection interrupted"
            */


            //GPU #0: Intensity set to 19, 524288 cuda threads
            if (message.search("GPU") !== -1 && message.search(": Intensity set to ") !== -1) {
                var gpuSettings = sscanf(message.toString(),'GPU #%d: Intensity set to %d, %u cuda threads','core','intensity','cudaThreads');
                mainWindow.webContents.send('miningStatsGpuSettings', gpuSettings);
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    console.log(gpuSettings);
            }
            //GPU #0: EVGA GTX 750 Ti, 5989.90 kH/s
            if (message.search("GPU") !== -1 && message.search("kH/s") !== -1) {
                var gpuHash = [];
                gpuHash = gpuHash.concat(sscanf(message.toString(),'GPU #%d:','core').core);
                message = message.slice(message.search(","));
                gpuHash = gpuHash.concat(sscanf(message,' %f %s','hashRate','unit').hashRate,sscanf(message,' %f %s','hashRate','unit').unit);
                
                deviceGpuStatsHashrate[gpuHash[0]] = [gpuHash[1], gpuHash[2]];
            }
            //GPU #0: 1161 MHz 60.91 MH/W 0W 48C FAN 42%
            if (message.search("GPU") !== -1 && message.search("Hz") !== -1 && message.search("H/W") !== -1) {
                var gpuStats = [];
                gpuStats = sscanf(message.toString(),'GPU #%d: %d %s %f %s %f%s %f%s %s %d%','core','clockSpeed','clockUnits','hashWattRate','hashWattRateUnits','unk1','unk2','temp','tempUnits','fan','fanSpeedPercent');
                console.log(gpuStats);
                deviceGpuStats[gpuStats.core] = gpuStats;
                    console.log(deviceGpuStats);
            }
            //%d miner thread%s started, using %s algorithm.
            updateHTML();
        

        
    };

    //runs ccminer through CMD


    if ( miningDevice == 'GPU'){
        console.log(__dirname+'/miners/ccminer/' + gpuMinerPath + options);
       nrc.run(__dirname+'/miners/ccminer/' + gpuMinerPath + options ,    { cwd: __dirname+'/miners/ccminer/', onData: dataCallback });    
    }
    else if (  miningDevice == 'CPU'){
       console.log(__dirname+'/miners/cpuminer/' + cpuMinerPath + options );
       nrc.run(__dirname+'/miners/cpuminer/' + cpuMinerPath + options,  { cwd: __dirname+'/miners/cpuminer/', onData: dataCallback });    
    }
    
});

//Catch stopMining Btn
ipcMain.on('stopMining', function(e){

    //async with cmd output data
    var dataCallback = function(data) {
        console.log(data);
    };
    
    nrc.run('Taskkill /IM '+ cpuMinerPath + ' /F');    
    nrc.run('Taskkill /IM '+ gpuMinerPath + ' /F'); 
   
    for(i=0;i<8;i++){
        deviceGpuStatsHashrate[i] = ['', ''];
        deviceCpuStatsHashrateCore[i] = ['', ''];
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
        file.close(cb)// close() is async, call cb after close completes.
        
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