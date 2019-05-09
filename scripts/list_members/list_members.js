const program = require('commander');
const fs = require('fs');
const path = require('path');

program
  .version('0.1.0')
  .command('run <contractPath> [listInherited]')
  .action((contractPath, listInherited) => {

    // Validate input.
    listInherited = listInherited ? listInherited === 'true' : false;
    // TODO

    // Evaluate root path.
    const rootPath = path.dirname(contractPath);
    const filename = path.basename(contractPath);

    // Parse contract.
    parseContract(filename, rootPath, listInherited);
  });

function parseContract(filename, rootPath, listInherited) {

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
  parseAst(ast, contractArtifacts.contractName, rootPath, listInherited);
}

function parseAst(ast, name, rootPath, listInherited) {
  console.log(`================> ${name} members:`);

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

  // List sub-nodes of a particular node.
  function listNodes(nodes) {
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // console.log('========> ' + node.nodeType);
      switch(node.nodeType) {
        case 'FunctionDefinition':
          console.log(parseFunctionNode(node));
          break;
        case 'VariableDeclaration':
          console.log(parseVariableNode(node));
          break;
        case 'EventDefinition':
          console.log(parseEventNode(node));
          break;
        case 'ModifierDefinition':
          console.log(parseModifierNode(node));
          break;
        case 'StructDefinition':
          console.log(parseStructNode(node));
          break;
        default:
          console.log('TODO: ' + node.nodeType);
      }
    }
  }

  // Parse node types into readable format.
  function parseStructNode(node) {
    // console.log(node);
    let str = 'struct ';
    if(node.visibility) str += node.visibility + ' ';
    str += node.name;
    str += '{\n';
    node.members.map((member) => {
      str += '  ' + parseVariableNode(member) + '\n';
    });
    str += '}';
    return str;
  }
  function parseModifierNode(node) {
    let str = 'modifier ';
    str += node.name;
    str += '(';
    str += parseParameterList(node.parameters);
    str += ')';
    str += ' {...}';
    return str;
  }
  function parseEventNode(node) {
    // console.log(node);
    let str = '';
    str += node.name;
    str += '(';
    str += parseParameterList(node.parameters);
    str += ')';
    str += ';';
    return str;
  }
  function parseVariableNode(node) {
    // console.log(node);
    let str = '';
    str += node.typeDescriptions.typeString + ' ';
    if(node.visibility) str += node.visibility + ' ';
    str += node.name;
    str += ';';
    return str;
  }
  function parseParameterList(list) {
    // console.log(list.parameters);
    if(list.parameters.length === 0) return '';
    const paramStrings = [];
    list.parameters.map((parameter) => {
      const type = parameter.typeName.name || parameter.typeDescriptions.typeString;
      paramStrings.push(`${type}${parameter.name ? ' ' + parameter.name : ''}`);
    });
    return paramStrings.join(', ');
  }
  function parseFunctionNode(node) {
    // console.log(node);
    let str = '';
    if(node.kind) {
      if(node.kind === 'constructor') str += 'constructor';
      else if(node.kind === 'function' || node.kind === 'fallback') str += 'function ' + node.name;
    }
    else str += node.name;
    str += '(';
    str += parseParameterList(node.parameters);
    str += ')';
    str += ' ';
    str += node.visibility;
    if(node.stateMutability !== 'nonpayable') str += ' ' + node.stateMutability;
    if(node.returnParameters.parameters.length > 0) str += ' returns(' + parseParameterList(node.returnParameters) + ')';
    str += ' {...}';
    return str;
  }

  // List child nodes of root node.
  listNodes(contractDefinition.nodes);
  
  // List parents.
  if(listInherited) {
    const parents = contractDefinition.baseContracts;
    if(parents && parents.length > 0) {
      for(let i = 0; i < parents.length; i++) {
        const parent = parents[i];
        const parentName = parent.baseName.name;
        parseContract(parentName + '.json', rootPath, listInherited);
      }
    }
  }
}

if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
