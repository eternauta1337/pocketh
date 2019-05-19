const path = require('path');
const getArtifacts = require('../utils/getArtifacts');
const astUtil = require('../utils/astUtil.js');
const chalk = require('chalk');

module.exports = {
  register: (program) => {
    program
      .command(`members <contractPath>`)
      .description('Provides a list of all the members of the provided contract artifacts.')
      .option(`--inherited`, `list inherited contracts' members as well`)
      .action((contractPath, options) => {
        chalk.enabled = !program.disableColors;
        
        // Validate input.
        const listInherited = options.inherited;

        // Retrieve contract artifacts.
        const contractArtifacts = getArtifacts(contractPath);

        // Retrieve the ast.
        const ast = contractArtifacts.ast;
        if(!ast) throw new Error('AST data not found.');

        // Retrieve the target contract definition node.
        const rootContractName = path.basename(contractPath).split('.')[0];
        const rootContractDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', rootContractName);

        // Process single contract of all base contracts.
        if(listInherited) processAllBaseContractsFromContractDefinition(ast, rootContractDefinition);
        else processAllNodesInContractDefinition(rootContractDefinition, false);
      });
  }
};

function processAllBaseContractsFromContractDefinition(ast, contractDefinition) {

  // Retrieve the linearized base contract nodes of the contract.
  const linearizedContractDefs = astUtil.getLinearizedBaseContractNodes(ast, contractDefinition);

  // Traverse each base contract in the linearized order, and process their variables.
  for(let i = 0; i < linearizedContractDefs.length; i++) {
    const contractDefinition = linearizedContractDefs[i];
    processAllNodesInContractDefinition(contractDefinition, true);
  }
}

function processAllNodesInContractDefinition(contractDefinition) {
  const nodes = contractDefinition.nodes;
  console.log(chalk`\n{redBright.bold ¬ ${contractDefinition.name}}`);
  for(let i = 0; i < nodes.length; i++) {
    console.log(`  ${astUtil.parseNodeToString(nodes[i])}`);
  }
}
