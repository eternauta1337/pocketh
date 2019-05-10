# pocketh :rocket:
A pocket knife for auditing smart contracts.

## Installation:
```
npm install --global pocketh
```

## Usage:
```
pocketh <command> [options]
```

## Documentation:
Please refer to the inline documentation of the program for a list of available commands.

```
pocketh --help
```
or
```
pocketh <command> --help
```

Some of the available commands are:
```
Commands:
  inheritance <contractPath>                                                                               Displays the inheritance tree of the provided contract artifacts.
  members [options] <contractPath>                                                                         Provides a list of all the members of the provided contract artifacts.
  selectors <contractPath>                                                                                 List all the function selectors of the provided contract artifacts.
  calldata <data>                                                                                          Split up calldata into a more readable format.
  blockdate <networkName> <blockNumber>                                                                    Get the date of a block number in the given network.
  txs <networkName> <contractAddress> <functionSelector> <fromBlock> [toBlock]                             Finds transactions made to a deployed contract, for a specified funciton selector.
  txsfast <networkName> <contractAddress> <functionSelector> <fromBlock> [toBlock] [maxThreads]            Finds transactions made to a deployed contract, for a specified funciton selector, using multiple simultaneous threads.
  pastevents <networkName> <contractPath> <contractAddress> <eventName> <fromBlock> [toBlock] [batchSize]  Finds past events for a given deployed contract.
  disassemble <contractPath>                                                                               Disassembles compiled bytecode into readable EVM opcodes.
```

## Network cofiguration:
Commands access networks by name. To define a name, edit `./truffle-config.js`.
