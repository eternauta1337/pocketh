const program = require('commander');
const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('selector <signature>')
      .description('Calculates the selector for a given function signature. Please use quotes around the signature, e.g. "value(address)"')
      .action((signature) => {
        if(signature.includes('returns')) throw new Error('The return type of a function is not part of the signature!');
        const web3 = new Web3();
        console.log(`${getSelector(signature, web3)}`);
      });
  }
};

function getSelector(signature, web3) {
  const hash = web3.utils.sha3(signature);
  return hash.substring(0, 10);
}
