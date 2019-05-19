const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('checksum <address>')
      .description('Checksums an address.')
      .action((address) => {

        // Input validation.
        if(!validateUtil.address(address))
          throw new Error(`Invalid address: ${address}`);

        const web3 = new Web3();
        console.log(web3.utils.toChecksumAddress(address));
      });
  }
};
