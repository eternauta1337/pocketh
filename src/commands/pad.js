const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'pad <value> [direction] [amount] [char]';
const description = 'Pads hex numbers.';
const help = chalk`
Pads value left or right with a given amount. Defaults to 64 (32 bytes), left.

{red Eg:}

{blue > pocketh pad 0x06012c8cf97bead5deae237070f9587f8e7a266d left 64}
0x00000000000000000000000006012c8cf97bead5deae237070f9587f8e7a266d
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((value, direction, amount, char) => {

        // Input validation.
        if(!validateUtil.hex(value))
          throw new Error(`Invalid hex value: ${value}`);

        const web3 = new Web3();

        // Defaults.
        direction = direction || 'left';
        amount = amount || 64;
        char = char || '0';

        // Validate direction.
        if(direction !== 'right' && direction !== 'left') {
          throw new Error('Invalid direction. Please use "right" for padRight and "left" for padLeft.');
        }

        // Pad!
        const func = direction === 'left' ? web3.utils.padLeft : web3.utils.padRight;
        console.log(func(value, amount, char));
      });
  }
};
