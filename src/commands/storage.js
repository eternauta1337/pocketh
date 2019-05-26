const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const stringUtil = require('../utils/stringUtil.js');
const BN = require('bn.js');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'storage <networkUrl> <contractAddress> <storageSlot>';
const description = 'Reads the storage of a contract.';
const help = chalk`
Query the storage of a contract at a given slot.

{red Eg:}

{blue > pocketh storage mainnet 0x960b236A07cf122663c4303350609A66A7B288C0 1}
slot: 1
value: 0x417261676f6e204e6574776f726b20546f6b656e000000000000000000000028
  (dec): 29602427981302164123697046959722460721672829354281340829100810951182126153768
  (str): Aragon Network Token(

{blue pocketh storage ropsten 0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b 5 --mapping 0xbCcc714d56bc0da0fd33d96d2a87b680dD6D0DF6}
slot: 5
value: 0x0000000000000000000000000000000000000000000000000000000000000000
(dec): 0
(str): 
mapping key: 0xbCcc714d56bc0da0fd33d96d2a87b680dD6D0DF6
mapping slot: 0xafef6be2b419f4d69d56fe34788202bf06650015554457a2470181981bcce7ef
mapping value: 0x0000000000000000000000000000000000000000000000000000000000000058
(dec): 88
(str): X
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .option(`-a, --array <index>`, `Specify the index of the dynamic array to query.`)
      .option(`-m, --mapping <key>`, `Specify the key of the dynamic mapping to query.`)
      .option(`-r, --range <range>`, `Specify a range 'start,len' in bytes to read within the slot.`)
      .action(async (networkUrl, contractAddress, storageSlot, options) => {
        console.log(`slot: ${storageSlot}`);

        // Input validation.
        if(!validateUtil.address(contractAddress))
          throw new Error(`Invalid contract address: ${contractAddress}`);

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Read storage.
        let value = await web3.eth.getStorageAt(contractAddress, storageSlot);
        value = web3.utils.padLeft(value, 64, '0');
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
          let value = await web3.eth.getStorageAt(contractAddress, storageSlot);
          value = web3.utils.padLeft(value, 64, '0');
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
          let value = await web3.eth.getStorageAt(contractAddress, storageSlot);
          value = web3.utils.padLeft(value, 64, '0');
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
