const getWeb3 = require('../utils/getWeb3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('block <networkUrl> [blockHashOrNumber]')
      .description('Gets a block given its number or hash.')
      .action(async (networkUrl, blockHashOrNumber) => {

        // Input validation.
        if(!validateUtil.positiveInteger(blockHashOrNumber) && !validateUtil.bytes32(blockHashOrNumber))
          throw new Error(`Invalid blockHashOrNumber: ${blockHashOrNumber}`);

        const web3 = await getWeb3(networkUrl);

        if(!blockHashOrNumber) blockHashOrNumber = await web3.eth.getBlockNumber();
        const tx = await web3.eth.getBlock(blockHashOrNumber);
        console.log(`${blockHashOrNumber} => ${ JSON.stringify(tx, null, 2) }`);
      });
  }
}
