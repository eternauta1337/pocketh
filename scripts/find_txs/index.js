const program = require('commander');
const fs = require('fs');

const get_web3 = require('../common/get_web3.js');

program
  .version('0.1.0')
  .command('run <networkName> <contractAddress> <functionSelector>')
  .action(async (networkName, contractAddress, functionSelector) => {

    // Validate input.
    contractAddress = contractAddress.toLowerCase();
    // TODO

    // Display info.
    console.log(`Querying events:`);
    console.log(`  networkName:`, networkName);
    console.log(`  contractAddress:`, contractAddress);
    console.log(`  functionSelector:`, functionSelector);

    // Connect to network.
    const web3 = await get_web3(networkName);

    // Query a transaction.
    async function queryTransaction(txHash) {
      const tx = await web3.eth.getTransaction(txHash);
      // console.log(`tx.to:`, tx.to);
      if(tx.to && tx.to.toLowerCase() === contractAddress) {
        // console.log(`'to' match:`, tx.hash);
        if(tx.input.substring(0, 10) === functionSelector) {
          console.log(`selector match:`, tx);
        }
      }
    }

    // Query a block.
    async function queryBlock(blockNumber) {
      // console.log(`Searching for transactions in block #${blockNumber}...`);
      process.stdout.write(`${blockNumber}.`);
      const block = await web3.eth.getBlock(blockNumber);
      block.transactions.map(async (txHash) => {
        await queryTransaction(txHash);
      });
    }

    // Look for transactions in one block.
    // await queryBlock(7708749);
    // return;

    // Sweep blocks backward.
    let currentBlock = await web3.eth.getBlockNumber();
    while(currentBlock >= 0) {
      await queryBlock(currentBlock);
      currentBlock--;
    }

    console.log(`Finished block sweep.`);
  });

if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
