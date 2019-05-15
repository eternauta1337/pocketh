const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');

module.exports = {
  register: (program) => {
    program
      .command('storage <networkUrl> <contractAddress> [storageSlot]')
      .description('Query the storage of a contract deployed at a given address.')
      .action(async (networkUrl, contractAddress, storageSlot) => {

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Read storage.
        const value = await web3.eth.getStorageAt(contractAddress, storageSlot);
        console.log(`storage slot ${storageSlot}: ${value}`);
      });
  }
};
