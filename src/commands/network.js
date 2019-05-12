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
        info.latestBlock = await web3.eth.getBlockNumber();
        info.gasPrice = await web3.eth.getGasPrice();
        console.log(`${networkUrl}: ${ JSON.stringify(info, null, 2) }`);
      });
  }
};
