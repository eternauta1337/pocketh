const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const BN = require('bn.js');
const getArtifacts = require('../utils/getArtifacts.js');

let slotCounter = 0;
let offsetCounter = 0;

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
    
    // Constant variables do not use storage.
    if(node.constant) return;

    // Build variable string.
    let str = '';
    str += node.typeDescriptions.typeString + ' ';
    if(node.visibility) str += node.visibility + ' ';
    str += node.name;

    // Get variable type.
    const type = node.typeDescriptions.typeString;

    // Read corresponding storage.
    const word = await web3.eth.getStorageAt(contractAddress, slotCounter);
    const wordNoPrefix = word.substring(2, word.length);

    // Advance offset.
    // TODO: Use contains uint and regex num and do it auto?
    switch(type) {
      case 'uint256':
        offsetCounter += 256 / 4;
        break;
      case 'uint128':
        offsetCounter += 128 / 4;
        break;
      case 'uint64':
        offsetCounter += 64 / 4;
        break;
      case 'uint32':
        offsetCounter += 32 / 4;
        break;
      case 'uint16':
        offsetCounter += 16 / 4;
        break;
    }
    if(offsetCounter >= 64) offsetCounter = 0;

    // Parse value according to type.
    let value;
    console.log(`TYPE: ${type}`);
    switch(type) {
      case 'uint256':
        value = (new BN(wordNoPrefix, 16)).toString(10);
        break;
      case 'uint128':
        const subword = wordNoPrefix.substring(64 - offsetCounter, 64);
        console.log(`sub: ${subword}`);
        value = (new BN(subword, 16)).toString(10);
        break;
    }

    // Output variable and value.
    console.log(`${str}:`);
    console.log(`  slot: ${slotCounter}`);
    console.log(`  offset: ${offsetCounter}`);
    console.log(`  raw: ${word}`);
    console.log(`  value: ${value}`);

    // Advance slot.
    switch(type) {
      case 'uint256':
        slotCounter++;
        break;
    }
  }

  // List child nodes of root node.
  listNodes(contractDefinition.nodes);
}
