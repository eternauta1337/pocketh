const path = require('path');
const exec = require('child_process').exec;

module.exports = function cli(...args) {
  const cwd = '.';

  // Determine executable depending on working directory.
  // Use `node src/program` in development and testing.
  // Use the installed bnary in path `pocketh` otherwise.
  const runningDir = path.basename(process.cwd());
  const executable = runningDir === 'pocketh' ? 'node src/program' : 'pocketh';

  return new Promise(resolve => { 
    exec(
      `${executable} ${args.join(' ')}`,
      { cwd }, 
      (error, stdout, stderr) => { 
        const err = error || stderr;
        if(err) console.log(err);
        resolve({
          code: err ? 1 : 0,
          error: err,
          stdout,
          stderr 
        });
      }
    );
  });
};
