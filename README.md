# pocketh :rocket:
A pocket knife for auditing smart contracts. Provides a series of cli commands that allow you to quickly get information about a contract, and contract related operations, such as:
- List all function selectors of a contract.
- Print out the inheritance tree of a contract.
- Search for past events of a deployed contract.
- Search for transactions made to a deployed contract hitting a particular function.
- Disassemble a contract's bytecode.
- etc...

## Sample output:

`pocketh inheritance ~/cryptokitties/build/contracts/KittyCore.json` :point_right:

```
└─ KittyCore
   └─ KittyMinting
      └─ KittyAuction
         └─ KittyBreeding
            └─ KittyOwnership
               ├─ KittyBase
               │  └─ KittyAccessControl
               └─ ERC721
```

`pocketh selectors ~/cryptokitties/build/contracts/KittyCore.json` :point_right:

```
HASH:      SIGNATURE:
0x01ffc9a7 supportsInterface(bytes4)
0x0519ce79 cfoAddress()
0x0560ff44 tokenMetadata(uint256,string)
0x05e45546 promoCreatedCount()
0x06fdde03 name()
0x095ea7b3 approve(address,uint256)
0x0a0f8168 ceoAddress()
0x0e583df0 GEN0_STARTING_PRICE()
0x14001f4c setSiringAuctionAddress(address)
0x18160ddd totalSupply()
...
```

`pocketh members --inherited ~/cryptokitties/build/contracts/KittyCore.json` :point_right:
```
================> KittyCore members:
address public newContractAddress;
function KittyCore() public {...}
function setNewAddress(address _v2Address) external {...}
function () external payable {...}
function getKitty(uint256 _id) external view returns(bool isGestating, bool isReady, uint256 cooldownIndex, uint256 nextActionAt, uint256 siringWithId, uint256 birthTime, uint256 matronId, uint256 sireId, uint256 generation, uint256 genes) {...}
function unpause() public {...}
function withdrawBalance() external {...}
================> KittyMinting members:
uint256 public PROMO_CREATION_LIMIT;
uint256 public GEN0_CREATION_LIMIT;
uint256 public GEN0_STARTING_PRICE;
...
```

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

## Network configuration:
Commands access networks by name. To define a name, edit `./truffle-config.js`.
