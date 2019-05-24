const getWeb3 = require('../utils/getWeb3');
const validateUtil = require('../utils/validateUtil');

const signature = 'block <networkUrl> [blockHashOrNumber]';
const description = 'Gets info about a block.';
const help = `
Gets a block given its block number or hash in the specified network.
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

        // Input validation.
        if(!validateUtil.positiveInteger(blockHashOrNumber) && !validateUtil.bytes32(blockHashOrNumber))
          throw new Error(`Invalid blockHashOrNumber: ${blockHashOrNumber}`);

        const web3 = await getWeb3(networkUrl);

        if(!blockHashOrNumber) blockHashOrNumber = await web3.eth.getBlockNumber();
        const tx = await web3.eth.getBlock(blockHashOrNumber);
        console.log(`${blockHashOrNumber} => ${ JSON.stringify(tx, null, 2) }`);
      });
  }
};
