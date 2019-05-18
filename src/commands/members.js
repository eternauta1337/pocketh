const fs = require('fs');
const path = require('path');
const getArtifacts = require('../utils/getArtifacts');
const astUtil = require('../utils/astUtil.js');

const listedContracts = [];

module.exports = {
  register: (program) => {
    program
      .command(`members <contractPath>`)
      .description('Provides a list of all the members of the provided contract artifacts.')
      .option(`--inherited`, `list inherited contracts' members as well`)
      .action((contractPath, options) => {
        
        // Validate input.
        const listInherited = options.inherited;

        // Evaluate root path.
        const rootPath = path.dirname(contractPath);
        const filename = path.basename(contractPath);

        // Parse contract.
        parseContract(filename, rootPath, listInherited);
      });
  }
};

function parseContract(filename, rootPath, listInherited) {

  // Retrieve contract artifacts and abi.
  const contractPath = rootPath + '/' + filename;
  const contractArtifacts = getArtifacts(contractPath);

  // Retrieve ast.
  const ast = contractArtifacts.ast;
  if(!ast) throw new Error(`Cannot find ast data.`);
  // process.stdout.write(JSON.stringify(ast, null, 2));
  // process.stdout.write(ast);

  // Print out members.
  parseAst(ast, contractArtifacts.contractName, rootPath, listInherited);
}

function parseAst(ast, name, rootPath, listInherited) {
  
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
  function listNodes(nodes) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const prefix = listInherited ? `(${name}) ` : '';
      console.log(`${prefix}${astUtil.parseNodeToString(node)}`);
    }
  }

  // List child nodes of root node.
  listNodes(contractDefinition.nodes);
  
  // List parents.
  listedContracts.push(name);
  if(listInherited) {
    const parents = contractDefinition.baseContracts;
    if(parents && parents.length > 0) {
      for(let i = 0; i < parents.length; i++) {
        const parent = parents[i];
        const parentName = parent.baseName.name;
        if(!listedContracts.includes(parentName)) {
          parseContract(parentName + '.json', rootPath, listInherited);
        }
      }
    }
  }
}
