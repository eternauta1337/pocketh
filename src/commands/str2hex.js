const Web3 = require('web3');
const chalk = require('chalk');

const signature = 'str2hex <asciiString>';
const description = 'Converts string to hex.';
const help = chalk`
Converts an ascii string to its hex representation.

{red Eg:}

{blue > pocketh str2hex Hello}
0x48656c6c6f000000000000000000000000000000000000000000000000000000
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((asciiString) => {
        const web3 = new Web3();
        const hexString = web3.utils.asciiToHex(asciiString);
        console.log(`${hexString}`);
      });
  }
};
