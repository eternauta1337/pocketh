const fs = require('fs');
const path = require('path');
const solcjsResolver = require('./solcjsResolver');
const jsonIO = require('./jsonIO');
const chalk = require('chalk');

const signature = 'compile <sourcePath> <outputDirectory> [solcVersion]';
const description = 'Compiles single Solidity files.';
const help = chalk`
Compiles a source file with solcjs. Downloads the appropriate solcjs compiler by looking at the source code. A specific solc version can be indicated with the solcVersion parameter.

The compilation output produces output split into several .json files, comaptible with Truffle's compiler output.

{red Eg:}

{blue > pocketh compile test/contracts/Test.sol test/artifacts/ 0.5.8}
Downloading compiler soljson-v0.5.8+commit.23d335f2.js...
Compiler stored in /home/ajs/.soljson/soljson-v0.5.8+commit.23d335f2.js
Using compiler 0.5.8+commit.23d335f2.Emscripten.clang
Compiled Test.sol succesfully to test/artifacts/

`;

let sourceDir;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (sourcePath, outputDirectory, solcVersion) => {

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

function displayErrors(errors) {
  console.log(`\nCompilation produced the following warnings/errors:\n`);
  errors.map(err => {
    const msg = err.formattedMessage;
    if(msg.includes('Error')) throw new Error(msg);
    else console.log(msg);
  });
}
