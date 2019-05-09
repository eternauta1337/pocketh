const fs = require('fs');
const path = require('path');

module.exports = {
  register: (program) => {
    program
      .command(`inheritance <contractPath>`)
      .action((contractPath) => {
        
        // Validate input.
        // TODO

        // Evaluate root path.
        const rootPath = path.dirname(contractPath);
        const filename = path.basename(contractPath);

        // Parse contract.
        parseContract(filename, rootPath, 0);
      });
  }
};

function parseContract(filename, rootPath, spaces) {

  // Retrieve contract artifacts and abi.
  const contractPath = rootPath + '/' + filename;
  if(!fs.existsSync(contractPath)) throw new Error(`Cannot find ${contractPath}.`);
  const contractArtifacts = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

  // Retrieve ast.
  const ast = contractArtifacts.ast;
  if(!ast) throw new Error(`Cannot find ast data.`);
  // console.log(JSON.stringify(ast, null, 2));
  // console.log(ast);

  // Print out members.
  parseAst(ast, contractArtifacts.contractName, rootPath, spaces);
}

function parseAst(ast, name, rootPath, spaces) {
  console.log(`${'  '.repeat(spaces)}- ${name}`);

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
  const parents = contractDefinition.baseContracts;
  if(parents && parents.length > 0) {
    for(let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const parentName = parent.baseName.name;
      parseContract(parentName + '.json', rootPath, spaces + 1);
    }
  }
}
