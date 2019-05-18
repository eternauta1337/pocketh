const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const BN = require('bn.js');
const getArtifacts = require('../utils/getArtifacts.js');
const astUtil = require('../utils/astUtil.js');
const abiUtil = require('../utils/abiUtil.js');

let slot = 0;
let rightOffset = 0;

module.exports = {
  register: (program) => {
    program
      .command('liststorage <networkUrl> <contractPath> <contractAddress>')
      .description(`Query the storage of a contract deployed at a given address. Requires compiled artifacts to traverse the ast and understand how to read the contract's storage.`)
      .action(async (networkUrl, contractPath, contractAddress) => {

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Retrieve contract artifacts.
        const contractArtifacts = getArtifacts(contractPath);
        // console.log( JSON.stringify(contractArtifacts.ast, null, 2) );

        // Retrieve the ast.
        const ast = contractArtifacts.ast;
        // console.log( JSON.stringify(ast, null, 2) );
        // return;
        if(!ast) throw new Error('AST data not found.');

        // Retrieve the target contract definition node.
        const contractName = path.basename(contractPath).split('.')[0];
        const contractDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', contractName);

        // Retrieve the linearized base contract nodes of the contract.
        const linearizedContractDefs = astUtil.getLinearizedBaseContractNodes(ast, contractDefinition);

        // Traverse each base contract in the linearized order, and process their variables.
        for(let i = 0; i < linearizedContractDefs.length; i++) {
          const def = linearizedContractDefs[i];
          await traverseContractDefVariables(def, contractAddress, web3);
        }
      });
  }
};

async function traverseContractDefVariables(contractDefinition, contractAddress, web3) {
  
  // Traverse ast nodes and focus on top level variable declarations.
  async function listNodes(nodes) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if(node.nodeType === 'VariableDeclaration') {
        await processVariableDeclaration(node);
      }
    }
  }

  // Parse node types into readable format.
  async function processVariableDeclaration(node) {
    // console.log(node);
    
    // Constant variables do not use storage.
    if(node.constant) return;

    // Print variable declaration.
    const declaration = getVariableDeclaration(node);
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

  // List child nodes of root node.
  await listNodes(contractDefinition.nodes);
}

function advanceSlot(size) {
  rightOffset += size;
  if(rightOffset >= 64) {
    rightOffset = 0;
    slot++;
  }
}

function getVariableDeclaration(node) {
  let str = '';
  str += node.typeDescriptions.typeString + ' ';
  if(node.visibility) str += node.visibility + ' ';
  str += node.name;
  return str;
}
