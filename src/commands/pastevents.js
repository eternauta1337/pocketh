const program = require('commander');
const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const getArtifacts = require('../utils/getArtifacts');

module.exports = {
  register: (program) => {
    program
      .command('pastevents <networkName> <contractPath> <contractAddress> <eventName> <fromBlock> [toBlock] [batchSize]')
      .description('Finds past events for a given deployed contract.')
      .action(async (networkName, contractPath, contractAddress, eventName, fromBlock, toBlock, batchSize) => {

        // Validate input.
        batchSize = batchSize ? parseInt(batchSize, 10) : 100;
        fromBlock = parseInt(fromBlock, 10);
        toBlock = toBlock ? toBlock : 'latest';

        // Connect to network.
        const web3 = await getWeb3(networkName);

        // Retrieve contract artifacts.
        const contractArtifacts = getArtifacts(contractPath);

        // Retrieve contract instance.
        const instance = await web3.eth.Contract(contractArtifacts.abi, contractAddress);
        
        // Find events in a given block range.
        let count = 0;
        async function logEventsInBatch(from, to) {
          await instance.getPastEvents(
            eventName,
            {fromBlock: from, toBlock: to},
            (err, events) => {
              if(err) console.log(err);
              else if(events && events.length > 0) {
                events.map((event) => {
                  console.log(`\n`, event);
                });
                count += events.length;
              }
            }
          );
        }
        
        // Find events by batches.
        if(toBlock === 'latest') toBlock = await web3.eth.getBlockNumber();
        let currentBlock = fromBlock;
        const numBlocks = toBlock - fromBlock;
        async function logNextBatch() {
          if(currentBlock === toBlock) {
            console.log(`Query finished!`);
            console.log(`Total found: ${count}`);
            return;
          }
          const to = Math.min(currentBlock + batchSize, toBlock);
          const percentage = Math.floor(( currentBlock - fromBlock ) / numBlocks * 100, 2);
          process.stdout.write(`\rQuerying for event "${eventName}" in block range: [${currentBlock}, ${to}] - ${percentage}%`);
          await logEventsInBatch(currentBlock, to);
          currentBlock = to;
          await logNextBatch();
        }
        await logNextBatch();
      });
  }
};
