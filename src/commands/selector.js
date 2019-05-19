const abiUtil = require('../utils/abiUtil.js');

module.exports = {
  register: (program) => {
    program
      .command('selector <signature>')
      .description('Calculates the selector for a given function signature. Please use quotes around the signature, e.g. "value(address)"')
      .action((signature) => {
        if(signature.includes('returns')) throw new Error('The return type of a function is not part of the signature!');
        console.log(abiUtil.getSelector(signature));
      });
  }
};
