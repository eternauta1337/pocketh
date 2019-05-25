const path = require('path');
const getArtifacts = require('../utils/getArtifacts');
const astUtil = require('../utils/astUtil.js');
const chalk = require('chalk');

const signature = 'members <contractPath>';
const description = 'Lists all members of a contract.';
const help = chalk`
Provides a list of all the members of the provided contract (compiled or not). Uses the provided contract (compiled or not) to analyze the AST. Can list linearized inherited members and sort each by type. Also accepts a term to highlight in the output, for visually identifying certain things.

{red Eg:}

{blue > pocketh members --inherited --sort test/artifacts/Sample.json}

¬ Sample
  function testSample() public pure returns(string) \{...\}

¬ SampleDependency
  function test() public pure returns(string) \{...\}
    function testSampleDependency() public pure returns(string) \{...\}

¬ SampleAbstract
  event AnEvent(address addr);
    function test() public pure returns(string);
`;

let highlightTerm;
let sort;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .option(`--inherited`, `list inherited contracts' members as well`)
      .option(`--highlight <highlightTerm>`, `highlight a specific term in the output`)
      .option(`--sort`, `sort members by kind (if not set members will be listed as they appear in the AST)`)
      .action(async (contractPath, options) => {
        chalk.enabled = !program.disableColors;
        
        // Validate input.
        const listInherited = options.inherited;
        if(options.highlight) highlightTerm = options.highlight;
        sort = options.sort;

        // Retrieve contract artifacts.
        const contractArtifacts = await getArtifacts(contractPath);

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
  const nodes = sort ? astUtil.sortNodes(contractDefinition.nodes) : contractDefinition.nodes;
  console.log(chalk`\n{redBright.bold ¬ ${contractDefinition.name}}`);
  for(let i = 0; i < nodes.length; i++) {
    console.log(`  ${astUtil.parseNodeToString(nodes[i], highlightTerm)}`);
  }
}
