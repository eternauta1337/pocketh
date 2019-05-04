const program = require('commander');
const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

program
  .version('0.1.0')
  .command('query <networkName> <contractPath> <contractAddress> <eventName> [batchSize]')
  .action(async (networkName, contractPath, contractAddress, eventName, batchSize) => {

    // Validate input.
    batchSize = batchSize ? parseInt(batchSize, 10) : 1000;
    // TODO

    // Display info.
    console.log(`Querying events:`);
    console.log(`  networkName:`, networkName);
    console.log(`  contractPath:`, contractPath);
    console.log(`  contractAddress:`, contractAddress);
    console.log(`  eventName:`, eventName);
    console.log(`  batchSize:`, batchSize);

    // Connect to network.
    const infuraKey = `ac987ae2aa3c436c958e050a82a5c8da`;
    const provider = `https://${networkName}.infura.io/v3/${infuraKey}`;
    const web3 = new Web3(provider);

    // Retrieve block data.
    const latestBlock = await web3.eth.getBlockNumber();
    console.log(`  latest block:`, latestBlock);

    // Retrieve contract artifacts.
    const contractsFolderPath = path.dirname(contractPath);
    const artifactsFolderPath = path.resolve(contractsFolderPath, '..') + '/build/contracts/';
    const contractFileName = path.basename(contractPath);
    const contractName = path.parse(contractFileName).name;
    const contractArtifactsPath = artifactsFolderPath + contractName + '.json';
    if(!fs.existsSync(contractArtifactsPath)) throw new Error(`Cannot find ${contractsFolderPath}.`);
    const contractArtifacts = JSON.parse(fs.readFileSync(contractArtifactsPath, 'utf8'));

    // Retrieve contract instance.
    const instance = await web3.eth.Contract(contractArtifacts.abi, contractAddress);
    
    // Find events in a given block range.
    const foundEvents = [];
    async function logEventsInBatch(fromBlock, toBlock) {
      console.log(`Querying for event "${eventName}" in block range: [${fromBlock}, ${toBlock}]`);
      await instance.getPastEvents(
        eventName,
        {fromBlock, toBlock},
        (err, events) => {
          if(err) console.log(err);
          else if(events && events.length > 0) {
            foundEvents.push(...events);
            console.log(events);
          }
        }
      );
    }
    
    // Find events by batches.
    let currentBlock = latestBlock;
    async function logNextBatch() {
      if(currentBlock === 0) {
        console.log(`Query finished! Total found ${foundEvents.length}:`);
        console.log(foundEvents);
        return;
      }
      const fromBlock = Math.max(currentBlock - batchSize, 0);
      const events = await logEventsInBatch(fromBlock, currentBlock);
      currentBlock = fromBlock;
      await logNextBatch();
    }
    await logNextBatch();
  });

program.parse(process.argv);
