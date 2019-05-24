const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'uint2hex <decNumber>';
const description = 'Converts uint to hex.';
const help = chalk`
Converts a positive integer in base 10 to its hexadecimal representation.

{red Eg:}

{blue > pocketh uint2hex 42}
0x2a
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((decNumber) => {

        // Input validation.
        if(!validateUtil.positiveInteger(decNumber))
          throw new Error(`Invalid positive integer: ${decNumber}`);

        const web3 = new Web3();
        const hexString = web3.utils.numberToHex(decNumber);
        console.log(hexString);
      });
  }
};
