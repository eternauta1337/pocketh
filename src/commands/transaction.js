const getWeb3 = require('../utils/getWeb3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('transaction <networkUrl> <txHash>')
      .description('Gets a transaction given its hash.')
      .action(async (networkUrl, txHash) => {

        // Input validation.
        if(!validateUtil.bytes32(txHash))
          throw new Error(`Invalid txHash: ${txHash}`);

        const web3 = await getWeb3(networkUrl);
        const tx = await web3.eth.getTransaction(txHash);
        console.log(`${txHash} => ${ JSON.stringify(tx, null, 2) }`);
      });
  }
};
