const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');
const BN = require('bn.js');

module.exports = {
  register: (program) => {
    program
      .command('int2hex <decNumber>')
      .option('-n, --negative', 'Negative number.')
      .description('Converts an integer in base 10 to its hexadecimal representation.')
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
