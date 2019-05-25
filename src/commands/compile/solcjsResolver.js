const vm = require('vm');
const os = require('os');
const fs = require('fs');
const axios = require('axios');
const semver = require('semver');

// Downloaded compilers will be stored here.
const SOLJSON_PATH = `${os.homedir()}/.soljson/`;
let solc = require('solc'); // Can be modified by downloading a new compiler snapshot.

// List of available solcjs versions.
const SOLC_BIN_URL = `https://solc-bin.ethereum.org/bin/`;
const SOLC_BIN_LIST_URL = `${SOLC_BIN_URL}list.js`;

module.exports = {
  
  getCompiler: async (source, requiredSemver) => {

    const availableVersions = await getAvailableCompilerVersions();
    const sourceSemver = detectSolcVersionFromSource(source);
    console.log(`Source version:`, sourceSemver);
  
    // Use specified semver, or detect it form source.
    const targetSemver = requiredSemver || sourceSemver;
    console.log(`Target version:`, targetSemver);

    // Translate semver to an actual version.
    // E.g. '0.5.8' to 'soljson-v0.5.8+commit.23d335f2.js'.
    const version = findVersionFromSemver(targetSemver, availableVersions);

    // Retrieve compiler source.
    let compilerSource;
    if(fs.existsSync(`${SOLJSON_PATH}${version}`)) compilerSource = fs.readFileSync(`${SOLJSON_PATH}${version}`, 'utf8');
    else compilerSource = await downloadAndCacheCompilerSource(version);

    // "Build" compiler source.
    solc = solc.setupMethods(requireFromString(compilerSource, version));

    return solc;
  }
};

function detectSolcVersionFromSource(source) {
  // Return `pragma solidity <THIS PART>;`
  return source.match(/(?<=pragma solidity ).*(?=;)/gm)[0];
}

async function getAvailableCompilerVersions() {
  console.log(`Retrieving list of available solcjs versions...`);
  return new Promise((resolve, reject) => {
    axios.get(SOLC_BIN_LIST_URL)
      .then((result) => {
        if(result.status === 200) {

          // Retrieved text is a js file.
          // It needs to be executed to retrieve the list of sources.
          let scriptSource = result.data;
          const script = new vm.Script(scriptSource);
          const output = {};
          script.runInNewContext(output);
          const sources = output.soljsonSources;

          resolve(sources);
        }
      })
      .catch((error) => {
        reject(`Unbable to retrieve available solcjs sources from ${SOLC_BIN_URL}, ${error.message}`);
      });
  });
}

function findVersionFromSemver(targetSemver, availableVersions) {

  // Filter out nightly versions.
  const candidates = availableVersions.filter(v => !v.includes('nightly'));

  // Map the candidates to pure semver.
  const versions = candidates.map(version => {
    // Return `soljson-<THIS PART>.js;`
    return semver.clean(version.match(/(?<=soljson-).*(?=\.js)/)[0]);
  });

  // Find best fit.
  const best = semver.maxSatisfying(versions, targetSemver);
  const idx = versions.indexOf(best);
  if(idx >= 0) return candidates[idx];

  // Nothing found =(
  throw new Error(`No available version satisfies the required version ${targetSemver}`);
}

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

async function downloadAndCacheCompilerSource(version) {
  console.log(`Downloading compiler ${version}...`);
  return new Promise((resolve, reject) => {
    const url = `${SOLC_BIN_URL}${version}`;
    axios.get(url)
      .then((result) => {
        if(result.status === 200) {

          // Store downloaded compiler source for future usage.
          const compilerSource = result.data;
          const path = `${SOLJSON_PATH}${version}`;
          if(!fs.existsSync(SOLJSON_PATH)) fs.mkdirSync(SOLJSON_PATH);
          fs.writeFileSync(path, compilerSource);
          console.log(`Compiler stored in ${path}`);

          resolve(compilerSource);
        }
      })
      .catch((error) => {
        reject(`Unable to download compiler ${url}, ${error.message}`);
      });
  });
}
