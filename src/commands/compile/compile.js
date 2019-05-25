const fs = require('fs');
const path = require('path');
const solcjsResolver = require('./solcjsResolver');
const jsonIO = require('./jsonIO');
const chalk = require('chalk');

const signature = 'compile <sourcePath> <outputDirectory> [solcVersion]';
const description = 'Compiles single Solidity files.';
const help = chalk`
Compiles a source file with solcjs.

The solcVersion parameter can be used to specify a semver version of the compiler to use. This parameter can be any valid semver expression (use quotes for special characters like ^).
If the parameter is not specified, pocketh will look at the source code and use the semver from the pragma directive.
Valid version specifiers:
0.5.8
^0.5.0
~0.4.24
>=0.4.0 <0.6.0
etc...

The compilation output produces output split into several .json files, comaptible with Truffle's compiler output.

{red Eg:}

{blue > pocketh compile test/contracts/Test.sol test/artifacts/ 0.5.8}
Downloading compiler soljson-v0.5.8+commit.23d335f2.js...
Compiler stored in /home/ajs/.soljson/soljson-v0.5.8+commit.23d335f2.js
Using compiler 0.5.8+commit.23d335f2.Emscripten.clang
Compiled Test.sol succesfully to test/artifacts/

`;

let searchPaths = [
  '',
  '../node_modules/'
];

let sourceDir;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .option(`--searchPaths <searchPaths>`, `Specify additional search paths for dependencies as a list of comma separated values. Defaults to ./ and ./node_modules/`)
      .on('--help', () => console.log(help))
      .action(async (sourcePath, outputDirectory, solcVersion, options) => {

        // Parse search paths.
        if(options.searchPaths) {
          const paths = options.searchPaths.split(',');
          searchPaths = [...searchPaths, ...paths];
        }

        // Retrieve contract source.
        if(!fs.existsSync(sourcePath)) throw new Error(`Cannot find ${sourcePath}.`);
        sourceDir = path.dirname(sourcePath);
        const filename = path.basename(sourcePath);
        const source = fs.readFileSync(sourcePath, 'utf8');

        // Retrieve the appropriate solcjs compiler.
        const solc = await solcjsResolver.getCompiler(source, solcVersion);
        console.log(`Using compiler ${solc.version()}`);

        // Prepare the json standard input for the compiler.
        const jsonInput = jsonIO.buildStandardJsonInput(filename, source);

        // Compile and display errors/warnings.
        const output = JSON.parse(solc.compile(JSON.stringify(jsonInput), resolveImports));
        if(output.errors && output.errors.length > 0) displayErrors(output.errors);

        // Split the output so that there is one json file per contract.
        const splitOutput = jsonIO.oneJsonPerContract(output, filename);

        // Write json files to disk.
        if(outputDirectory.charAt(outputDirectory.length - 1) !== '/') throw new Error('outputDirectory must be a directory path.');
        if(!fs.existsSync(outputDirectory)) throw new Error(`Cannot find ${outputDirectory}.`);
        splitOutput.forEach(json => {
          const destPath = outputDirectory + json.contractName + '.json';
          fs.writeFileSync(destPath, JSON.stringify(json, null, 2));
        });

        // Report.
        console.log(`Compiled ${filename} succesfully to ${outputDirectory}`);
      });
  }
};

function resolveImports(sourcepath) {

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
  const normpath = path.resolve(sourceDir, basedir, sourcepath);
  if(!fs.existsSync(normpath)) return undefined;
  return fs.readFileSync(normpath, 'utf8');
}

function displayErrors(errors) {
  console.log(`\nCompilation produced the following warnings/errors:\n`);
  errors.map(err => {
    const msg = err.formattedMessage;
    if(msg.includes('Error')) throw new Error(msg);
    else console.log(msg);
  });
}
