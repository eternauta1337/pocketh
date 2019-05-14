const program = require('commander');
const axios = require('axios');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const os = require('os');
let solc = require('solc'); // Can be modified by downloading a new compiler snapshot.

// Downloaded compilers will be stored here.
// Pretty intrusive but works for now.
const SOLJSON_PATH = `${os.homedir()}/.soljson/`;

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
        if(requiresDifferentCompiler(solcVersion)) {
          solc = await getCompilerVersion(solcVersion);
        }
        console.log(`Using compiler ${solc.version()}`);

        // Retrieve contract source.
        if(!fs.existsSync(sourcePath)) throw new Error(`Cannot find ${sourcePath}.`);
        const filename = path.basename(sourcePath);
        const source = fs.readFileSync(sourcePath, 'utf8');

        // Compile.
        const compiledJsons = compile(filename, source);

        // Write results to files.
        if(outputDirectory.charAt(outputDirectory.length - 1) !== '/') throw new Error('outputDirectory must be a directory path.');
        if(!fs.existsSync(outputDirectory)) throw new Error(`Cannot find ${outputDirectory}.`);
        compiledJsons.forEach(json => {
          const destPath = outputDirectory + json.contractName + '.json';
          fs.writeFileSync(destPath, JSON.stringify(json, null, 2));
        });

        // Report.
        console.log(`Compiled ${filename} succesfully to ${outputDirectory}.`);
      });
  }
};

/*
 * Solcjs output and truffle compiler output are different.
 * Solcjs outputs one json file per source file (a source file may contain multiple contracts).
 * Truffle re-shuffles the original solcjs output and splits it into multiple json files,
 * one per contract. To maintain compatibility, we do the same thing here.
 * */
function splitCompilerOutputIntoSeparateFiles(filename, originalJson) {

  // Retrieve general ast.
  const ast = originalJson.sources[filename].ast;

  // For each contract object within the file...
  const splitJsons = [];
  Object.keys(originalJson.contracts[filename]).forEach(contractName => {
    const contractJson = originalJson.contracts[filename][contractName];
    // Collect output from the original format into this format that 
    // is used by Truffle output.
    splitJsons.push({
      contractName,
      abi: contractJson.abi,
      metadata: contractJson.metadata,
      bytecode: contractJson.evm.bytecode.object,
      deployedBytecode: contractJson.evm.deployedBytecode.object,
      ast
    });
  });

  return splitJsons;
}

function requiresDifferentCompiler(solcVersion) {
  const currentVersion = solc.version();
  const current = currentVersion.split('+')[0].split('.');
  const wanted = solcVersion.split('.');
  if(current[0] !== wanted[0]) return true;
  if(current[1] !== wanted[1]) return true;
  if(parseInt(wanted[2], 10) > parseInt(current[2], 10)) return true;
  return false;
}

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
    return splitCompilerOutputIntoSeparateFiles(filename, compiled);
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
        enabled: false,
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

    // Retrieve version source.
    let compilerSource;
    if(fs.existsSync(`${SOLJSON_PATH}${match}`)) compilerSource = fs.readFileSync(`${SOLJSON_PATH}${match}`, 'utf8');
    else compilerSource = await downloadAndCacheCompilerSource(match);

    // Wrap compiler source.
    solc = solc.setupMethods(requireFromString(compilerSource, match));
    resolve(solc);
  });
}

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

async function downloadAndCacheCompilerSource(version) {
  console.log(`Downloading compiler ${version}...`);
  const compilerSource = (await axios.get(`https://solc-bin.ethereum.org/bin/${version}`)).data;
  const path = `${SOLJSON_PATH}${version}`;
  if(!fs.existsSync(SOLJSON_PATH)) fs.mkdirSync(SOLJSON_PATH);
  fs.writeFileSync(path, compilerSource);
  console.log(`Compiler stored in ${path}`);
  return compilerSource;
}
