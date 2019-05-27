```
_______________________________________________________________________________________/\\\_________        
 ____________________________________________/\\\______________________________________\/\\\_________       
  ___/\\\\\\\\\______________________________\/\\\____________________________/\\\______\/\\\_________      
   __/\\\/////\\\_____/\\\\\________/\\\\\\\\_\/\\\\\\\\________/\\\\\\\\___/\\\\\\\\\\\_\/\\\_________     
    _\/\\\\\\\\\\____/\\\///\\\____/\\\//////__\/\\\////\\\____/\\\/////\\\_\////\\\////__\/\\\\\\\\\\__    
     _\/\\\//////____/\\\__\//\\\__/\\\_________\/\\\\\\\\/____/\\\\\\\\\\\_____\/\\\______\/\\\/////\\\_   
      _\/\\\_________\//\\\__/\\\__\//\\\________\/\\\///\\\___\//\\///////______\/\\\_/\\__\/\\\___\/\\\_  
       _\/\\\__________\///\\\\\/____\///\\\\\\\\_\/\\\_\///\\\__\//\\\\\\\\\\____\//\\\\\___\/\\\___\/\\\_ 
        _\///_____________\/////________\////////__\///____\///____\//////////______\/////____\///____\///__
```

A pocket knife for developing and auditing smart contracts. Provides a series of cli commands that allow you to quickly operate on a contract, such as:

```
- getcode <deployedAddress> [targetFilePath] - Retrieves a contract's code from Etherscan.
- split <sourcePath> <outputDirectory> - Splits Solidity files.
- inheritance <contractPath> - Displays the inheritance tree of a contract.
- members <contractPath> - Lists all members of a contract.
- selectors <contractPath> - Lists all selectors of a contract.
- calldata <data> - Splits up calldata into a more readable format.
- blockdate <networkUrl> <blockHashOrNumber> - Gets the date of a block.
- txs <networkUrl> <contractAddress> <functionSelector> <fromBlock> [toBlock] [maxThreads] - Finds transactions.
- pastevents <networkUrl> <contractPath> <contractAddress> <eventName> <fromBlock> [toBlock] [batchSize] - Finds past events of a contract.
- disassemble <contractPath> - Disassembles bytecode to EVM opcodes.
- hex2str <hexString> - Converts hex to string.
- str2hex <asciiString> - Converts string to hex.
- transaction <networkUrl> <txHash> - Gets info about a transaction.
- block <networkUrl> [blockHashOrNumber] - Gets info about a block.
- info <networkUrlOrName> - Retrieves info about a network.
- hex2uint <hexString> - Converts hex to uint.
- uint2hex <decNumber> - Converts uint to hex.
- convert [value] [sourceDenom] [destDenom] - Converts between ether denominations.
- pad <value> [direction] [amount] [char] - Pads hex numbers.
- compile <sourcePath> <outputDirectory> [solcVersion] - Compiles single Solidity files.
- storage <networkUrl> <contractAddress> <storageSlot> - Reads the storage of a contract.
- liststorage <networkUrl> <contractPath> <contractAddress> - Reads the storage of a contract.
- checksum <address> - Checksums an address.
- selector <signature> - Calculates a selector.
- docyul [keyword] - Gets yul documentation.
- int2hex <decNumber> - Converts int to hex.
- hex2int <hexString> - Converts hex to int.
```

#### One script to rule them all!
Pocketh is basically a curated list of useful scripts, packed up in a commanderjs program.

#### On the fly compilation :rocket:
Pocketh uses AST information for analysing contracts, but it doesn't require you to do any compilation at all. Whenever pocketh sees a Solidity file, it will compile it in background. Pocketh's compiler is super handy btw; it can compile anything, on the spot.

### Installation:
```
npm install --global pocketh
```

### Usage:
```
pocketh <command> [options]
```

### Documentation:
Please refer to the inline documentation of the program for a list of available commands,

```
pocketh --help
```
or, for command specific documentation.
```
pocketh <command> --help
```

### Contributing:
If you can think of something useful that could be added to the tool, please don't hesitate to create a new issue with your feature request. Keep in mind that the tool is intended to only read the blockchain, i.e. it is not intended to send txs.

#### Running tests
Make sure that you run `npm run ganache` before starting tests. Then run `npm test`.

_Note: Unfortunately, pocketh currently requires an active internet connection for some of its tests, since some commands interact with public networks like mainnet and ropsten, and use public apis like Etherscan's api._ 
