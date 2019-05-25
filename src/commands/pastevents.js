const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const getArtifacts = require('../utils/getArtifacts');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'pastevents <networkUrl> <contractPath> <contractAddress> <eventName> <fromBlock> [toBlock] [batchSize]';
const description = 'Finds past events of a contract.';
const help = chalk`
Finds past events for a given deployed contract. Requires a network to be specified, a contractPath (compiled or not), a deployed contractAddress, the eventName to query, a block range, and a batchSize that determines how many blocks are queried at a time.

{red Eg:}

{blue > pocketh pastevents mainnet test/artifacts/KittyCore.json 0x06012c8cf97bead5deae237070f9587f8e7a266d Transfer 7729780 7729781}
Querying for event "Transfer" in block range: [7729780, 7729781] - 0%
\{
  "address": "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d",
  "blockHash": "0x413bbd2803a7848ecbb74cf3f3b70406713474f75ed9bbeb6c8c71fa9a82d4cb",
  "blockNumber": 7729780,
  "logIndex": 55,
  "removed": false,
  "transactionHash": "0xf08da17d43d543318b9012c596ca5b1a6e415114cf8a4905ff90b001dc65ece5",
  "transactionIndex": 59,
  "id": "log_0xc66d511401664f74e887ba799f15f2d161e18a129353fa47d0b9ad16d9cd58ca",
  "returnValues": \{
      "0": "0x0000000000000000000000000000000000000000",
    "1": "0x8820A512CE3B3b51c0340A81930941d3339D3EDA",
    "2": \{
          "_hex": "0x17f279"
    \},
        "from": "0x0000000000000000000000000000000000000000",
    "to": "0x8820A512CE3B3b51c0340A81930941d3339D3EDA",
    "tokenId": \{
          "_hex": "0x17f279"
    \}
      \},
        "event": "Transfer",
  "signature": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
  "raw": \{
      "data": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000008820a512ce3b3b51c0340a81930941d3339d3eda000000000000000000000000000000000000000000000000000000000017f279",
    "topics": [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    ]
      \}
    \}
...
Total "Transfer" events found: 6
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (networkUrl, contractPath, contractAddress, eventName, fromBlock, toBlock, batchSize) => {

        // Input validation.
        if(!validateUtil.address(contractAddress))
          throw new Error(`Invalid contract address: ${contractAddress}`);

        // Validate input.
        batchSize = batchSize ? parseInt(batchSize, 10) : 100;
        fromBlock = parseInt(fromBlock, 10);
        toBlock = toBlock ? toBlock : 'latest';

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Retrieve contract artifacts.
        const { artifacts }= await getArtifacts(contractPath);

        // Retrieve contract instance.
        const instance = await web3.eth.Contract(artifacts.abi, contractAddress);
        
        // Find events in a given block range.
        let count = 0;
        async function logEventsInBatch(from, to) {
          await instance.getPastEvents(
            eventName,
            {fromBlock: from, toBlock: to},
            (err, events) => {
              if(err) process.stdout.write(err);
              else if(events && events.length > 0) {
                events.map((event) => {
                  process.stdout.write(`\n${JSON.stringify(event, null, 2)}`);
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
          if(currentBlock >= toBlock) {
            process.stdout.write(`\nTotal "${eventName}" events found: ${count}\n`);
            process.exit();
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
