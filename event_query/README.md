# event_query.js

Simple tool that queries events of a given contract, in a given network.

Usage:
```
npm run query <networkName> <contractPath> <contractAddress> <eventName> [batchSize]
```

Arguments:
- `networkName`: E.g. "mainnet", "ropsten", etc.
- `contractPath`: Full path to the `.json` compiled contract artifacts of the contract that triggers the target event.
- `contractAddress`: Deployed contract address for the selected network.
- `eventName`: Target event name, e.g. "Transfer".
- `batchSize`: Events are queried in batches of N blocks. Higher batch sizes will make the script less responsive. Default: `1000`;

Sample usage:
```
npm run query mainnet ~/cryptokitties/build/contracts/KittyCore.json 0x06012c8cf97bead5deae237070f9587f8e7a266d Transfer 10000
```
