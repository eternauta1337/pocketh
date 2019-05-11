const path = require('path');
const exec = require('child_process').exec;

module.exports = function cli(...args) {
  cwd = '.';
  return new Promise(resolve => { 
    exec(
      `node ${path.resolve('./src/program.js')} ${args.join(' ')}`,
      { cwd }, 
      (error, stdout, stderr) => { 
        const err = error || stderr;
        if(err) console.log(err);
        resolve({
          code: err ? 1 : 0,
          error,
          stdout,
          stderr 
        });
      }
    );
  });
}
