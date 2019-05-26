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
Relevant Solidity documentation: https://solidity.readthedocs.io/en/v0.5.8/miscellaneous.html?highlight=storage#layout-of-state-variables-in-storage

The command retrieves the stored value in hex, but also tries to interpret it in decimal and ascii.

{red Eg:}

To read simple values (i.e. values that are stored in an entire slot):
{blue > pocketh storage ropsten 0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b 0}
slot: 0
slot (hex): 0x0000000000000000000000000000000000000000000000000000000000000000
value: 0x000000000000000000000000000000000000000000000000000000000000000f
  (dec?): 15
	(str?):

To read packed values (i.e. values that are stored in part of a slot)
{blue > pocketh storage localhost address 1 --range 16,32}
...

To read mappings:
{blue > pocketh storage ropsten 0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b 5 --key 0xbCcc714d56bc0da0fd33d96d2a87b680dD6D0DF6}
...

To read arrays:
{blue > pocketh storage ropsten 0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b 7 --offset 1}
...

To read a mapping of structs:
{blue > pocketh storage ropsten 0xf1f5896ace3a78c347eb7eab503450bc93bd0c3b 6 --key 0xbCcc714d56bc0da0fd33d96d2a87b680dD6D0DF6 --offset 1}
...
`;

let web3;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .option(`-r, --range <range>`, `Specify a range 'start,len' in bytes to read within the slot.`)
      .option(`-k, --key <key>`, `Specify a key to read storage from a mapping.`)
      .option(`-o, --offset <offset>`, `Specify an offset to read storage from an array.`)
      .action(async (networkUrl, contractAddress, storageSlot, options) => {
        console.log(`slot: ${storageSlot}`);

        // Input validation.
        if(!validateUtil.address(contractAddress))
          throw new Error(`Invalid contract address: ${contractAddress}`);

        // Connect to network.
        web3 = await getWeb3(networkUrl);

        // Convert the slot to hex and pad it.
        let hexSlot = padWord(web3.utils.numberToHex(storageSlot));
        console.log(`slot (hex): ${hexSlot}`);

        // If a key is specified, combine the key and the storage slot with a hash,
        // so that the new slot = keccak256(key . slot)
        let slotHasBeenHashed = false;
        if(options.key) {
          slotHasBeenHashed = true;
          hexSlot = web3.utils.soliditySha3(padWord(options.key), hexSlot);
          console.log(`slot (key): ${hexSlot}`);
        }

        // If an offset is specified, the new slot = keccak(slot) + offset
        // NOTE: If the slot is already a hash, i.e. from a mapping, then just apply the offset.
        if(options.offset) {
          if(!slotHasBeenHashed) hexSlot = web3.utils.soliditySha3(hexSlot);
          hexSlot = `0x${bigHexAdd(hexSlot, options.offset)}`;
          console.log(`slot (offset): ${hexSlot}`);
        }

        // Read storage.
        const value = padWord(await web3.eth.getStorageAt(contractAddress, hexSlot));
        console.log(`value: ${value}`);

        // Interpret the value stored at the slot, or part of the slot.
        if(options.range) readRange(value, options.range);
        else interpretHexValue(value);
      });
  }
};

function padWord(value) {
  let padded = web3.utils.padLeft(stringUtil.remove0x(value), 64, '0');
  if(!padded.includes('0x')) padded = `0x${padded}`;
  return padded;
}

function readRange(value, range) {
  const comps = range.split(',');
  const start = 2 + parseInt(comps[0], 10) * 2;
  const end = start + parseInt(comps[1], 10) * 2;
  const subvalue = `0x` + value.substring(start, end);
  console.log(`subvalue: ${subvalue}`);
  interpretHexValue(subvalue);
}

function interpretHexValue(hexValue) {
  const asDec = new BN(stringUtil.remove0x(hexValue), 16).toString(10);
  const asStr = web3.utils.toAscii(hexValue);
  console.log(`  (dec?): ${asDec}`);
  console.log(`  (str?): ${asStr}`);
}

function bigHexAdd(bighex, decIncrement) {
  const h = new BN(bighex, 16);
  const i = new BN(decIncrement, 10);
  const a = h.add(i);
  return a.toString(16);
}
