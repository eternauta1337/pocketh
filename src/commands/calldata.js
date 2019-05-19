const validateUtil = require('../utils/validateUtil');

module.exports = {
  register: (program) => {
    program
      .command(`calldata <data>`)
      .description('Split up calldata into a more readable format.')
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
