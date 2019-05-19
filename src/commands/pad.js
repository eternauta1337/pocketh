const Web3 = require('web3');
const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command('pad <value> [direction] [amount] [char]')
      .description('Pads value left or right with a given amount. Defaults to 64 (32 bytes), left.')
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
