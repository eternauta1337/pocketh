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
    console.log(`(compiling ${contractPath})`);
  
    // Create a temporary directory to store the artifacts in.
    const tmpdir = tmp.dirSync();

    // Compile the file.
    const result = await cli(
      'compile', 
      contractPath, 
      `${tmpdir.name}/`
    );
    if(result.code !== 0) throw new Error(`Unable to compile ${contractPath}: ${result.error}`);

    // Return the compiled artifacts.
    const compiledPath = `${tmpdir.name}/${name}.json`;
    return {
      artifacts: retrieveJsonArtifacts(compiledPath),
      basedir: tmpdir.name
    }
  }

  throw new Error(`Unrecognized extension ${ext}`);
};

function retrieveJsonArtifacts(path) {
  if(!fs.existsSync(path)) throw new Error(`Cannot find ${path}`);
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
