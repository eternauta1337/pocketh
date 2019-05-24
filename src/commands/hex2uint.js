const BN = require('bn.js');
const stringUtil = require('../utils/stringUtil.js');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'hex2uint <hexString>';
const description = 'Converts hex to uint.';
const help = chalk`
Converts a hex number to its positive integer base 10 representation.

{red Eg:}

{blue > pocketh hex2uint 0x7a120}
500000
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((hexString) => {

        // Input validation.
        if(!validateUtil.hex(hexString))
          throw new Error(`Invalid hex string: ${hexString}`);

        const decString = (new BN(stringUtil.remove0x(hexString), 16)).toString(10);
        console.log(decString);
      });
  }
};
