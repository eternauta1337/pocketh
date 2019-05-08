const program = require('commander');
const fs = require('fs');

program
  .version('0.1.0')
  .command('run <contractPath>')
  .action((contractPath) => {

    // Validate input.
    // TODO

    // Retrieve contract artifacts and abi.
    if(!fs.existsSync(contractPath)) throw new Error(`Cannot find ${contractPath}.`);
    const contractArtifacts = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    // Print contract name.
    console.log(`${contractArtifacts.contractName}\n`);

    // Retrieve ast.
    const ast = contractArtifacts.ast;
    if(!ast) throw new Error(`Cannot find ast data.`);
    // console.log(JSON.stringify(ast, null, 2));
    // console.log(ast);

    // TODO: Determine if the ast is legacy or not (from compiler version?),
    // and be able to parse legacy ast.
    parseAst(ast);

  });

function parseAst(ast) {

  // Find a node of type.
  function astFindNode(nodes, type) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if(node.nodeType === type) return node;
    }
    return null;
  }

  // Find root node.
  const contractDefinition = astFindNode(ast.nodes, 'ContractDefinition');
  // console.log(contractDefinition);

  // List sub-nodes of a particular node.
  function astListNodes(nodes) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      switch(node.nodeType) {
        case 'FunctionDefinition':
          astParseFunctionNode(node);
          break;
        case 'VariableDeclaration':
          astParseVariableNode(node);
          break;
        case 'EventDefinition':
          astParseEventNode(node);
          break;
        default:
          console.log('TODO: ' + node.nodeType);
      }
    }
  }

  // Parse node types into readable format.
  function astParseEventNode(node) {
    let str = '';
    str += node.name;
    str += '('
    str += astParseParameterList(node.parameters);
    str += ')';
    str += ';';
    console.log(str);
    // console.log(node);
  }
  function astParseVariableNode(node) {
    let str = '';
    str += node.typeDescriptions.typeString + ' ';
    str += node.name;
    str += ';';
    console.log(str);
    // console.log(node);
  }
  function astParseParameterList(list) {
    // console.log(list.parameters);
    if(list.parameters.length === 0) return '';
    const paramStrings = [];
    list.parameters.map((parameter) => {
      paramStrings.push(`${parameter.typeName.name}${parameter.name ? ' ' + parameter.name : ''}`);
    });
    return paramStrings.join(', ');
  }
  function astParseFunctionNode(node) {
    // console.log(node);
    let str = '';
    if(node.kind === 'function' || node.kind === 'fallback') str += 'function ' + node.name;
    if(node.kind === 'constructor') str += 'constructor';
    str += '(';
    str += astParseParameterList(node.parameters);
    str += ')'
    str += ' ';
    str += node.visibility;
    if(node.stateMutability !== 'nonpayable') str += ' ' + node.stateMutability;
    if(node.returnParameters.parameters.length > 0) str += ' returns(' + astParseParameterList(node.returnParameters) + ')'
    str += ' {...}';
    console.log(str);
  }

  // List child nodes of root node.
  astListNodes(contractDefinition.nodes);
}

function parseLegacyAst(ast) {
  console.log(`Legacy ast not supported yet!`);
}

if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
