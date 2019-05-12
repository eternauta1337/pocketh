const program = require('commander');
const getWeb3 = require('../utils/getWeb3');

module.exports = {
  register: (program) => {
    program
      .command('block <networkUrl> [blockHashOrNumber]')
      .description('Gets a block given its number or hash.')
      .action(async (networkUrl, blockHashOrNumber) => {
        const web3 = await getWeb3(networkUrl);
        if(!blockHashOrNumber) blockHashOrNumber = await web3.eth.getBlockNumber();
        const tx = await web3.eth.getBlock(blockHashOrNumber);
        console.log(`${blockHashOrNumber} => ${ JSON.stringify(tx, null, 2) }`);
      });
  }
};
