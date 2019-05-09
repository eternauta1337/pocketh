const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');

module.exports = {
  register: (program) => {
    program
      .command(`txs <networkName> <contractAddress> <functionSelector> <fromBlock> [toBlock]`)
      .description('Finds transactions made to a deployed contract, for a specified funciton selector.')
      .action(async (networkName, contractAddress, functionSelector, fromBlock, toBlock) => {
        
        // Validate input.
        contractAddress = contractAddress.toLowerCase();
        fromBlock = parseInt(fromBlock, 10);
        toBlock = toBlock ? toBlock : 'latest';

        // Connect to network.
        const web3 = await getWeb3(networkName);

        // Query a transaction.
        async function queryTransaction(txHash) {
          const tx = await web3.eth.getTransaction(txHash);
          if(tx.to && tx.to.toLowerCase() === contractAddress) {
            if(tx.input.substring(0, 10) === functionSelector) {
              console.log(`\n`, tx);
            }
          }
        }

        // Query a block.
        async function queryBlock(blockNumber) {
          const block = await web3.eth.getBlock(blockNumber);
          block.transactions.map(async (txHash) => {
            await queryTransaction(txHash);
          });
        }

        // Sweep blocks.
        if(toBlock === 'latest') toBlock = await web3.eth.getBlockNumber();
        let currentBlock = fromBlock;
        const numBlocks = toBlock - fromBlock;
        while(currentBlock <= toBlock) {
          const percentage = Math.floor(( currentBlock - fromBlock ) / numBlocks * 100, 2);
          process.stdout.write(`\rSearching for transactions in block #${currentBlock} - ${percentage}%`);
          await queryBlock(currentBlock);
          currentBlock++;
        }

        console.log(`Finished block sweep.`);
      });
  }
};
