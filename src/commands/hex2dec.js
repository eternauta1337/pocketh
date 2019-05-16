const program = require('commander');
const BN = require('bn.js');
const remove0x = require('../utils/remove0x.js');

module.exports = {
  register: (program) => {
    program
      .command('hex2dec <hexString>')
      .description('Converts a hex number to its decimal representation.')
      .action((hexString) => {
        const decString = (new BN(remove0x(hexString), 16)).toString(10);
        console.log(`${hexString} => ${decString}`);
      });
  }
};
