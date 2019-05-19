const fs = require('fs');
const getArtifacts = require('../utils/getArtifacts');
const abiUtil = require('../utils/abiUtil');

module.exports = {
  register: (program) => {
    program
      .command(`selectors <contractPath>`)
      .description('List all the function selectors of the provided contract artifacts.')
      .action((contractPath) => {
        
        // Retrieve contract artifacts and abi.
        const contractArtifacts = getArtifacts(contractPath);        

        // Retrieve abi.
        const abi = contractArtifacts.abi;

        // Scan the abi and identify function signatures.
        abi.map((item) => {
          if(item.type === 'function') {
            const signature = item.signature || abiUtil.getAbiItemSignature(item);
            const hash = abiUtil.getAbiItemSigHash(item);
            process.stdout.write(`${hash}: ${signature}\n`);
          }
        });
      });
  }
};
