# MinerWrapper
----------

A Miner Wrapper for GPU: NIVIDA, AMD and CPU support For mining Dallar 

This Wrapper incorprates

Windows Miners
 - NVIDIA(Cuda)
	 - x32 arch
		 - [CCminer is using tpruvot (2.2.3)](https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x86-2.2.3-cuda9.7z)
	 - x64 arch
		 - [CCminer is using tpruvot (2.2.3)](https://github.com/tpruvot/ccminer/releases/download/2.2.3-tpruvot/ccminer-x64-2.2.3-cuda9.7z)

CPU miners
 - [Core 2 (1.3.1)](https://github.com/tpruvot/cpuminer-multi/releases)
 - [Core i7 (1.3.1)](https://github.com/tpruvot/cpuminer-multi/releases)
 - [avx2 (1.3.1)](https://github.com/tpruvot/cpuminer-multi/releases)

Using Node.js
Written using [VS Code](https://code.visualstudio.com/)

With the NPM packages:

 - [electron (1.7.10)](https://www.npmjs.com/package/electron)
 - [cross-unzip (0.2.1)](https://www.npmjs.com/package/cross-unzip)
 - [node-run-cmd (1.0.1)](https://www.npmjs.com/package/node-run-cmd)
 - [systeminformation (3.33.12)](https://www.npmjs.com/package/systeminformation)
 - [win-7zip (0.1.1)](https://www.npmjs.com/package/win-7zip)

Developers:

 - SwiftCurse

To do:

GET THE GUI TO LOOK BETTER!

Linux Miners
  
 - CPU miner
	 - NVIDIA(Cuda)
		 - CCminer is using [pruvot](https://github.com/tpruvot/ccminer/blob/linux/INSTALL)

add node support

 - systeminformation
	 - OSX: [osx-temperature-sensor (1.0.1)](https://www.npmjs.com/package/osx-temperature-sensor) 
	 - LINUX: '$ sudo apt-get install lm-sensors'