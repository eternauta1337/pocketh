const program = require('commander');
const axios = require('axios');
const vm = require('vm');
const fs = require('fs');
let solc = require('solc'); // Can be modified by downloading a new compiler snapshot.

module.exports = {
  register: (program) => {
    program
      .command('compile <sourcePath> <outputDirectory> [solcVersion]')
      .description('Compiles a source file with solcjs.')
      .action(async (sourcePath, outputDirectory, solcVersion) => {

        // Default values.
        solcVersion = solcVersion || '0.5.8';

        // Check current compiler version.
        // Set version accordingly.
        const currentVersion = solc.version();
        console.log(currentVersion, solcVersion);
        if(!currentVersion.includes(solcVersion)) {
          console.log(`Current compiler version is ${currentVersion} and requested version is ${solcVersion}, setting version.`);
          solc = await getCompilerVersion(solcVersion);
        }

        // Retrieve contract source.
        if(!fs.existsSync(sourcePath)) throw new Error(`Cannot find ${sourcePath}.`);
        const source = fs.readFileSync(sourcePath, 'utf8');

        // Compile.
        const compiled = compile(source);
        console.log(compiled.contracts.source.Test);
      });
  }
};

function compile(source) {

  // Prepare json input.
  const sources = { source };
  const json = buildStandardJSONInput(sources);

  // Compile.
  const output = JSON.parse(solc.compile(json));
  return output;
}

function buildStandardJSONInput(sources) {

  const newSources = {};
  for(let contractKey in sources) {
    const contractContent = sources[contractKey];
    newSources[contractKey] = {
      content: contractContent
    };
  }

  const nativeSources = {
    language: "Solidity",
    sources: newSources,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": [
            "metadata",
            "ast",
            "evm.bytecode.opcodes", 
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.opcodes",
            "evm.deployedBytecode.sourceMap"
          ]
        }
      }
    }
  };

  const nativeSourcesStr = JSON.stringify(nativeSources);
  return nativeSourcesStr;
}

async function availableCompilerVersions() {
  let scriptSource = (await axios.get('https://solc-bin.ethereum.org/bin/list.js')).data;
  const script = new vm.Script(scriptSource);
  const output = {};
  script.runInNewContext(output);
  return output.soljsonSources;
}

async function getCompilerVersion(version) {
  return new Promise(async (resolve, reject) => {
    
    // Find version in available versions.
    const versions = await availableCompilerVersions();
    let match = versions.find(v => v.includes(version));
    if(!match) throw new Error(`Target compiler version not found: ${version}`);
    match = match.substring(0, match.length - 3); // Remove .js
    match = match.replace('soljson-', ''); // Remove soljson-

    // Retrieve version.
    console.log(`Retrieving compiler version ${match}...`);
    solc.loadRemoteVersion(match, (err, solcSnapshot) => {
      if(err) throw err;
      else resolve(solcSnapshot);
    });
  });
}
