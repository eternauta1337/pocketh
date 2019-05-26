const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const signature = 'split <sourcePath> <outputDirectory>';
const description = 'Splits Solidity files.';
const help = chalk`
Splits a Solidity file containing multiple contracts into multiple files, each with one contract.

{red Eg:}

{blue > pocketh split test/contracts/Kitties.sol /tmp/}
Split file test/contracts/Kitties.sol into 16 files:
  - Ownable.sol
  - ERC721.sol
  - GeneScienceInterface.sol
  - KittyAccessControl.sol
  - KittyBase.sol
  - ERC721Metadata.sol
  - KittyOwnership.sol
  - KittyBreeding.sol
  - ClockAuctionBase.sol
  - Pausable.sol
  - ClockAuction.sol
  - SiringClockAuction.sol
  - SaleClockAuction.sol
  - KittyAuction.sol
  - KittyMinting.sol
  - KittyCore.sol
(New files written to /tmp/)
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action((sourcePath, outputDirectory) => {

        // Validate input.
        if(!fs.existsSync(sourcePath)) throw new Error(`Cannot find source file: ${sourcePath}`);
        if(outputDirectory.charAt(outputDirectory.length - 1) !== '/') throw new Error('outputDirectory must be a directory path.');
        if(!fs.existsSync(outputDirectory)) throw new Error(`Cannot find ${outputDirectory}.`);

        // Read file.
        let source = fs.readFileSync(sourcePath, 'utf8');

        // Identify and remove pragma line.
        const pragmaLine = source.match(/pragma.*/gm)[0];
        source = source.replace(pragmaLine, '');

        // Split contents into lines.
        const lines = source.split('\n');

        // Regroup content into contracts.
        // Consume lines and add them to separate contract strings.
        // Open new contracts when the number of opening and closing
        // curly braces matches.
        const contracts = [``];
        let currentContractIdx = 0;
        let openCurlyBraceCount = 0;
        let closeCurlyBraceCount = 0;
        for(let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Add current line to current contract.
          contracts[currentContractIdx] += `${line}\n`;

          // Count curly braces.
          const openCurlies = line.match(/{/g);
          const closeCurlies = line.match(/}/g);
          if(openCurlies) openCurlyBraceCount += line.match(/{/g).length;
          if(closeCurlies) closeCurlyBraceCount += line.match(/}/g).length;
          
          // If a new block is starting, open a new file.
          if(openCurlyBraceCount > 0 && openCurlyBraceCount === closeCurlyBraceCount) {
            contracts.push(``);
            currentContractIdx += 1;
            openCurlyBraceCount = closeCurlyBraceCount = 0;
          }
        }
        contracts.pop();

        // Only 1 contract?
        if(contracts.length === 1) {
          console.log(`Only one contract found in file, nothing to do.`);
          return;
        }

        // Retrieve all contract names.
        const names = [];
        for(let i = 0; i < contracts.length; i++) {
          const contract = contracts[i];

          // Get contract name.
          const nameMatches = contract.match(/(?<=^contract )\b\w+\b/gm);
          if(!nameMatches || nameMatches.length === 0) throw new Error(`Unable to find name in contract: ${contract}`);
          const name = nameMatches[0];

          names.push(name);
        }

        // Add import statements.
        // Review all contracts, and if any name appears in it,
        // add an import statement.
        for(let i = 0; i < contracts.length; i++) {
          for(let j = 0; j < names.length; j++) {
            if(i !== j) {
              const otherName = names[j];
              const noComments = contracts[i].replace(/\s*\/\/.*/gm, '');
              const otherNameMatches = noComments.match(new RegExp(`${otherName}`, 'gm'));
              if(otherNameMatches && otherNameMatches.length > 0) {
                contracts[i] = `import "./${otherName}.sol";\n${contracts[i]}`;
              }
            }
          }
        }

        // Add pragma statements.
        for(let i = 0; i < contracts.length; i++) {
          contracts[i] = `${pragmaLine}\n\n${contracts[i]}`;
        }

        // Write each contract into a separate file.
        for(let i = 0; i < contracts.length; i++) {
          const contract = contracts[i];

          // Build target path.
          const path = `${outputDirectory}${names[i]}.sol`;

          // Write file.
          fs.writeFileSync(path, contract);
        }

        // Report.
        console.log(`Split file ${sourcePath} into ${contracts.length} files:`);
        names.map(name => {
          console.log(`  - ${name}.sol`);
        });
        console.log(`(New files written to ${outputDirectory})`);
      });
  }
};
