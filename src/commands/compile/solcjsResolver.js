const vm = require('vm');
const os = require('os');
const fs = require('fs');
const findVersions = require('find-versions');
const axios = require('axios');

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
  
    // Translate semver to an actual version.
    // E.g. '0.5.8' to 'soljson-v0.5.8+commit.23d335f2.js'.
    let useLatestPatch = requiredSemver === undefined;
    const version = findVersionFromSemver(requiredSemver || sourceSemver, availableVersions, useLatestPatch);

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
  const pragmaLine = source.match(/^pragma.*$/gm)[0];
  const semver = findVersions(pragmaLine)[0];
  return semver;
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

function findVersionFromSemver(targetSemver, availableVersions, useLatestPatch) {
  let semver = targetSemver;

  // If using latest patch, remove the patch from the target semver.
  if(useLatestPatch) {
    const comps = semver.split('.');
    semver = `${comps[0]}.${comps[1]}`;
  }

  // Filter candidates that contain the target semver.
  let candidates = availableVersions.filter(v => v.includes(semver));

  // Filter candidates that are not nightly builds.
  candidates = candidates.filter(v => !v.includes('nightly'));

  if(candidates.length === 0) throw new Error(`Target compiler version not found: ${semver}`);
  return candidates[0];
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
