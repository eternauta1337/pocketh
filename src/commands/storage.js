const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const stringUtil = require('../utils/stringUtil.js');
const BN = require('bn.js');

module.exports = {
  register: (program) => {
    program
      .command('storage <networkUrl> <contractAddress> <storageSlot>')
      .option(`-a, --array <index>`, `Specify the index of the dynamic array to query.`)
      .option(`-m, --mapping <key>`, `Specify the key of the dynamic mapping to query.`)
      .option(`-r, --range <range>`, `Specify a range 'start,len' in bytes to read within the slot.`)
      .description('Query the storage of a contract at a given slot.')
      .action(async (networkUrl, contractAddress, storageSlot, options) => {
        console.log(`slot: ${storageSlot}`);

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Read storage.
        const value = await web3.eth.getStorageAt(contractAddress, storageSlot);
        console.log(`value: ${value}`);
        if(options.range) readRange(value, options.range, web3);
        else interpretHexValue(value, web3);

        // Dynamic arrays.
        if(options.array) {
          console.log(`array index: ${options.array}`);

          // Calculate dynamic slot.
          const paddedStorageSlot = web3.utils.padLeft(storageSlot, 64, '0');
          const hashOfPadddedStorageSlot = web3.utils.soliditySha3(paddedStorageSlot);
          storageSlot = `0x` + bigHexAdd(hashOfPadddedStorageSlot, options.array);
          console.log(`array slot: ${storageSlot}`);

          // Read dynamic storage.
          const value = await web3.eth.getStorageAt(contractAddress, storageSlot);
          console.log(`array value: ${value}`);
          if(options.range) readRange(value, options.range, web3);
          else interpretHexValue(value, web3);
        }
        
        // Dynamic mappings.
        if(options.mapping) {
          console.log(`mapping key: ${options.mapping}`);

          // Calculate dynamic slot.
          const paddedMappingKey = `0x` + web3.utils.padLeft(stringUtil.remove0x(options.mapping), 64, '0');
          const paddedStorageSlot = `0x` + web3.utils.padLeft(storageSlot, 64, '0');
          storageSlot = web3.utils.soliditySha3(paddedMappingKey, paddedStorageSlot);
          console.log(`mapping slot: ${storageSlot}`);

          // Read dynamic storage.
          const value = await web3.eth.getStorageAt(contractAddress, storageSlot);
          console.log(`mapping value: ${value}`);
          if(options.range) readRange(value, options.range, web3);
          else interpretHexValue(value, web3);
        }
      });
  }
};

function readRange(value, range, web3) {
  const comps = range.split(',');
  const start = 2 + parseInt(comps[0], 10) * 2;
  const end = start + parseInt(comps[1], 10) * 2;
  const subvalue = `0x` + value.substring(start, end);
  console.log(`subvalue: ${subvalue}`);
  interpretHexValue(subvalue, web3);
}

function interpretHexValue(hexValue, web3) {
  const asDec = new BN(stringUtil.remove0x(hexValue), 16).toString(10);
  const asStr = web3.utils.toAscii(hexValue);
  console.log(`  (dec): ${asDec}`);
  console.log(`  (str): ${asStr}`);
}

function bigHexAdd(bighex, decIncrement) {
  const h = new BN(bighex, 16);
  const i = new BN(decIncrement, 10);
  const a = h.add(i);
  return a.toString(16);
}
