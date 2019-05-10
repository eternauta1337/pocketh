const program = require('commander');
const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('hex2str <hexString>')
      .description('Converts a hex string to its ascii representation.')
      .action((hexString) => {
        const web3 = new Web3();
        const asciiString = web3.utils.toAscii(hexString);
        console.log(`${hexString} => ${asciiString}`);
      });
  }
};
