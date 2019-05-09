const program = require('commander');
const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');

module.exports = {
  register: (program) => {
    program
      .command(`blockdate <networkName> <blockNumber>`)
      .description('Get the date of a block number in the given network.')
      .action(async (networkName, blockNumber) => {
        
        // Validate input.
        blockNumber = parseInt(blockNumber , 10);
        // TODO

        // Display info.
        console.log(`Get block date:`);
        console.log(`  networkName:`, networkName);
        console.log(`  blockNumber:`, blockNumber);

        // Connect to network.
        const web3 = await getWeb3(networkName);

        // Get block info.
        const block = await web3.eth.getBlock(blockNumber);
        const date = new Date(parseInt(block.timestamp, 10) * 1000);
        console.log(`Date for block #${blockNumber} => ${date}`);
      });
  }
};
