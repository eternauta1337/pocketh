module.exports = {
  register: (program) => {
    program
      .command(`commandName <param>`)
      .action((param) => {
        
      });
  }
};
