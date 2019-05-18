const BN = require('bn.js');
const stringUtil = require('../utils/stringUtil.js');

module.exports = {
  register: (program) => {
    program
      .command('hex2dec <hexString>')
      .description('Converts a hex number to its decimal representation.')
      .action((hexString) => {
        const decString = (new BN(stringUtil.remove0x(hexString), 16)).toString(10);
        console.log(`${hexString} => ${decString}`);
      });
  }
};
