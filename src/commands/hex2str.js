const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'hex2str <hexString>';
const description = 'Converts hex to string.';
const help = chalk`
Converts a hex string to its ascii representation.

{red Eg:}

{blue > pocketh hex2str 0x48656c6c6f}
Hello
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

        const web3 = new Web3();
        const asciiString = web3.utils.toAscii(hexString);
        console.log(`${asciiString}`);
      });
  }
};
