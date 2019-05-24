const stringUtil = require('../utils/stringUtil.js');
const validateUtil = require('../utils/validateUtil');
const abiUtil = require('../utils/abiUtil.js');
const chalk = require('chalk');

const signature = 'hex2int <hexString>';
const description = 'Converts hex to int.';
const help = chalk`
Converts a hex number to its integer base 10 representation.

{red Eg:}

{blue > pocketh hex2int 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6}
-42
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

        const decString = abiUtil.parseVariableValue('int', hexString);
        console.log(decString);
      });
  }
};
