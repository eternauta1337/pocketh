const getWeb3 = require('../utils/getWeb3');

module.exports = {
  register: (program) => {
    program
      .command('info <networkUrlOrName>')
      .description('Retrieves info about a network.')
      .action(async (networkUrlOrName) => {

        // All info will be collected here.
        const info = {};

        // Collect info with web3.
        const web3 = await getWeb3(networkUrlOrName);
        info.latestBlock = await web3.eth.getBlockNumber();

        // Output collected info.
        console.log(`${networkUrlOrName}: ${ JSON.stringify(info, null, 2) }`);
      });
  }
};
