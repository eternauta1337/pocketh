const abiUtil = require('../utils/abiUtil.js');
const chalk = require('chalk');

const signature = 'selector <signature>';
const description = 'Calculates a selector.';
const help = chalk`
Calculates the selector for a given function signature. Please use quotes around the signature, e.g. "value(address)"

{red Eg:}

{blue > pocketh selector 'transfer(address,uint256)'}
0xa9059cbb
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((signature) => {
        if(signature.includes('returns')) throw new Error('The return type of a function is not part of the signature!');
        console.log(abiUtil.getSelector(signature));
      });
  }
};
