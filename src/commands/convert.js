const program = require('commander');
const Web3 = require('web3');

module.exports = {
  register: (program) => {
    program
      .command('convert [value] [sourceDenom] [destDenom]')
      .description('Converts a given Ether denomination into another. If no value is specified, will list all denominations. Default sourceDenom is wei. Default destDenom is ether.')
      .action((value, sourceDenom, destDenom) => {
        const web3 = new Web3();

        // If no value is given, list all denominations.
        if(!value) {
          console.log(units);
          return;
        }

        // Default denominations.
        sourceDenom = sourceDenom || 'wei';
        destDenom = destDenom || 'ether';

        // Identify units.
        if(!units[sourceDenom]) throw new Error(`Unrecognized source denomination: ${sourceDenom}.`);
        if(!units[destDenom]) throw new Error(`Unrecognized dest denomination: ${destDenom}.`);

        // Convert source to wei.
        const sourceWei = web3.utils.toWei(value, sourceDenom);

        // Convert source to dest.
        const dest = web3.utils.fromWei(sourceWei, destDenom);

        // Output.
        console.log(`${value} ${sourceDenom} = ${dest} ${destDenom}`);
      });
  }
};

const units = {
  wei:        '1',
  kwei:       '1000',
  Kwei:       '1000',
  babbage:    '1000',
  femtoether: '1000',
  mwei:       '1000000',
  Mwei:       '1000000',
  lovelace:   '1000000',
  picoether:  '1000000',
  gwei:       '1000000000',
  Gwei:       '1000000000',
  shannon:    '1000000000',
  nanoether:  '1000000000',
  nano:       '1000000000',
  szabo:      '1000000000000',
  microether: '1000000000000',
  micro:      '1000000000000',
  finney:     '1000000000000000',
  milliether: '1000000000000000',
  milli:      '1000000000000000',
  ether:      '1000000000000000000',
  kether:     '1000000000000000000000',
  grand:      '1000000000000000000000',
  mether:     '1000000000000000000000000',
  gether:     '1000000000000000000000000000',
  tether:     '1000000000000000000000000000000'
}
