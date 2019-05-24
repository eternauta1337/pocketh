const chalk = require('chalk');
const etherscanApi = require('../utils/etherscanApi');
const validateUtil = require('../utils/validateUtil');
const fs = require('fs');

const signature = 'getcode <deployedAddress> [targetFilePath]';
const description = 'Retrieves a contract\'s code from Etherscan.';
const help = chalk`
Retrieves a contract's source from Etherscan (mainnet only).
If a targetFilePath is specified, contents will be written to the specified file, otherwise they will simply be sent to stdout.

{red Eg:}

{blue > pocketh getcode 0x06012c8cf97bead5deae237070f9587f8e7a266d kit.sol}
Retrieving source code at 0x06012c8cf97bead5deae237070f9587f8e7a266d from etherscan...
Source code written to kit.sol

`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (contractAddress, targetFilePath) => {

        // Input validation.
        if(!validateUtil.address(contractAddress))
          throw new Error(`Invalid contract address: ${contractAddress}`);

        // Retrieve the code.
        console.log(`Retrieving source code at ${contractAddress} from etherscan...`);
        const code = await etherscanApi.getSourceCode(contractAddress);
        
        // Write code to file, or send it ot stdout.
        if(targetFilePath) {
          fs.writeFileSync(targetFilePath, code);
          console.log(`Source code written to ${targetFilePath}`);
        }
        else console.log(code);
      });
  }
};
