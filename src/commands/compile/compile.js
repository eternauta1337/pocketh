const fs = require('fs');
const path = require('path');
const solcjsResolver = require('./solcjsResolver');
const jsonIO = require('./jsonIO');
const chalk = require('chalk');
const findNodeModules = require('find-node-modules');

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

{blue > pocketh compile test/contracts/Test.sol test/artifacts/ 0.5.7}
Retrieving list of available solcjs versions...
Source version: ^0.5.7
Target version: 0.5.7
Using compiler 0.5.7+commit.6da8b019.Emscripten.clang
Compiled Test.sol succesfully to /tmp/

{blue > pocketh compile ~/tabookey-gasless/contracts/RelayHub.sol /tmp/}
Retrieving list of available solcjs versions...
Source version: >=0.4.0 <0.6.0
Target version: >=0.4.0 <0.6.0
Using compiler 0.5.8+commit.23d335f2.Emscripten.clang
Compiled RelayHub.sol succesfully to /tmp/
`;

let searchPaths = [
  ''
];

let sourceDir;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .option(`--searchPaths <searchPaths>`, `Specify additional search paths for dependencies as a list of comma separated values. Note that search paths must be relative to sourcePath.`)
      .option(`--solcbin <url>`, `Specify the url to use to fetch solcjs compiler versions.`)
      .on('--help', () => console.log(help))
      .action(async (sourcePath, outputDirectory, solcVersion, options) => {

        // Validate sourcePath.
        if(path.basename(sourcePath).split('.')[1] !== 'sol')
          throw new Error(`Invalid source file ${sourcePath}`);
        if(!fs.existsSync(sourcePath)) 
          throw new Error(`Cannot find ${sourcePath}.`);

        // Validate output directory.
        if(!fs.existsSync(outputDirectory)) 
          throw new Error(`Cannot find ${outputDirectory}.`);
        if(!fs.lstatSync(outputDirectory).isDirectory())
          throw new Error('outputDirectory must be a directory path.');

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
        const solc = await solcjsResolver.getCompiler(source, solcVersion, options.solcbin);
        console.log(`Using compiler ${solc.version()}`);

        // Prepare the json standard input for the compiler.
        const jsonInput = jsonIO.buildStandardJsonInput(filename, source);

        // Compile and display errors/warnings.
        const output = JSON.parse(solc.compile(JSON.stringify(jsonInput), resolveImports));
        if(output.errors && output.errors.length > 0) displayErrors(output.errors);

        // Split the output so that there is one json file per contract.
        const splitOutput = jsonIO.oneJsonPerContract(output, filename);

        // Write json files to disk.
        splitOutput.forEach(json => {
          const destPath = path.resolve(outputDirectory, json.contractName + '.json');
          fs.writeFileSync(destPath, JSON.stringify(json, null, 2));
        });

        // Report.
        console.log(`Compiled ${filename} succesfully to ${outputDirectory}`);
      });
  }
};

function resolveImports(sourcePath) {

  // Resolve imports using each of the search paths.
  for(let i = 0; i < searchPaths.length; i++) {
    const path = searchPaths[i];
    const contents = tryToResolveImport(path, sourcePath);
    if(contents) return { contents };
  }

  // Try to resolve the imports using node_modules.
  const modules = findNodeModules({ cwd: sourceDir });
  for(let i = 0; i < modules.length; i++) {
    const path = modules[i];
    const contents = tryToResolveImport(path, sourcePath);
    if(contents) return { contents };
  }

  throw new Error(`Unable to resolve import ${sourcePath}`);
}

function tryToResolveImport(searchPath, sourcePath) {

  // Normalize the path.
  const normPath = path.resolve(sourceDir, searchPath, sourcePath);
  // console.log(`Trying to resolve import at: ${normPath}`);

  // Read the file.
  if(!fs.existsSync(normPath)) return undefined;
  return fs.readFileSync(normPath, 'utf8');
}

function displayErrors(errors) {
  console.log(`\nCompilation produced the following warnings/errors:\n`);
  errors.map(err => {
    const msg = err.formattedMessage;
    if(msg.includes('Error')) throw new Error(msg);
    else console.log(msg);
  });
}
