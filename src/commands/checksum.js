const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'checksum <address>';
const description = 'Checksums an address.';
const help = chalk`
Converts a non checksummed address to it's checksummed version.

{red Eg:}

{blue > pocketh checksum 0x06012c8cf97bead5deae237070f9587f8e7a266d}
0x06012c8cf97BEaD5deAe237070F9587f8E7A266d

`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((address) => {

        // Input validation.
        if(!validateUtil.address(address))
          throw new Error(`Invalid address: ${address}`);

        const web3 = new Web3();
        console.log(web3.utils.toChecksumAddress(address));
      });
  }
};
