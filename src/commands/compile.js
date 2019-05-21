const axios = require('axios');
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const os = require('os');
const findVersions = require('find-versions');
let solc = require('solc'); // Can be modified by downloading a new compiler snapshot.

// Downloaded compilers will be stored here.
// Pretty intrusive but works for now.
const SOLJSON_PATH = `${os.homedir()}/.soljson/`;

let sourceDir;

module.exports = {
  register: (program) => {
    program
      .command('compile <sourcePath> <outputDirectory> [solcVersion]')
      .description('Compiles a source file with solcjs. Downloads the appropriate solcjs compiler by looking at the source code. A specific solc version can be indicated with the solcVersion parameter.')
      .action(async (sourcePath, outputDirectory, solcVersion) => {

        // Retrieve contract source.
        if(!fs.existsSync(sourcePath)) throw new Error(`Cannot find ${sourcePath}.`);
        sourceDir = path.dirname(sourcePath);
        const filename = path.basename(sourcePath);
        const source = fs.readFileSync(sourcePath, 'utf8');

        // If no solcVersion is provided, try to auto detect it.
        let usingDetectedSolcVersion = false;
        if(!solcVersion) {
          solcVersion = detectSolcVersion(source);
          usingDetectedSolcVersion = true;
        }

        // Check current compiler version.
        // Set version accordingly.
        if(requiresDifferentCompiler(solcVersion)) {
          const useLatestPatch = usingDetectedSolcVersion;
          solc = await getCompilerVersion(solcVersion, useLatestPatch);
        }
        console.log(`Using compiler ${solc.version()}`);

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
        console.log(`Compiled ${filename} succesfully to ${outputDirectory}`);
      });
  }
};

function detectSolcVersion(source) {
  const pragmaLine = source.match(/^pragma.*$/gm)[0];
  return findVersions(pragmaLine)[0];
}

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
  console.log(`\nCompilation produced the following warnings/errors:\n`);
  errors.map(err => console.log(err.formattedMessage));
}

function resolveImports(sourcepath) {

  const searchPaths = [
    '/',
    '/../node_modules/'
  ];

  for(let i = 0; i < searchPaths.length; i++) {
    const path = searchPaths[i];
    const contents = tryToResolveImport(path, sourcepath);
    if(contents) {
      return { contents };
    }
  }

  throw new Error(`Unable to resolve import ${sourcepath}`);
}

function tryToResolveImport(basedir, sourcepath) {
  const normpath = path.resolve(sourceDir + basedir + sourcepath);
  if(!fs.existsSync(normpath)) return undefined;
  return fs.readFileSync(normpath, 'utf8');
}

function compile(filename, source) {

  // Prepare json input.
  const jsonInput = buildStandardJsonInput(filename, source);

  // Compile.
  try {
    const compiled = JSON.parse(solc.compile(JSON.stringify(jsonInput), resolveImports));
    if(compiled.errors && compiled.errors.length > 0) {
      displayErrors(compiled.errors);
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
      outputSelection: {
        "*": {
          "*": [ 
            "abi",
            "metadata",
            "evm.bytecode.object",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.object",
            "evm.deployedBytecode.sourceMap"
          ], 
          "": [ "*" ] 
        } 
      }
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

function findMostRecentPatchVersion(targetVersion, versions) {

  // Find versions that match the major and minor semver.
  const targetVersionComps = targetVersion.split('.');
  const targetVersionMajorMinorOnly = targetVersionComps[0] + '.' + targetVersionComps[1];
  const candidates = versions.filter(v => v.includes(targetVersionMajorMinorOnly));

  // Return the version with the largest patch.
  if(candidates.length === 0) throw new Error(`Target compiler version not found: ${targetVersion}`);
  if(candidates.length === 1) return candidates[0];
  let match = candidates[0];
  let largestPatch = 0;
  candidates.forEach(candidate => {
    const v = findVersions(candidate)[0];
    const patch = parseInt(v.match(/[^-|+]*/)[0].split('.')[2], 10);
    if(patch > largestPatch) {
      match = candidate;
      largestPatch = patch;
    }
  });

  return match;
}

function findExactPatchVersion(targetVersion, versions) {

  // Find versions that match the version.
  const candidates = versions.filter(v => v.includes(targetVersion));

  // Return the version with the largest patch.
  if(candidates.length === 0) throw new Error(`Target compiler version not found: ${targetVersion}`);
  if(candidates.length === 1) return candidates[0];
  let match = candidates[0];
  let shortestVersion = Number.MAX_VALUE;
  candidates.forEach(candidate => {
    if(candidate.length < shortestVersion) {
      match = candidate;
      shortestVersion = candidate.length;
    }
  });

  return match;
}
async function getCompilerVersion(version, useLatestPatch) {
  return new Promise(async (resolve, reject) => {
    
    // Find version in available versions.
    const versions = await availableCompilerVersions();
    let match;
    if(useLatestPatch) match = findMostRecentPatchVersion(version, versions);
    else match = findExactPatchVersion(version, versions);

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
