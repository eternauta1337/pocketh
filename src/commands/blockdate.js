const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'blockdate <networkUrl> <blockHashOrNumber>';
const description = 'Gets the date of a block.';
const help = chalk`
Gets the date of a block number in the given network.

{red Eg:}

{blue > pocketh blockdate mainnet 5000000}
Tue Jan 30 2018 10:41:33 GMT-0300 (Uruguay Standard Time)

`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
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
