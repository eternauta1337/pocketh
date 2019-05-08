const program = require('commander');
const fs = require('fs');

const get_web3 = require('../../common/get_web3.js');

program
  .version('0.1.0')
  .command('run <networkName> <blockNumber>')
  .action(async (networkName, blockNumber) => {

    // Validate input.
    blockNumber = parseInt(blockNumber , 10);
    // TODO

    // Display info.
    console.log(`Get block date:`);
    console.log(`  networkName:`, networkName);
    console.log(`  blockNumber:`, blockNumber);

    // Connect to network.
    const web3 = await get_web3(networkName);

    // Get block info.
    const block = await web3.eth.getBlock(blockNumber);
    const date = new Date(parseInt(block.timestamp, 10) * 1000);
    console.log(`Date for block #${blockNumber} => ${date}`);
  });

if(!process.argv.slice(3).length) program.help();
else program.parse(process.argv);
