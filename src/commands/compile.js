const program = require('commander');
const axios = require('axios');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
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
        if(!currentVersion.includes(solcVersion)) {
          console.log(`\nCurrent compiler version is ${currentVersion} and requested version is ${solcVersion}.`);
          solc = await getCompilerVersion(solcVersion);
        }

        // Retrieve contract source.
        if(!fs.existsSync(sourcePath)) throw new Error(`Cannot find ${sourcePath}.`);
        const filename = path.basename(sourcePath);
        const source = fs.readFileSync(sourcePath, 'utf8');

        // Compile.
        const compiled = compile(filename, source);

        // Write result to file.
        if(outputDirectory.charAt(outputDirectory.length - 1) !== '/') throw new Error('outputDirectory must be a directory path.');
        if(!fs.existsSync(outputDirectory)) throw new Error(`Cannot find ${outputDirectory}.`);
        const destPath = outputDirectory + filename.split('.')[0] + '.json';
        fs.writeFileSync(destPath, JSON.stringify(compiled, null, 2));

        // Report.
        console.log(`\nCompiled ${filename} succesfully to ${destPath}.`);
      });
  }
};

function displayErrors(errors) {
  console.log(`\nCompilation failed with errors:\n`);
  errors.map(err => console.log(err.formattedMessage));
}

function compile(filename, source) {

  // Prepare json input.
  const jsonInput = buildStandardJsonInput(filename, source);

  // Compile.
  try {
    const compiled = JSON.parse(solc.compile(JSON.stringify(jsonInput)));
    if(compiled.errors) {
      displayErrors(compiled.errors);
      process.exit();
    }
    return compiled;
  }
  catch(error) {
    console.log(`ERROR: ${error}`);
    throw error;
    process.exit();
  }
}

function buildStandardJsonInput(filename, source) {
  return {
    language: "Solidity",
    sources: {
      [filename]: {
        content: source
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: { "*": { "*": [ "*" ], "": [ "*" ] } }
    }
  };
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
    console.log(`\nDownloading compiler ${match}...`);
    solc.loadRemoteVersion(match, (err, solcSnapshot) => {
      if(err) throw err;
      else resolve(solcSnapshot);
    });
  });
}
