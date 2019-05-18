const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const BN = require('bn.js');
const getArtifacts = require('../utils/getArtifacts.js');
const astUtil = require('../utils/astUtil.js');

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

// ----------------------------------------------------------------
/* OLD CODE */
// ----------------------------------------------------------------

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
    const size = getVariableSize(contractDefinition, node, type, web3);
    const sizeRemainingInWord = 64 - rightOffset;
    if(sizeRemainingInWord < size) advanceSlot(size);
    console.log(`  size: ${size / 2} bytes`);
    
    // Read corresponding storage.
    console.log(`  slot: ${slot}`);
    const raw = await web3.eth.getStorageAt(contractAddress, slot);
    const word = web3.utils.padLeft(raw, 64, '0').substring(2, 66);
    console.log(`  word: ${word}`);

    // Read sub-word.
    const start = 64 - rightOffset - size;
    const end = start + size;
    let subword;
    if(type === 'string') subword = word.substring(start, end - 2);
    else subword = word.substring(start, end);
    console.log(`  subword: ${subword}`);

    // Read value in word according to type.
    const value = getVariableValue(subword, type, web3);
    console.log(`  value: ${value}`);

    advanceSlot(size);
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

function getVariableSize(contractDefinition, node, type, web3) {
  let size = 64;
  if(type.substring(0, 6) === 'struct') {
    const declarationId = node.typeName.baseType.referencedDeclaration;
    const declarationNode = astUtil.findNodeWithId(contractDefinition, declarationId);
    let sum = 0;
    for(let i = 0; i < declarationNode.members.length; i++) {
      const member = declarationNode.members[i];
      const type = member.typeDescriptions.typeString;
      sum += getVariableSize(contractDefinition, member, type, web3);
    }
    size = sum;
  }
  else if(type.substring(0, 8) === 'contract') {
    size = 40; // address
  }
  else if(type.includes('mapping')) {
    size = 64;
  }
  else if(type.includes('int')) {
    const bits = parseInt(type.match(/\d+/), 10);
    size = bits / 4;
  }
  else if(type.includes('bytes')) {
    const bytes = parseInt(type.match(/\d+/), 10);
    size = bytes * 2;
  }
  else if(type === 'string') {
    size = 64;
  }
  else if(type === 'bool') {
    size = 2;
  }
  else if(type === 'address') {
    size = 40;
  }
  return size;
}

function getVariableValue(subword, type, web3) {
  let value;
  if(type.includes('struct')) {
    value = 'composite';
  }
  else if(type.substring(0, 8) === 'contract') {
    value = `0x${subword}`;
  }
  else if(type.includes('[]') || type.includes('mapping')) {
    value = 'dynamic';
  }
  else if(type.includes('uint')) {
    value = (new BN(subword, 16)).toString(10);
  }
  else if(type.includes('int')) {
    const raw = new BN(subword, 16).fromTwos(256);
    value = raw.toString(10);
  }
  else if(type.includes('bytes')) {
    const asciiString = web3.utils.toAscii(`0x${subword}`);
    value = `${subword} (${asciiString})`;
  }
  else if(type === 'string') {
    if(subword === '0'.repeat(62)) value = 'dynamic';
    else {
      const asciiString = web3.utils.toAscii(`0x${subword}`);
      value = `${asciiString}`;
    }
  }
  else if(type === 'bool') {
    value = subword === '01' ? 'true' : 'false';
  }
  else if(type === 'address') {
    value = `0x${subword}`;
  }
  return value;
}

function getVariableDeclaration(node) {
  let str = '';
  str += node.typeDescriptions.typeString + ' ';
  if(node.visibility) str += node.visibility + ' ';
  str += node.name;
  return str;
}
