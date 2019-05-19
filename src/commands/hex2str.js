const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('hex2str <hexString>')
      .description('Converts a hex string to its ascii representation.')
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
