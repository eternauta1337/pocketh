const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('uint2hex <decNumber>')
      .description('Converts a positive integer in base 10 to its hexadecimal representation.')
      .action((decNumber) => {

        // Input validation.
        if(!validateUtil.positiveInteger(decNumber))
          throw new Error(`Invalid integer: ${decNumber}`);

        const web3 = new Web3();
        const hexString = web3.utils.numberToHex(decNumber);
        console.log(hexString);
      });
  }
};
