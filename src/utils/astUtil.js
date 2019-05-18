const stringUtil = require('./stringUtil.js');

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
    if(node.nodeType !== 'VariableDeclaration') throw new Error('Not a VariableDeclaraction node.')
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
  }
};

module.exports = astUtil;
