const vm = require('vm');
const os = require('os');
const fs = require('fs');
const findVersions = require('find-versions');
const axios = require('axios');

// Downloaded compilers will be stored here.
const SOLJSON_PATH = `${os.homedir()}/.soljson/`;
let solc = require('solc'); // Can be modified by downloading a new compiler snapshot.

module.exports = {
  
  getCompiler: async (source, requiredSemver) => {

    const availableVersions = await getAvailableCompilerVersions();
    const sourceSemver = detectSolcVersionFromSource(source);
  
    // Translate semver to an actual version.
    // E.g. '0.5.8' to 'soljson-v0.5.8+commit.23d335f2.js'.
    let version = findVersionFromSemver(requiredSemver || sourceSemver, availableVersions);

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
  let scriptSource = (await axios.get('https://solc-bin.ethereum.org/bin/list.js')).data;
  const script = new vm.Script(scriptSource);
  const output = {};
  script.runInNewContext(output);
  return output.soljsonSources;
}

function findVersionFromSemver(targetSemver, availableVersions) {

  const candidates = availableVersions.filter(v => v.includes(targetSemver));
  if(candidates.length === 0) throw new Error(`Target compiler version not found: ${targetSemver}`);
  if(candidates.length === 1) return candidates[0];

  // Pick the match with the shortest name.
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
