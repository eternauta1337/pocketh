const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');

module.exports = {
  register: (program) => {
    program
      .command(`blockdate <networkUrl> <blockNumber>`)
      .description('Get the date of a block number in the given network.')
      .action(async (networkUrl, blockNumber) => {
        
        // Validate input.
        blockNumber = parseInt(blockNumber , 10);

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Get block info.
        const block = await web3.eth.getBlock(blockNumber);
        const date = new Date(parseInt(block.timestamp, 10) * 1000);
        process.stdout.write(`${date}\n`);
      });
  }
};
