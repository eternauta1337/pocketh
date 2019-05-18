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
  }
};

module.exports = astUtil;
