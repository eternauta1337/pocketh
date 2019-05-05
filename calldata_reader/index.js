const program = require('commander');

program
  .version('0.1.0')
  .command('read [calldata]')
  .action((calldata) => {

    // Validate input.
    // TODO

    // Parse calldata.
    if(calldata) {

      // Extract function selector.
      const selector = '0x' + calldata.substring(2, 10);
      console.log(`Selector:`, selector);

      // Extract words.
      let idx = 10;
      let position = 0;
      while(idx <= calldata.length) {
        const value = '0x' + calldata.substring(idx, idx + 64);
        console.log(
          '0x' + position.toString(16).padStart(4, '0') + ":", 
          value
        );
        position += 32;
        idx += position * 2;
      }
    }
  });

program.parse(process.argv);
