const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');

module.exports = {
  register: (program) => {
    program
      .command(`command <param1>`)
      .action(async (param1) => {
        
      });
  }
};
