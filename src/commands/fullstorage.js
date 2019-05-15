const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const BN = require('bn.js');
const getArtifacts = require('../utils/getArtifacts.js');

let slot = 0;
let offset = 0;

module.exports = {
  register: (program) => {
    program
      .command('fullstorage <networkUrl> <contractPath> <contractAddress>')
      .description('Query the storage of a contract deployed at a given address.')
      .action(async (networkUrl, contractPath, contractAddress) => {

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
  // process.stdout.write(contractDefinition);

  // List sub-nodes of a particular node.
  async function listNodes(nodes) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if(node.nodeType === 'VariableDeclaration') await parseVariableNode(node);
    }
  }

  // Parse node types into readable format.
  async function parseVariableNode(node) {
    // console.log(node);
    
    let word;
    
    // Constant variables do not use storage.
    if(node.constant) return;

    // Build variable string.
    let str = '';
    str += node.typeDescriptions.typeString + ' ';
    if(node.visibility) str += node.visibility + ' ';
    str += node.name;
    console.log(`${str}:`);

    // Get variable type.
    const type = node.typeDescriptions.typeString;
    console.log(`  type: ${type}`);

    // Calculate variable size and advance offset.
    let size = 0;
    let newOffset = offset;
    if(type.includes('uint')) {
      const bits = parseInt(type.match(/\d+/), 10);
      size = bits / 4;
      newOffset += size;
    }
    else if(type.includes('bytes')) {
      const bytes = parseInt(type.match(/\d+/), 10);
      size = bytes * 2;
      newOffset += size;
    }
    else if(type === 'string') {
      word = (await web3.eth.getStorageAt(contractAddress, slot)).substring(2, 66);
      strSize = web3.utils.hexToNumber('0x' + word.substring(62, 64));
      if(strSize < 62) {
        size = 62;
        newOffset += 64;
      }
      else throw new Error('Unable to handle multislot strings yet.');
    }
    console.log(`  size: ${size}`);
    
    // If incoming variable doesn't fit in the remained of the last slot,
    // Advance the slot.
    if(64 - offset < size) {
      offset = 0;
      slot++;
    }
    console.log(`  slot: ${slot}`);
    offset = newOffset;

    // Read corresponding storage.
    if(!word) word = (await web3.eth.getStorageAt(contractAddress, slot)).substring(2, 66);
    console.log(`  word: ${word}`);

    // Read sub-word.
    const subword = readSubWord(word, size);
    console.log(`  subword: ${subword}`);

    // Read value in word according to type.
    let value;
    if(type.includes('uint')) {
      value = (new BN(subword, 16)).toString(10);
    }
    else if(type.includes('bytes')) {
      const asciiString = web3.utils.toAscii(`0x${subword}`);
      value = `${subword} (${asciiString})`;
    }
    console.log(`  value: ${value}`);

    // Advance slot.
    if(offset >= 64) {
      offset = 0;
      slot++;
    }
  }

  // List child nodes of root node.
  listNodes(contractDefinition.nodes);
}

function readSubWord(word, size) {
  const startIdx = 64 - offset;
  const endIdx = startIdx + size;
  return word.substring(startIdx, endIdx);
}
