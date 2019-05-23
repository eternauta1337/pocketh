const path = require('path');
const getArtifacts = require('../utils/getArtifacts');
const astUtil = require('../utils/astUtil.js');
const chalk = require('chalk');

let highlightTerm;

module.exports = {
  register: (program) => {
    program
      .command(`members <contractPath>`)
      .description('Provides a list of all the members of the provided contract artifacts.')
      .option(`--inherited`, `list inherited contracts' members as well`)
      .option(`--highlight <highlightTerm>`, `highlight a specific term in the output`)
      .action((contractPath, options) => {
        chalk.enabled = !program.disableColors;
        
        // Validate input.
        const listInherited = options.inherited;
        if(options.highlight) highlightTerm = options.highlight;

        // Retrieve contract artifacts.
        const contractArtifacts = getArtifacts(contractPath);

        // Retrieve the ast.
        const ast = contractArtifacts.ast;
        if(!ast) throw new Error('AST data not found.');

        // Retrieve the target contract definition node.
        const rootContractName = path.basename(contractPath).split('.')[0];
        const rootContractDefinition = astUtil.findNodeWithTypeAndName(ast, 'ContractDefinition', rootContractName);

        // Process single contract of all base contracts.
        if(listInherited) {
          const basedir = path.dirname(contractPath);
          processAllBaseContractsFromContractDefinition(ast, rootContractDefinition, basedir);
        }
        else processAllNodesInContractDefinition(rootContractDefinition, false);
      });
  }
};

function processAllBaseContractsFromContractDefinition(ast, contractDefinition, basedir) {

  // Retrieve the linearized base contract nodes of the contract.
  const linearizedContractDefs = astUtil.getLinearizedBaseContractNodes(ast, contractDefinition, basedir);

  // Traverse each base contract in the linearized order, and process their variables.
  for(let i = 0; i < linearizedContractDefs.length; i++) {
    const contractDefinition = linearizedContractDefs[i];
    if(contractDefinition && contractDefinition.nodes) processAllNodesInContractDefinition(contractDefinition, true);
    else console.log("WARNING: Contract definition not found for a base contract.");
  }
}

function processAllNodesInContractDefinition(contractDefinition) {
  const nodes = contractDefinition.nodes;
  console.log(chalk`\n{redBright.bold ¬ ${contractDefinition.name}}`);
  for(let i = 0; i < nodes.length; i++) {
    console.log(`  ${astUtil.parseNodeToString(nodes[i], highlightTerm)}`);
  }
}
