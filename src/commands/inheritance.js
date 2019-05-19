const path = require('path');
const treeify = require('treeify');
const getArtifacts = require('../utils/getArtifacts');
const astUtil = require('../utils/astUtil');

const tree = {};

module.exports = {
  register: (program) => {
    program
      .command(`inheritance <contractPath>`)
      .description('Displays the inheritance tree of the provided contract artifacts.')
      .action((contractPath) => {
        
        // Retrieve contract artifacts.
        const contractArtifacts = getArtifacts(contractPath);

        // Retrieve the ast.
        const ast = contractArtifacts.ast;
        if(!ast) throw new Error('AST data not found.');

        // Retrieve the target contract definition node.
        const rootContractName = path.basename(contractPath).split('.')[0];
        const rootContractDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', rootContractName);

        // Start the inheritance tree structure.
        tree[rootContractName] = {};
        traverseContractParents(ast, rootContractDefinition, tree[rootContractName]);

        // Print tree after all branches
        // have been traversed.
        console.log(treeify.asTree(tree, true));
      });
  }
};

function traverseContractParents(ast, contractDefinition, branch) {
  const parents = contractDefinition.baseContracts;
  for(let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    const parentName = parent.baseName.name;
    branch[parentName] = {};
    const parentDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', parentName);
    traverseContractParents(ast, parentDefinition, branch[parentName]);
  }
}
