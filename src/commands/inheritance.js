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
        const basedir = path.dirname(contractPath);
        const rootContractDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', rootContractName);

        // Start the inheritance tree structure.
        tree[rootContractName] = {};
        traverseContractParents(ast, rootContractDefinition, tree[rootContractName], basedir);

        // Print tree after all branches
        // have been traversed.
        console.log(treeify.asTree(tree, true));
      });
  }
};

function traverseContractParents(ast, contractDefinition, branch, basedir) {
  const parents = contractDefinition.baseContracts;
  for(let i = 0; i < parents.length; i++) {
    const parent = parents[i];
    const parentName = parent.baseName.name;
    branch[parentName] = {};
    let parentDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', parentName);
    if(parentDefinition) traverseContractParents(ast, parentDefinition, branch[parentName], basedir);
    else { // Target definition may be in another file.
      const baseContractPath = `${basedir}/${parentName}.json`;
      const baseContractArtifacts = getArtifacts(baseContractPath);
      const baseContractAst = baseContractArtifacts.ast;
      if(!baseContractAst) throw new Error('AST data not found.');
      parentDefinition = astUtil.findNodeWithTypeAndName(baseContractAst, 'ContractDefinition', parentName);
      if(parentDefinition) traverseContractParents(ast, parentDefinition, branch[parentName], basedir);
      else throw new Error(`Parent contract definition not found: ${parentName}`);
    }
  }
}
