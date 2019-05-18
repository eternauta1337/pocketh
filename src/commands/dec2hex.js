const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('dec2hex <decNumber>')
      .description('Converts a decimal number to its hex representation.')
      .action((decNumber) => {
        const web3 = new Web3();
        const hexString = web3.utils.numberToHex(decNumber);
        console.log(hexString);
      });
  }
};
