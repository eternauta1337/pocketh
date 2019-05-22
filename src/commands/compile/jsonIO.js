const path = require('path');

module.exports = {
  
  buildStandardJsonInput: (filename, source) => {
    return {
      language: "Solidity",
      sources: {
        [filename]: {
          content: source
        }
      },
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        },
        outputSelection: {
          "*": {
            "*": [ 
              "abi",
              "metadata",
              "evm.bytecode.object",
              "evm.bytecode.sourceMap",
              "evm.deployedBytecode.object",
              "evm.deployedBytecode.sourceMap"
            ], 
            "": [ "*" ] 
          } 
        }
      }
    };
  },

  /*
   * Solcjs output and truffle compiler output are different.
   * Solcjs outputs one json file per source file (a source file may contain multiple contracts).
   * Truffle re-shuffles the original solcjs output and splits it into multiple json files,
   * one per contract. To maintain compatibility, we do the same thing here.
   * */
  oneJsonPerContract: (output) => {
    const jsons = [];
    const filepaths = Object.keys(output.contracts);
    filepaths.map(filepath => {
      const name = path.basename(filepath).split('.')[0];
      const contract = output.contracts[filepath][name];
      const source = output.sources[filepath];
      jsons.push({
        contractName: name,
        abi: contract.abi,
        metadata: contract.metadata,
        bytecode: contract.evm.bytecode.object,
        deployedBytecode: contract.evm.deployedBytecode.object,
        ast: source.ast
      });
    });
    return jsons;
  },
};
