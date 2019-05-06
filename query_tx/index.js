const program = require('commander');
const Web3 = require('web3');
const fs = require('fs');
require('dotenv').config();

program
  .version('0.1.0')
  .command('query <networkName> <contractAddress> <functionSelector>')
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

    const hostKey = `${networkName.toUpperCase()}_ETHEREUM_HOST_URL`;
    const portKey = `${networkName.toUpperCase()}_ETHEREUM_HOST_PORT`;

    if (!(hostKey in process.env) || !(portKey in process.env)) {
      throw new Error(`Unknown network: '${networkName}'`);
    }

    let provider;
    if (networkName.toUpperCase().indexOf('INFURA') !== -1) {
      provider = `https://${process.env[hostKey]}`;
    } else {
      provider = `http://${process.env[hostKey]}:${process.env[portKey]}`;
    }

    console.log(`Provider: ${provider}`);
    const web3 = new Web3(provider);

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

program.parse(process.argv);
