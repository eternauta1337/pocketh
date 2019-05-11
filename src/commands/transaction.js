const program = require('commander');
const getWeb3 = require('../utils/getWeb3');

module.exports = {
  register: (program) => {
    program
      .command('transaction <networkName> <txHash>')
      .description('Gets a transaction given its hash.')
      .action(async (networkName, txHash) => {
        const web3 = await getWeb3(networkName);
        const tx = await web3.eth.getTransaction(txHash);
        console.log(`${txHash} => ${ JSON.stringify(tx, null, 2) }`);
      });
  }
};
