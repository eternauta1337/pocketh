const BN = require('bn.js');
const stringUtil = require('../utils/stringUtil.js');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('hex2uint <hexString>')
      .description('Converts a hex number to its positive integer base 10 representation.')
      .action((hexString) => {

        // Input validation.
        if(!validateUtil.hex(hexString))
          throw new Error(`Invalid hex string: ${hexString}`);

        const decString = (new BN(stringUtil.remove0x(hexString), 16)).toString(10);
        console.log(`${hexString} => ${decString}`);
      });
  }
};
