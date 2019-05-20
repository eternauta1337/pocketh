const stringUtil = require('../utils/stringUtil.js');
const validateUtil = require('../utils/validateUtil');
const abiUtil = require('../utils/abiUtil.js');

module.exports = {
  register: (program) => {
    program
      .command('hex2int <hexString>')
      .description('Converts a hex number to its integer base 10 representation.')
      .action((hexString) => {

        // Input validation.
        if(!validateUtil.hex(hexString))
          throw new Error(`Invalid hex string: ${hexString}`);

        const decString = abiUtil.parseVariableValue('int', hexString);
        console.log(decString);
      });
  }
};
