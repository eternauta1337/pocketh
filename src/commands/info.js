const getWeb3 = require('../utils/getWeb3');
const BN = require('bn.js');
const chalk = require('chalk');
const etherscanApi = require('../utils/etherscanApi');

const signature = 'info <networkUrlOrName>';
const description = 'Retrieves info about a network.';
const help = chalk`
Retrieves info about a network using web3 and Etherscan.
NOTE: Etherscan info is only available if networkUrlOrName is 'mainnet'.

{red Eg:}

{blue > pocketh info mainnet}
Collecting network info for mainnet...
  latestBlock: 7823193
  ethPrice: 253.35 USD
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (networkUrlOrName) => {
        console.log(`Collecting network info for ${networkUrlOrName}...`);

        // All info will be collected here.
        const info = {};

        // Collect info with web3 connection.
        const web3 = await getWeb3(networkUrlOrName);
        info.latestBlock = await web3.eth.getBlockNumber();

        // Collect info with etherscan.
        if(networkUrlOrName === 'mainnet') {
          info.ethPrice = `${await etherscanApi.getEtherPrice()} USD`;
        }

        // Output collected info.
        Object.keys(info).map(key => {
          console.log(`  ${key}: ${info[key]}`);
        });
      });
  }
};
