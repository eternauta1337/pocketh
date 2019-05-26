const getWeb3 = require('../utils/getWeb3');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'transaction <networkUrl> <txHash>';
const description = 'Gets info about a transaction.';
const help = chalk`
Gets a transaction given its hash.

{red Eg:}

{blue > pocketh transaction mainnet 0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b}
0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b => \{
  "blockHash": "0xcabafc45ffe90a54faac651195a5100029d398c08ef81d7b556e412d03f16002",
  "blockNumber": 7729790,
  "from": "0x992E68379eFC08A1c7B8C1E3bD335E87BF9A4b7B",
  "gas": 104068,
  "gasPrice": "1100000000",
  "hash": "0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b",
  "input": "0xa9059cbb000000000000000000000000eeff3793df0685d54805b8807d1fd63cc66f9c2f000000000000000000000000000000000000000000000000000000000015011d",
  "nonce": 1664,
  "r": "0xf924c5771646d973657a7cdf3dd58a41eb6956c8a855fc32362d37490070244a",
  "s": "0x6b0d1df736e24e16b52763e95fdd1d0f64571d172b426888202bb6cb09440b20",
  "to": "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
  "transactionIndex": 8,
  "v": "0x26",
  "value": "0"
\}
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (networkUrl, txHash) => {

        // Input validation.
        if(!validateUtil.bytes32(txHash))
          throw new Error(`Invalid txHash: ${txHash}`);

        const web3 = await getWeb3(networkUrl);
        const tx = await web3.eth.getTransaction(txHash);
        console.log(JSON.stringify(tx, null, 2));
      });
  }
};
