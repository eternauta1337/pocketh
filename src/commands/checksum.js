const program = require('commander');
const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('checksum <address>')
      .description('Checksums an address.')
      .action((address) => {
        const web3 = new Web3();
        console.log(web3.utils.toChecksumAddress(address));
      });
  }
};
