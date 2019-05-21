const stringUtil = require('./stringUtil.js');
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

  getLinearizedBaseContractNodes: (ast, contractDefinition) => {
    const nodes = [];
    for(let i = 0; i < contractDefinition.linearizedBaseContracts.length; i++) {
      const baseContractId = contractDefinition.linearizedBaseContracts[i];
      nodes.unshift(astUtil.findNodeWithId(ast, baseContractId));
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

  parseNodeToString: (node) => {

    // Colored keyword templates.
    const t = {
      _using       : ()  => `red using`,
      _function    : ()  => `blue function`,
      _modifier    : ()  => `blueBright.italic modifier`,
      _constructor : ()  => `blue.bold constructor`,
      _public      : ()  => `yellow.bold public`,
      _external    : ()  => `yellow.bold public`,
      _view        : ()  => `italic view`,
      _pure        : ()  => `italic pure`,
      _internal    : ()  => `yellow.italic internal`,
      _payable     : ()  => `yellow.bold payable`,
      _constant    : ()  => `gray constant`,
      _event       : ()  => `magenta event`,
      _struct      : ()  => `green.bold struct`,
      _implemented : ()  => `gray {...}`,
      _var         : (t) => `green ${t}`,
      _dynamic     : (v) => t[`_${v}`](),
      _            : (v) => `whiteBright.bgRed ${v}`
    };

    function parseParameterList(list) {
      if(list.parameters.length === 0) return '';
      const paramStrings = [];
      list.parameters.map((parameter) => {
        const type = parameter.typeName.name || parameter.typeDescriptions.typeString;
        paramStrings.push(chalk`{${t._var(type)}}${parameter.name ? ' ' + parameter.name : ''}`);
      });
      return paramStrings.join(', ');
    }

    let str = '';
    switch(node.nodeType) {
      case 'FunctionDefinition':
        if(node.kind) {
          if(node.kind === 'constructor') str += chalk`{${t._constructor()}}`;
          else if(node.kind === 'function' || node.kind === 'fallback') str += chalk`{${t._function()}} ` + node.name;
        }
        else str += chalk`{${t._function()}} ` + node.name;
        str += '(';
        str += parseParameterList(node.parameters);
        str += ')';
        str += ' ';
        str += chalk`{${t._dynamic(node.visibility)}}`;
        if(node.stateMutability !== 'nonpayable') str += ' ' + chalk`{${t._dynamic(node.stateMutability)}}`;
        if(node.returnParameters.parameters.length > 0) str += ' returns(' + parseParameterList(node.returnParameters) + ')';
        str += chalk` {${t._implemented()}}`;
        break;
      case 'VariableDeclaration':
        str += chalk`{green ${node.typeDescriptions.typeString.replace('contract ', '')}}` + ' ';
        if(node.visibility) str += chalk`{${t._dynamic(node.visibility)}}` + ' ';
        if(node.constant) str += chalk`{${t._constant()}} `;
        str += node.name;
        str += ';';
        break;
      case 'EventDefinition':
        str += chalk`{${t._event()}} ` + node.name;
        str += '(';
        str += parseParameterList(node.parameters);
        str += ')';
        str += ';';
        break;
      case 'ModifierDefinition':
        str += chalk`{${t._modifier()}} `;
        str += node.name;
        str += '(';
        str += parseParameterList(node.parameters);
        str += ')';
        str += chalk` {${t._implemented()}}`;
        break;
      case 'StructDefinition':
        str += chalk`{${t._struct()}} `;
        if(node.visibility) str += node.visibility + ' ';
        str += node.name;
        str += ' {\n';
        node.members.map((member) => {
          str += '    ' + astUtil.parseNodeToString(member) + '\n';
        });
        str += '  }';
        break;
      case 'UsingForDirective':
        str += chalk`{${t._using()}} `;
        str += node.libraryName.name;
        str += ' for ';
        str += node.typeName.name + ';';
        break;
      default:
        console.log(chalk`{yellow.bold WARNING}: astUtil does not know how to convert node type ${node.nodeType} to string.`);
    }

    return str;
  }
};

module.exports = astUtil;
