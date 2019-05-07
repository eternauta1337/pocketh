# event_query.js

Simple tool that queries events of a given contract, in a given network.

## Usage:
```
npm run query <networkName> <contractPath> <contractAddress> <eventName> [batchSize]
```

## Arguments:
- `networkName`: E.g. "mainnet", "ropsten", etc.
- `contractPath`: Full path to the `.json` compiled contract artifacts of the contract that triggers the target event.
- `contractAddress`: Deployed contract address for the selected network.
- `eventName`: Target event name, e.g. "Transfer".
- `batchSize`: Events are queried in batches of N blocks. Higher batch sizes will make the script less responsive and will fail if more than 1000 events are found in such range. Higher batch sizes are recommended for rarer events, and lower for more common events. Default: `100`;

NOTE: The query will start at the latest block and stop at the genesis block.

## Sample usage:
```
npm run query mainnet ~/cryptokitties/build/contracts/KittyCore.json 0x06012c8cf97bead5deae237070f9587f8e7a266d Transfer 100
```

## Improvements
- Could use workers to search faster.
- Would be nice to be able to specify startBlock, endBlock.
- Would be nice to be able to stop the search interactively to display the results found so far.
- Options for parsing events.
- Would be nice to be able to enter info in interactive mode.
- Option to output to a file.
