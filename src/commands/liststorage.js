const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const BN = require('bn.js');
const getArtifacts = require('../utils/getArtifacts.js');
const astUtil = require('../utils/astUtil.js');
const abiUtil = require('../utils/abiUtil.js');
const chalk = require('chalk');
const validateUtil = require('../utils/validateUtil');

const signature = 'liststorage <networkUrl> <contractPath> <contractAddress>';
const description = 'Reads the storage of a contract.';
const help = chalk`
Query the storage of a contract deployed at a given address.

{red Eg:}

{blue > pocketh liststorage mainnet ~/tmp/artifacts/ANT.json 0x960b236A07cf122663c4303350609A66A7B288C0}
mapping(address => struct MiniMeIrrevocableVestedToken.TokenGrant[]) public grants;
  size: 32 bytes
  slot: 0
  word: 000000000000000000000000d39902f046b5885d70e9e66594b65f84d4d1c952
  subword: 000000000000000000000000d39902f046b5885d70e9e66594b65f84d4d1c952
  value: dynamic value
mapping(address => bool) canCreateGrants;
  size: 32 bytes
  slot: 1
  word: 417261676f6e204e6574776f726b20546f6b656e000000000000000000000028
  subword: 417261676f6e204e6574776f726b20546f6b656e000000000000000000000028
  value: dynamic value
address vestingWhitelister;
  size: 20 bytes
  slot: 2
  word: 0000000000000000000000000000000000000000000000000000000000000012
  subword: 0000000000000000000000000000000000000012
  value: 0x0000000000000000000000000000000000000012
string public name;
  size: 32 bytes
  slot: 3
  word: 414e540000000000000000000000000000000000000000000000000000000006
  subword: 414e5400000000000000000000000000000000000000000000000000000000
  value: ANT
...
`;

let slot = 0;
let rightOffset = 0;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (networkUrl, contractPath, contractAddress) => {
        chalk.enabled = !program.disableColors;

        // Input validation.
        if(!validateUtil.address(contractAddress))
          throw new Error(`Invalid address: ${contractAddress}`);

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Retrieve contract artifacts.
        const contractArtifacts = await getArtifacts(contractPath);

        // Retrieve the ast.
        const ast = contractArtifacts.ast;
        if(!ast) throw new Error('AST data not found.');

        // Retrieve the target contract definition node.
        const rootContractName = path.basename(contractPath).split('.')[0];
        const rootContraContractDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', rootContractName);

        // Retrieve the linearized base contract nodes of the contract.
        const linearizedContractDefs = astUtil.getLinearizedBaseContractNodes(ast, rootContraContractDefinition);

        // Traverse each base contract in the linearized order, and process their variables.
        for(let i = 0; i < linearizedContractDefs.length; i++) {
          const contractDefinition = linearizedContractDefs[i];
          await processAllVariableDeclarationsInContractDefinition(
            contractDefinition, 
            contractAddress, 
            web3
          );
        }
      });
  }
};

async function processAllVariableDeclarationsInContractDefinition(contractDefinition, contractAddress, web3) {
  const nodes = contractDefinition.nodes;
  for(let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if(node.nodeType === 'VariableDeclaration') {
      await processVariableDeclaration(contractDefinition, node, contractAddress, web3);
    }
  }
}

async function processVariableDeclaration(contractDefinition, node, contractAddress, web3) {
  
  // Constant variables do not use storage.
  if(node.constant) return;

  // Print variable declaration.
  const declaration = astUtil.parseNodeToString(node);
  console.log(declaration);
  // console.log(`  offset: ${rightOffset}`);
  
  // Get variable type.
  const type = node.typeDescriptions.typeString;
  // console.log(`  type: ${type}`);

  // Calculate variable size.
  const charCount = astUtil.getVariableDeclarationBytesSize(contractDefinition, node) * 2;
  const sizeRemainingInWord = 64 - rightOffset;
  if(sizeRemainingInWord < charCount) advanceSlot(charCount);
  console.log(`  size: ${charCount / 2} bytes`);
  
  // Read corresponding storage.
  console.log(`  slot: ${slot}`);
  const raw = await web3.eth.getStorageAt(contractAddress, slot);
  const word = web3.utils.padLeft(raw, 64, '0').substring(2, 66);
  console.log(`  word: ${word}`);

  // Read sub-word.
  const start = 64 - rightOffset - charCount;
  const end = start + charCount;
  let subword;
  if(type === 'string') subword = word.substring(start, end - 2);
  else subword = word.substring(start, end);
  console.log(`  subword: ${subword}`);

  // Read value in word according to type.
  const value = abiUtil.parseVariableValue(type, subword);
  console.log(`  value: ${value}`);

  advanceSlot(charCount);
}

function advanceSlot(size) {
  rightOffset += size;
  if(rightOffset >= 64) {
    rightOffset = 0;
    slot++;
  }
}
