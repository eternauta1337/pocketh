const fs = require('fs');
const getArtifacts = require('../utils/getArtifacts');
const abiUtil = require('../utils/abiUtil');
const chalk = require('chalk');

const signature = 'selectors <contractPath>';
const description = 'Lists all selectors of a contract.';
const help = chalk`
List all the function selectors of the provided contract artifacts.

{red Eg:}

{blue > pocketh selectors test/artifacts/Test.json}
0x29e99f07: test(uint256)
0x3fa4f245: value()
0x5dce0fa6: granparent_value()
0xa6c56d47: parent2_value()
0xd8175b14: parent1_value()
0xf0686273: CONS()
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
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
