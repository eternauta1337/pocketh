const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const cli = require('../utils/cli');
const Web3 = require('web3');

let web3;

module.exports = async function(contractPath) {

  // Used for utils only.
  web3 = new Web3();

  // Determine file extension.
  let dirname = path.dirname(contractPath);
  const filename = path.basename(contractPath);
  const comps = filename.split('.');
  const name = comps[0];
  const ext = comps[1];

  // Validate path.
  if(ext !== 'sol' && ext !== 'json')
    throw new Error(`Unrecognized extension ${ext}`);

  // Auto compile?
  let compiledPath = contractPath;
  if(ext === 'sol') {
    dirname = await compileSolidityFile(contractPath);
    compiledPath = `${dirname}/${name}.json`;
  }

  // Return a wrapper with the artifacts
  // and a reference directory for where they're stored.
  return {
    artifacts: retrieveJsonArtifacts(compiledPath),
    basedir: dirname
  };
};

async function compileSolidityFile(sourcePath) {
    
  // Create a temporary directory to store the artifacts in.
  // If the directory already exists, then its artifacts can be reused.
  const tmpdir = `/tmp/${getSourceCodeHash(sourcePath)}`;
  if(fs.existsSync(tmpdir)) return tmpdir;
  else fs.mkdirSync(tmpdir);
  console.log(`Auto compiling ${sourcePath} to ${tmpdir}/`);

  // Compile the file.
  // Wrap it in a try/catch to avoid cancelling the auto compilation
  // for trivial errors that solcjs sometimes throws.
  let result;
  try {
    result = await cli(
      'compile', 
      sourcePath, 
      tmpdir
    );
    
    return tmpdir;
  }
  catch(error) {
    // If the error has to do with the json file, then something
    // really did go wrong. In that case, do report the compilation error.
    if(error.message.includes('Cannot find')) throw new Error(`Unable to auto compile ${sourcePath}: ${result.error}`);
  }
}

function getSourceCodeHash(sourcePath) {
  const source = fs.readFileSync(sourcePath, 'utf8');
  return web3.utils.sha3(source).substring(2, 14);
}

function retrieveJsonArtifacts(path) {
  if(!fs.existsSync(path)) throw new Error(`Cannot find ${path}`);
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
