const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');

module.exports = {
  register: (program) => {
    program
      .command(`txs <networkUrl> <contractAddress> <functionSelector> <fromBlock> [toBlock] [maxThreads]`)
      .description('Finds transactions made to a deployed contract, for a specified function selector.')
      .action(async (networkUrl, contractAddress, functionSelector, fromBlock, toBlock, maxThreads) => {
        
        // Validate input.
        contractAddress = contractAddress.toLowerCase();
        fromBlock = parseInt(fromBlock, 10);
        toBlock = toBlock ? toBlock : 'latest';
        maxThreads = maxThreads ? parseInt(maxThreads, 10) : 20;

        // Connect to network.
        const web3 = await getWeb3(networkUrl);

        // Init state.
        if(toBlock === 'latest') toBlock = await web3.eth.getBlockNumber();
        let triesLeft = 10;
        const scannedBlocks = [];
        const blocksBeingScanned = [];
        const matchingTxs = [];
        const absStartTime = (new Date()).getTime() / 1000;
        const numBlocks = toBlock - fromBlock + 1;
        let blocksPerSecond = 0;
        const lastBlocksPerSecondReadings = [];
        process.stdout.write(`Scanning ${numBlocks} blocks...\n`);

        // Get a block and examine it's txs for a match with
        // the target contract and the target selector.
        // When done, either by an error or completion, evaluate
        // program completion or scanning the next block.
        function scanBlockAndContinue(blockNumber, threadNum) {

          // Record time.
          const startTime = new Date();

          // Register block as being scanned.
          blocksBeingScanned.push(blockNumber);

          // Get block (including its transactions).
          web3.eth.getBlock(
            blockNumber, 
            true, 
            (err, block) => {

              // Process errors with a max number of tries.
              if(err) {
                
                // De-register block as being scanned.
                blocksBeingScanned.splice(blocksBeingScanned.indexOf(blockNumber), 1);

                // Report error.
                process.stderr.write(`\nError: ${err}`);

                // Retry or end.
                triesLeft--;
                if(triesLeft < 0) evalScanNextBlock();
                else {
                  process.stderr.write(`\nToo many errors, exiting...`);
                  endScan();
                }
              }
              else {
                
                // Check block transactions.
                block.transactions.map((tx) => {

                  // Match contract address?
                  const txToContractAddress = tx.to && tx.to.toLowerCase() === contractAddress;
                  if(txToContractAddress) {

                    // Match contract function?
                    const txToTargetFunction = tx.input.substring(0, 10) === functionSelector;
                    if(txToTargetFunction) {

                      // Report match immediately.
                      console.log(`\n👉 match: ${tx.hash}`);

                      // Register match.
                      matchingTxs.push(tx.hash);
                    }
                  }
                });

                // Register block as scanned.
                scannedBlocks.push(blockNumber);

                // Calculate speed.
                const now = (new Date()).getTime() / 1000;
                const elapsedTime = now - startTime.getTime() / 1000;
                const blocksPerSecond = 1 / elapsedTime;
                if(lastBlocksPerSecondReadings.length >= 10) {
                  lastBlocksPerSecondReadings.splice(0, 1);
                }
                lastBlocksPerSecondReadings.push(blocksPerSecond);
                const avgBlocksPerSecond = lastBlocksPerSecondReadings.reduce(
                  (sum, value) => sum + value
                ) / lastBlocksPerSecondReadings.length;
                
                // Monitor progress.
                const elapsedTotalTime = now - absStartTime;
                const blocksRemaining = numBlocks - scannedBlocks.length;
                const percentage = Math.floor(100 * scannedBlocks.length / numBlocks, 2);
                process.stdout.write(`\r${percentage}% #${blockNumber}, ${scannedBlocks.length} scanned, ${blocksRemaining} remaining, ${avgBlocksPerSecond.toFixed(2)} b/s per thread, ${elapsedTotalTime.toFixed(2)} s, ${blocksBeingScanned.length} threads`);
                
                // De-register block as being scanned.
                blocksBeingScanned.splice(blocksBeingScanned.indexOf(blockNumber), 1);
                
                // Continue or end scan.
                evalEndScan();
                evalScanNextBlock();
              }
            }
          );
        }

        // Pick a block to scan if a thread is free.
        function evalScanNextBlock() {

          // Cap threads.
          if(blocksBeingScanned.length >= maxThreads) return;

          // Scan next block.
          const blockNumberToScan = findUnscannedBlock();
          if(blockNumberToScan >= 0) scanBlockAndContinue(blockNumberToScan);
        }

        // Evaluate if the scan is done.
        function evalEndScan(blockNumber) {
          const blocksRemaining = numBlocks - scannedBlocks.length;
          if(blocksRemaining === 0) endScan();
        }

        // End scan and exit program.
        function endScan() {
          const elapsedTime = (new Date()).getTime() / 1000 - absStartTime;
          console.log(`\n\nMatches:`);
          matchingTxs.map(tx => console.log(`${tx}`));
          process.stdout.write(`\nFound ${matchingTxs.length} transactions in block range [${fromBlock}-${toBlock}] that target the address ${contractAddress} and the selector ${functionSelector} (listed above) in ${elapsedTime.toFixed(2)} seconds.`);
          process.exit();
        }

        // Find a block that hasn't been scanned or isn't being scanned.
        function findUnscannedBlock() {
          for(let b = fromBlock; b <= toBlock; b++) {
            if(!scannedBlocks.includes(b) && !blocksBeingScanned.includes(b)) return b;
          }
          return -1;
        }

        // Start the first scanning batch.
        for(let i = 0; i <= maxThreads; i++) {
          evalScanNextBlock();
        }
      });
  }
};
