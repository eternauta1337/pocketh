# pocketh :rocket:
A pocket knife for developing and auditing smart contracts. Provides a series of cli commands that allow you to quickly get information about a contract, and contract related operations, such as:
- List all function selectors of a contract.
- Print out the inheritance tree of a contract.
- Search for past events of a deployed contract.
- Search for transactions made to a deployed contract hitting a particular function.
- Disassemble a contract's bytecode.
- etc...

Some commands interact with a network only by reading information from it but never by 
sending transactions to it. Other commands don't even read stuff from a network and simply analyze 
compiler output.

### Sample output:

<details><summary>Show output for `pocketh inheritance`</summary>
<p>

*Syntax*
`pocketh inheritance ~/cryptokitties/build/contracts/KittyCore.json` :point_right: :sparkles:
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
</p>
</details>

<details><summary>Show output for `pocketh selectors`</summary>
<p>

*Syntax*
`pocketh selectors ~/cryptokitties/build/contracts/KittyCore.json` :point_right: :sparkles:
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
</p>
</details>

<details><summary>Show output for `pocketh members`</summary>
<p>

*Syntax*
`pocketh members --inherited ~/cryptokitties/build/contracts/KittyCore.json` :point_right: :sparkles:
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
</p>
</details>

<details><summary>Show output for `pocketh disassemble`</summary>
<p>

*Syntax*
`pocketh disassemble ~/cryptokitties/build/contracts/KittyCore.json` :point_right: :sparkles:
```
0 {0x60} [c0] PUSH1 0x80 (dec 128)
1 {0x60} [c2] PUSH1 0x40 (dec 64)
2 {0x52} [c4] MSTORE
3 {0x60} [c5] PUSH1 0x00 (dec 0)
4 {0x60} [c7] PUSH1 0x02 (dec 2)
5 {0x60} [c9] PUSH1 0x14 (dec 20)
6 {0x61} [c11] PUSH2 0x0100 (dec 256)
7 {0x0a} [c14] EXP
8 {0x81} [c15] DUP2
9 {0x54} [c16] SLOAD
...
```
</p>
</details>

<details><summary>Show output for `pocketh compile`</summary>
<p>

*Syntax*
`pocketh compile ~/test/contracts/Kitties.sol ~/tmp/build/ 0.4.25` :point_right: :sparkles:
```
Downloading compiler soljson-v0.4.25+commit.59dbf8f1.js...
Compiler stored in /home/user/.soljson/soljson-v0.4.25+commit.59dbf8f1.js
Using compiler 0.4.25+commit.59dbf8f1.Emscripten.clang
...
Compiled Kitties.sol succesfully to tmp/build/
...
```
</p>
</details>

### Installation:
```
npm install --global pocketh
```

### Usage:
```
pocketh <command> [options]
```

_Note: Commands that take "networkUrl" as a parameter expect an url such as http://localhost:8545 or a common network name such as mainnet, ropsten or rinkeby._

### Documentation:
Please refer to the inline documentation of the program for a list of available commands,

```
pocketh --help
```
or, for command specific documentation.
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
  blockdate <networkUrl> <blockNumber>                                                                    Get the date of a block number in the given network.
  txs <networkUrl> <contractAddress> <functionSelector> <fromBlock> [toBlock]                             Finds transactions made to a deployed contract, for a specified funciton selector.
  txsfast <networkUrl> <contractAddress> <functionSelector> <fromBlock> [toBlock] [maxThreads]            Finds transactions made to a deployed contract, for a specified funciton selector, using multiple simultaneous threads.
  pastevents <networkUrl> <contractPath> <contractAddress> <eventName> <fromBlock> [toBlock] [batchSize]  Finds past events for a given deployed contract.
  disassemble <contractPath>                                                                               Disassembles compiled bytecode into readable EVM opcodes.
  ...
```

### Contributing:
If you can think of something useful that could be added to the tool, pls don’t hesitate to create a new issue in the repo with your feature request. Keep in mind that the tool is intended to only read the blockchain for simplicity, i.e. it is not intended to send txs.

Even better, if you want to throw a PR, you’re more than welcome! 

## Architecture
Architecture-wise, each command/script should be self contained, so there is no complex architecture going on. It’s basically a collection of scripts.
