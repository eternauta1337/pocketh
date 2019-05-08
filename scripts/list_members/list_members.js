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
    // console.log(JSON.stringify(ast, null, 2));

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
          default:
            console.log('TODO: ' + node.nodeType);
        }
      }
    }

    // Parse parameter list.
    function astParseParameterList(list) {
      // console.log(list.parameters);
      if(list.parameters.length === 0) return '';
      const paramStrings = [];
      list.parameters.map((parameter) => {
        paramStrings.push(`${parameter.typeName.name}${parameter.name ? ' ' + parameter.name : ''}`);
      });
      return paramStrings.join(', ');
    }

    // Parse node types into readable format.
    function astParseFunctionNode(node) {
      let str = '';
      if(node.kind === 'function') str += 'function ' + node.name;
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

      // if(node.name === 'sendCoin') console.log( JSON.stringify(node, null, 2) );
      
      // const prefix = node.kind === 'function' ? 'function ' : '';
      // const name = node.kind === 'constructor' ? 'constructor' : node.name;
      // const visibility = node.visibility + ' ';
      // const mutability = node.stateMutability === 'nonpayable' ? '' : node.stateMutability + ' ';
      // const input = astParseParameterList(node.parameters);
      // const output = node.returnParameters.parameters.length > 0 ? 'returns ' + astParseParameterList(node.returnParameters) : '';
      // console.log(`${prefix}${name}(${input})${visibility}${mutability}${output}{...}`);
    }

    // List child nodes of root node.
    astListNodes(contractDefinition.nodes);

  });

if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
