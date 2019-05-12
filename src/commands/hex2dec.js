const program = require('commander');
const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('hex2dec <hexString>')
      .description('Converts a hex number to its decimal representation.')
      .action((hexString) => {
        const web3 = new Web3();
        const decString = web3.utils.hexToNumber(hexString);
        console.log(`${hexString} => ${decString}`);
      });
  }
};
