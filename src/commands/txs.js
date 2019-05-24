const fs = require('fs');
const getWeb3 = require('../utils/getWeb3.js');
const validateUtil = require('../utils/validateUtil');
const chalk = require('chalk');

const signature = 'txs <networkUrl> <contractAddress> <functionSelector> <fromBlock> [toBlock] [maxThreads]';
const description = 'Finds transactions.';
const help = chalk`
Finds transactions made to a deployed contract, for a specified function selector, in a specified block range, with a maxThreads number of simultaneous queries.

{red Eg:}

{blue > pocketh txs mainnet 0x06012c8cf97bead5deae237070f9587f8e7a266d 0xa9059cbb 7729780 7729790}
Scanning 11 blocks...
👉 match: 0xa911d8af867ec881e007053aac62e9488f07c0d09ec04deb09e3b780494fed83
👉 match: 0x8864fd2b8a70b3a7e93342813c125f269fbb5dba79177ea48b3e0d55aba3dff0
18% #7729781, 2 scanned, 9 remaining, 0.82 b/s per thread, 1.25 s, 10 threads
👉 match: 0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b
...
Matches:
0xa911d8af867ec881e007053aac62e9488f07c0d09ec04deb09e3b780494fed83
0x8864fd2b8a70b3a7e93342813c125f269fbb5dba79177ea48b3e0d55aba3dff0
0x95ecb5317de43d2c682e93350f160c10d3a816002ad43f2b67fb631062c1484b
0x03d488a5ef270b083ac4f6d29f2fabf5a7962281af56d8a4212d3cc3608751c5
0x827aaa59821ec53a031d08c04348ffdff3829f75eae11524737394b9dffb846d
0x43b72ba5dd5e286f9d9785d6a10f08d3c44ad6d546db323b995a1c5608d3bfdb
0xd9758451aeb0af23c9d7a91bc974ee3df3db9a20570832928caf45ac76593acf
0x842b49c9fe094bc9c6396cae6259018d39ee469339e83dd0f72d13a80084b001
0xa90670d617bdf688d047ba5791cd23dc920bb583a755abdd9c0abc8408530ccf
0x8355606297996feb2c7e6fe7eeb66c12680ace629dcd2585bb77db7f5f962dca
0xd69eba2de092af2a2d566797293557c755441d39f8108f4a7ffaacedb1252649
0x4702aa728e2d3e9278c5801319aec432ad26c2d6769e5c99e278e950bfaeba06
0xcdd8d0f2e63363bd053a445d614382335bbc377db0f3b71cc5c0625d562f3130
0x0f9a4af0f5c4c5e43f5f87571162570e74d8eee87b96d3245e430ed0e7ef8075
0x384d49c27ec72ddc560e91fa11a439cb78725f051cfd3ff0ccf30e7ee7ed0790
0x4488ee46a1a71ef865a314112c6fd981a94af932934e97e715f107006544072f
0xdcf7d7680bd646c595e6b58c6617bf7bcfa534dc95ae9c629e46233395cdd9c6
0x985e65d3ecad3a68f785203c0c75c3dc86dc563603c47c5b3546b030fdb20c22
0xb5d9a837eef195abfba76c231b8a96f59cb12e10d030df2d72b9888cfaff634d
0xf4d0939a408eb703898cb08f469abdd8b337fed64de8140ddbf83d26cfd89969
0xb83e36fea78edb4139d830a86bb3a609ee73f091408ddb80f36842990320c5db
0x8eda05c6126da690077d53b9f9ced3285a5aac9d3eb53d6f81c03ef068a99a71
0x739f85f4b216de1dcda15933dcacbe8d54d2e1c55bde4e582b0fa30721390e6d
0x127adada51b1f9097610069ff724f1bc762955214126d18244e2b36ee8655a78
0xcf5a4a40366f851b5b8bb08a6fbf75ed1a227a6c77633759ab72fa722f45a6fb
0x1ab519cb7700340078bfca8310ec62076d077ec0a92caf5ed79c6f48ebe3b1ea
0x950db37d96bf0faea56f67c07a886840a619c25dc906e8226c39956a697df470

Found 27 transactions in block range [7729780-7729790] that target the address 0x06012c8cf97bead5deae237070f9587f8e7a266d and the selector 0xa9059cbb (listed above) in 1.78 seconds.
`;

module.exports = {
  signature,
  description,
  register: (program) => {
    program
      .command(signature, {noHelp: true})
      .description(description)
      .on('--help', () => console.log(help))
      .action(async (networkUrl, contractAddress, functionSelector, fromBlock, toBlock, maxThreads) => {
        
        // Input validation.
        if(!validateUtil.address(contractAddress))
          throw new Error(`Invalid contractAddress: ${contractAddress}`);
        if(!validateUtil.hex(functionSelector))
          throw new Error(`Invalid functionSelector: ${functionSelector}`);

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
