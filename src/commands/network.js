const program = require('commander');
const getWeb3 = require('../utils/getWeb3');

module.exports = {
  register: (program) => {
    program
      .command('network <networkUrl>')
      .description('Retrieves info about a network.')
      .action(async (networkUrl) => {
        const info = {};
        const web3 = await getWeb3(networkUrl);
        const latest = await web3.eth.getBlock('latest');
        info.latestBlock = await web3.eth.getBlockNumber();
        info.gasLimit = latest.gasLimit;
        info.gasPrice = await web3.eth.getGasPrice();
        console.log(`${networkUrl}: ${ JSON.stringify(info, null, 2) }`);
      });
  }
};
