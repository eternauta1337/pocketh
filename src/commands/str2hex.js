const program = require('commander');
const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('str2hex <asciiString>')
      .description('Converts an ascii string to its hex representation.')
      .action((asciiString) => {
        const web3 = new Web3();
        const hexString = web3.utils.asciiToHex(asciiString);
        console.log(`${asciiString} => ${hexString}`);
      });
  }
};
