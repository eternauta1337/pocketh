const stringUtil = require('./stringUtil');
const highlightUtil = require('./highlightUtil');
const getArtifacts = require('./getArtifacts');
const chalk = require('chalk');

const astUtil = {

  findNodeWithCondition: (ast, conditionFunction) => {
    for(let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      if(conditionFunction(node)) return node;
      if(node.nodes) {
        const match = astUtil.findNodeWithCondition(node, conditionFunction);
        if(match) return match;
      }
    }
  },

  findNodeWithId: (ast, id) => {
    return astUtil.findNodeWithCondition(ast, node => node.id === id);
  },

  findNodeWithTypeAndName: (ast, type, name) => {
    return astUtil.findNodeWithCondition(ast, node => node.nodeType === type && node.name === name);
  },

  getLinearizedBaseContractNodes: async (ast, contractDefinition, basedir) => {
    // A ContractDefinition's linearizedBaseContracts property is an array
    // of numeric id's that refer to ContractDefinition's, e.g:
    // [13, 35, 47]
    // The ContractDefinitions with such id's may or may not be stored in
    // the ast and may have to be found on another file's ast.
    let nodes = [];
    for(let i = 0; i < contractDefinition.linearizedBaseContracts.length; i++) {
      const baseContractId = contractDefinition.linearizedBaseContracts[i];
      let baseContractDef = astUtil.findNodeWithId(ast, baseContractId);
      if(baseContractDef) nodes.push(baseContractDef);
      else { // Base contract definition is stored in a different file.
        // Get file name.
        let baseContractName;
        for(let i = 0; i < contractDefinition.baseContracts.length; i++) {
          const baseContract = contractDefinition.baseContracts[i];
          if(baseContract.baseName.referencedDeclaration === baseContractId) {
            baseContractName = baseContract.baseName.name;
            break;
          }
        }
        if(baseContractName) {
          // Load the file.
          const baseContractPath = `${basedir}/${baseContractName}.json`;
          const { artifacts } = await getArtifacts(baseContractPath);
          const baseContractAst = artifacts.ast;
          if(!baseContractAst) throw new Error(`AST data not found for ${baseContractPath}`);
          // Look for target definition there.
          baseContractDef = astUtil.findNodeWithTypeAndName(baseContractAst, 'ContractDefinition', baseContractName);
          const baseContractNodes = await astUtil.getLinearizedBaseContractNodes(baseContractAst, baseContractDef, basedir);
          // Combine the findings.
          nodes = [...nodes, ...baseContractNodes];
        }
      }
    }
    return nodes;
  },

  getVariableDeclarationBytesSize: (contractDefinition, node) => {
    if(node.nodeType !== 'VariableDeclaration') throw new Error('Not a VariableDeclaraction node.');
    const type = node.typeDescriptions.typeString;

    if(type.startsWith('struct')) {

      // The type of the struct is actually declared in another node.
      const declarationId = node.typeName.baseType.referencedDeclaration;
      const declarationNode = astUtil.findNodeWithId(contractDefinition, declarationId);

      // Accumulate the size of the members.
      let sum = 0;
      for(let i = 0; i < declarationNode.members.length; i++) {
        const member = declarationNode.members[i];
        sum += astUtil.getVariableDeclarationBytesSize(contractDefinition, member);
      }
      return sum;
    }

    if(type.startsWith('contract') || type.startsWith('address')) {
      return 20;
    }

    if(type.startsWith('mapping') || type === 'bytes' || type.includes('[]')) {
      return 32;
    }

    if(type.startsWith('string')) {
      // TODO: It's actually 31 or more. The actual length is stored in the last byte of the first word.
      return 32;
    }

    if(type.startsWith('bytes')) {
      const bytes = stringUtil.getNumericSubstring(type);
      return bytes;
    }

    if(type.startsWith('uint') || type.startsWith('int')) {
      const bits = stringUtil.getNumericSubstring(type);
      return bits / 8;
    }

    if(type === 'bool') {
      return 1;
    }

    throw new Error(`astUtil cannot determine the size of variable of type ${type}`);
  },

  sortNodes: (nodes) => {
    const nodeOrder = [
      'UsingForDirective',
      'EnumDefinition',
      'StructDefinition',
      'VariableDeclaration',
      'EventDefinition',
      'ModifierDefinition',
      'FunctionDefinition',
    ];
    nodes.sort((node1, node2) => {
      return nodeOrder.indexOf(node1.nodeType) > nodeOrder.indexOf(node2.nodeType) ? 1 : -1;
    });
    return nodes;
  },

  parseNodeToString: (node, highlightTerm) => {

    function parseParameterList(list) {
      if(list.parameters.length === 0) return '';
      const paramStrings = [];
      list.parameters.map((parameter) => {
        const type = parameter.typeName.name || parameter.typeDescriptions.typeString;
        paramStrings.push(`${type}${parameter.name ? ' ' + parameter.name : ''}`);
      });
      return paramStrings.join(', ');
    }

    function parseEnumMembers(members) {
      if(members.length === 0) return '';
      const memberStrings = [];
      members.map((member) => {
        memberStrings.push(`    ${member.name}`);
      });
      return memberStrings.join(',\n');
    }

    function parseModifierInvocations(modifiers) {
      if(modifiers.length === 0) return '';
      const modifierStrings = [];
      modifiers.map((modifier) => {
        if(modifier.arguments) {
          modifierStrings.push(`${modifier.modifierName.name}(${modifier.arguments.map(arg => arg.value).join(', ')})`);
        } else modifierStrings.push(modifier.modifierName.name);
      });
      return modifierStrings.join(' ');
    }

    let str = '';
    switch(node.nodeType) {
      case 'FunctionDefinition':
        if(node.kind) {
          if(node.kind === 'constructor') str += `constructor`;
          else if(node.kind === 'function' || node.kind === 'fallback') str += `function ` + node.name;
        }
        else str += `function ` + node.name;
        str += '(';
        str += parseParameterList(node.parameters);
        str += ')';
        str += ' ';
        str += `${node.visibility}`;
        if(node.stateMutability !== 'nonpayable') str += ' ' + `${node.stateMutability}`;
        if(node.modifiers && node.modifiers.length > 0) str += ` ${parseModifierInvocations(node.modifiers)}`;
        if(node.returnParameters.parameters.length > 0) str += ' returns(' + parseParameterList(node.returnParameters) + ')';
        if(node.implemented) str += ` {...}`;
        else str += ';';
        break;
      case 'VariableDeclaration':
        let varType = node.typeDescriptions.typeString;
        varType = varType.replace('contract ', ''); // Hide "'contract '<SomeContract>" part of custom types.
        str += `${varType}` + ' ';
        let varVisibility = node.visibility;
        varVisibility = varVisibility.replace('internal', ''); // Hide internal visibility keywords.
        if(varVisibility) str += `${varVisibility}` + ' ';
        if(node.constant) str += `constant `;
        str += node.name;
        str += ';';
        break;
      case 'EventDefinition':
        str += `event ` + node.name;
        str += '(';
        str += parseParameterList(node.parameters);
        str += ')';
        str += ';';
        break;
      case 'ModifierDefinition':
        str += `modifier `;
        str += node.name;
        str += '(';
        str += parseParameterList(node.parameters);
        str += ')';
        str += ` {...}`;
        break;
      case 'StructDefinition':
        str += `struct `;
        if(node.visibility) str += node.visibility + ' ';
        str += node.name;
        str += ' {\n';
        node.members.map((member) => {
          str += '    ' + astUtil.parseNodeToString(member) + '\n';
        });
        str += '  }';
        break;
      case 'UsingForDirective':
        str += `using `;
        str += node.libraryName.name;
        str += ' for ';
        str += node.typeName.name + ';';
        break;
      case 'EnumDefinition':
        str += 'enum ';
        str += node.name;
        str += ' {\n';
        str += parseEnumMembers(node.members);
        str += '\n  }';
        break;
      default:
        console.log(chalk`{yellow.bold WARNING}: astUtil does not know how to convert node type ${node.nodeType} to string.`);
        str += node.name;
    }

    return highlightUtil.syntax(str, highlightTerm);
  }
};

module.exports = astUtil;
