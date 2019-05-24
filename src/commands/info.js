const getWeb3 = require('../utils/getWeb3');
const getEtherscan = require('../utils/getEtherscan');
const BN = require('bn.js');
const chalk = require('chalk');

const signature = 'info <networkUrlOrName>';
const description = 'Retrieves info about a network.';
const help = chalk`
Retrieves info about a network using web3 and etherscan.

{red Eg:}

{blue > pocketh info mainnet}
Collecting network info for mainnet...
  latestBlock: 7823193
  ethPrice: 253.35 USD
  gasPrice: 559.755813888 Gwei
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
        const etherscan = await getEtherscan(networkUrlOrName);
        // console.log(etherscan); // Uncomment to see api
        const ethPrice = await etherscan.stats.ethprice();
        info.ethPrice = `${ethPrice.result.ethusd} USD`;
        const gasPrice = await etherscan.proxy.eth_gasPrice();
        const gasPriceWei = new BN(gasPrice.result, 16).toString(10);
        const gasPriceGWei = web3.utils.fromWei(gasPriceWei, 'Gwei');
        info.gasPrice = `${gasPriceGWei} Gwei`;

        // Output collected info.
        Object.keys(info).map(key => {
          console.log(`  ${key}: ${info[key]}`);
        });
      });
  }
};
