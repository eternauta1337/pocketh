const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const cli = require('../utils/cli');

module.exports = async function(contractPath) {

  // Determine file extension.
  const dirname = path.dirname(contractPath);
  const filename = path.basename(contractPath);
  const comps = filename.split('.');
  const name = comps[0];
  const ext = comps[1];

  // If the extension is json, just load the file and return its contents.
  if(ext === 'json') return {
    artifacts: retrieveJsonArtifacts(contractPath),
    basedir: dirname
  };
  // If the extension is sol, compile the contract
  // and then return the json artifacts.
  if(ext === 'sol') {
  
    // Create a temporary directory to store the artifacts in.
    const tmpdir = tmp.dirSync();
    console.log(`Auto compiling ${contractPath} to ${tmpdir.name}/`);

    // Compile the file.
    // Wrap it in a try/catch to avoid cancelling the auto compilation
    // for trivial errors that solcjs sometimes throws.
    let result;
    try {
      result = await cli(
        'compile', 
        contractPath, 
        `${tmpdir.name}/`
      );
      
      // Return the compiled artifacts.
      const compiledPath = `${tmpdir.name}/${name}.json`;
      return {
        artifacts: retrieveJsonArtifacts(compiledPath),
        basedir: tmpdir.name
      };
    }
    catch(error) {
      // If the error has to do with the json file, then something
      // really did go wrong. In that case, do report the compilation error.
      if(error.message.includes('Cannot find')) throw new Error(`Unable to auto compile ${contractPath}: ${result.error}`);
    }
  }

  throw new Error(`Unrecognized extension ${ext}`);
};

function retrieveJsonArtifacts(path) {
  if(!fs.existsSync(path)) throw new Error(`Cannot find ${path}`);
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
