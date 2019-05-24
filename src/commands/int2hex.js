const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');
const BN = require('bn.js');
const chalk = require('chalk');

const signature = 'int2hex <decNumber>';
const description = 'Converts int to hex.';
const help = chalk`
Converts an integer in base 10 to its hexadecimal representation.

{red Eg:}

{blue > pocketh int2hex -n 42}
0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .option('-n, --negative', 'Negative number.')
      .action((decNumber, options) => {

        // Input validation.
        if(options.negative) decNumber = `-${decNumber}`;
        if(!validateUtil.integer(decNumber))
          throw new Error(`Invalid integer: ${decNumber}`);

        const web3 = new Web3();
        const hexString = (new BN(decNumber, 10)).toTwos(256).toString(16);
        console.log('0x' + hexString);
      });
  }
};
