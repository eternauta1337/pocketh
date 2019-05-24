const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'calldata <data>';
const description = 'Splits up calldata into a more readable format.';
const help = chalk`
Breaks up passed call data such as:

{red Eg:}

{blue > pocketh calldata 0xad1c61fd000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000}
Selector: 0xad1c61fd
0x0000: 0x000000000000000000000000000000000000000000000000000000000000002a
0x0020: 0x0000000000000000000000000000000000000000000000000000000000000040
0x0040: 0x0000000000000000000000000000000000000000000000000000000000000005
0x0060: 0x68656c6c6f000000000000000000000000000000000000000000000000000000
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((data) => {

        // Input validation.
        if(!validateUtil.hex(data))
          throw new Error(`Invalid call data: ${data}`);
        
        // Parse calldata.
        if(data) {

          // Extract function selector.
          const selector = '0x' + data.substring(2, 10);
          process.stdout.write(`Selector: ${selector}\n`);

          // Extract words.
          let idx = 10;
          let position = 0;
          while(idx < data.length) {
            const value = '0x' + data.substring(idx, Math.min(idx + 64, data.length));
            const posStr = '0x' + position.toString(16).padStart(4, '0');
            process.stdout.write(`${posStr}: ${value}\n`);
            position += 32;
            idx += 64;
          }
        }
      });
  }
};
