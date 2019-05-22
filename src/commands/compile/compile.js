const fs = require('fs');
const path = require('path');
const solcjsResolver = require('./solcjsResolver');
const jsonIO = require('./jsonIO');

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

        // Retrieve the appropriate solcjs compiler.
        const solc = await solcjsResolver.getCompiler(source, solcVersion);
        console.log(`Using compiler ${solc.version()}`);

        // Prepare the json standard input for the compiler.
        const jsonInput = jsonIO.buildStandardJsonInput(filename, source);

        // Compile and display errors/warnings.
        const output = JSON.parse(solc.compile(JSON.stringify(jsonInput), resolveImports));
        if(output.errors && output.errors.length > 0) displayErrors(output.errors);

        // Split the output so that there is one json file per contract.
        const splitOutput = jsonIO.oneJsonPerContract(output);

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
  errors.map(err => console.log(err.formattedMessage));
}
