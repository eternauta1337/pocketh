const fs = require('fs');
const path = require('path');
const treeify = require('treeify');
const getArtifacts = require('../utils/getArtifacts');

const listedContracts = [];
const tree = {};
let rootName;

module.exports = {
  register: (program) => {
    program
      .command(`inheritance <contractPath>`)
      .description('Displays the inheritance tree of the provided contract artifacts.')
      .action((contractPath) => {
        
        // Evaluate root path.
        const rootPath = path.dirname(contractPath);
        const filename = path.basename(contractPath);

        // Parse contract.
        rootName = filename.split('.')[0];
        tree[rootName] = {};
        parseContract(filename, rootPath, tree[rootName]);
      });
  }
};

function parseContract(filename, rootPath, branch) {

  // Retrieve contract artifacts and abi.
  const contractPath = rootPath + '/' + filename;
  const contractArtifacts = getArtifacts(contractPath);
  // Retrieve ast.
  const ast = contractArtifacts.ast;
  if(!ast) throw new Error(`Cannot find ast data.`);
  // console.log(JSON.stringify(ast, null, 2));
  // console.log(ast);

  // Print out members.
  parseAst(ast, contractArtifacts.contractName, rootPath, branch);
}

function parseAst(ast, name, rootPath, branch) {

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
  // console.log(contractDefinition);
  
  // Find parents.
  listedContracts.push(name);
  const parents = contractDefinition.baseContracts;
  if(parents && parents.length > 0) {
    for(let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const parentName = parent.baseName.name;
      if(!listedContracts.includes(parentName)) {
        branch[parentName] = {};
        parseContract(parentName + '.json', rootPath, branch[parentName]);
      }
    }
    if(name === rootName) console.log(treeify.asTree(tree, true));
  }
}
