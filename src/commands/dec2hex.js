const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('dec2hex <decNumber>')
      .description('Converts a decimal number to its hex representation.')
      .action((decNumber) => {

        // Input validation.
        if(!validateUtil.integer(decNumber))
          throw new Error(`Invalid integer: ${decNumber}`);

        const web3 = new Web3();
        const hexString = web3.utils.numberToHex(decNumber);
        console.log(hexString);
      });
  }
};
