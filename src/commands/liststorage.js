const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const BN = require('bn.js');
const getArtifacts = require('../utils/getArtifacts.js');

let slot = 0;
let rightOffset = 0;

module.exports = {
  register: (program) => {
    program
      .command('liststorage <networkUrl> <contractPath> <contractAddress>')
      .description('Query the storage of a contract deployed at a given address.')
      .action(async (networkUrl, contractPath, contractAddress) => {
        console.log(`WARNING: This command cannot handle inheritance yet =(. Pls see: https://github.com/ajsantander/pocketh/issues/50`);

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Retrieve contract artifacts.
        const contractArtifacts = getArtifacts(contractPath);

        // Parse ast and read storage as variables are found.
        parseAst(
          contractArtifacts.ast, 
          contractArtifacts.contractName,
          contractAddress,
          web3
        );
      });
  }
};

function parseAst(ast, name, contractAddress, web3) {
  
  // Find a node of type.
  function findNode(nodes, type, name) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if(node.nodeType === type && node.name === name) return node;
    }
    return null;
  }

  // Find root node.
  const contractDefinition = findNode(ast.nodes, 'ContractDefinition', name);

  // Traverse ast nodes and focus on top level variable declarations.
  async function listNodes(nodes) {
    let variableCount = 0;
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if(node.nodeType === 'VariableDeclaration') {
        variableCount++;
        await processVariableDeclaration(node);
      }
    }
    if(variableCount === 0) console.log(`No variables found in the provided artifacts.`);
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
    const size = getVariableSize(type, web3);
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
  listNodes(contractDefinition.nodes);
}

function advanceSlot(size) {
  rightOffset += size;
  if(rightOffset >= 64) {
    rightOffset = 0;
    slot++;
  }
}

function getVariableSize(type, web3) {
  let size = 64;
  if(type.includes('int')) {
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
  if(type.includes('[]') || type.includes('mapping')) {
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
