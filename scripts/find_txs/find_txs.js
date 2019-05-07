const program = require('commander');
const fs = require('fs');

const get_web3 = require('../../common/get_web3.js');

program
  .version('0.1.0')
  .command('run <networkName> <contractAddress> <functionSelector> <fromBlock> [toBlock]')
  .action(async (networkName, contractAddress, functionSelector, fromBlock, toBlock) => {

    // Validate input.
    contractAddress = contractAddress.toLowerCase();
    fromBlock = parseInt(fromBlock, 10);
    toBlock = toBlock ? toBlock : 'latest';
    // TODO

    // Display info.
    console.log(`Querying events:`);
    console.log(`  networkName:`, networkName);
    console.log(`  contractAddress:`, contractAddress);
    console.log(`  functionSelector:`, functionSelector);
    console.log(`  fromBlock:`, fromBlock);
    console.log(`  toBlock:`, toBlock);

    // Connect to network.
    const web3 = await get_web3(networkName);

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

if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
