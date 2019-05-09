module.exports = {
  register: (program) => {
    program
      .command(`calldata <data>`)
      .description('Split up calldata into a more readable format.')
      .action((data) => {
        
        // Parse calldata.
        if(data) {

          // Extract function selector.
          const selector = '0x' + data.substring(2, 10);
          console.log(`Selector:`, selector);

          // Extract words.
          let idx = 10;
          let position = 0;
          while(idx <= data.length) {
            const value = '0x' + data.substring(idx, idx + 64);
            console.log(
              '0x' + position.toString(16).padStart(4, '0') + ":", 
              value
            );
            position += 32;
            idx += position * 2;
          }
        }
      });
  }
};
