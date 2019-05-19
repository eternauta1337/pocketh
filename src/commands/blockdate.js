const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command(`blockdate <networkUrl> <blockHashOrNumber>`)
      .description('Get the date of a block number in the given network.')
      .action(async (networkUrl, blockHashOrNumber) => {
        
        // Validate input.
        if(!validateUtil.integer(blockHashOrNumber) && !validateUtil.bytes32(blockHashOrNumber))
          throw new Error(`Invalid blockHashOrNumber: ${blockHashOrNumber}`);

        blockHashOrNumber = parseInt(blockHashOrNumber , 10);

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Get block info.
        const block = await web3.eth.getBlock(blockHashOrNumber);
        const date = new Date(parseInt(block.timestamp, 10) * 1000);
        process.stdout.write(`${date}\n`);
      });
  }
};
