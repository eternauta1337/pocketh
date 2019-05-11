const path = require('path');
const exec = require('child_process').exec;

module.exports = function cli(...args) {
  cwd = '.';
  return new Promise(resolve => { 
    exec(
      `node ${path.resolve('./src/program.js')} ${args.join(' ')}`,
      { cwd }, 
      (error, stdout, stderr) => { 
        if(error) console.log(error);
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr 
        });
      }
    );
  });
}
