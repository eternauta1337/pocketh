const fs = require('fs');
const path = require('path');
const getArtifacts = require('../utils/getArtifacts');

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
      // process.stdout.write('========> ' + node.nodeType);
      const prefix = listInherited ? `(${name}) ` : '';
      switch(node.nodeType) {
        case 'FunctionDefinition':
          process.stdout.write(`${prefix}${parseFunctionNode(node)}\n`);
          break;
        case 'VariableDeclaration':
          process.stdout.write(`${prefix}${parseVariableNode(node)}\n`);
          break;
        case 'EventDefinition':
          process.stdout.write(`${prefix}${parseEventNode(node)}\n`);
          break;
        case 'ModifierDefinition':
          process.stdout.write(`${prefix}${parseModifierNode(node)}\n`);
          break;
        case 'StructDefinition':
          process.stdout.write(`${prefix}${parseStructNode(node)}\n`);
          break;
        default:
          process.stdout.write(`TODO: ${node.nodeType}`);
      }
    }
  }

  // Parse node types into readable format.
  function parseStructNode(node) {
    // process.stdout.write(node);
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
    // process.stdout.write(node);
    let str = '';
    str += node.name;
    str += '(';
    str += parseParameterList(node.parameters);
    str += ')';
    str += ';';
    return str;
  }
  function parseVariableNode(node) {
    // process.stdout.write(node);
    let str = '';
    str += node.typeDescriptions.typeString + ' ';
    if(node.visibility) str += node.visibility + ' ';
    if(node.constant) str += 'constant ';
    str += node.name;
    str += ';';
    return str;
  }
  function parseParameterList(list) {
    // process.stdout.write(list.parameters);
    if(list.parameters.length === 0) return '';
    const paramStrings = [];
    list.parameters.map((parameter) => {
      const type = parameter.typeName.name || parameter.typeDescriptions.typeString;
      paramStrings.push(`${type}${parameter.name ? ' ' + parameter.name : ''}`);
    });
    return paramStrings.join(', ');
  }
  function parseFunctionNode(node) {
    // process.stdout.write(node);
    let str = '';
    if(node.kind) {
      if(node.kind === 'constructor') str += 'constructor';
      else if(node.kind === 'function' || node.kind === 'fallback') str += 'function ' + node.name;
    }
    else str += 'function ' + node.name;
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
