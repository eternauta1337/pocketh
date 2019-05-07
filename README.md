# audit-tools
A curated list of tools for analysing smart contracts. The list not only contains external well known tools, but also contains experiments, ideas, and scripts that are useful for a very specific thing. Such experiments could eventually become separate projects.

## Scanners

These tools query the blockchain for information.

**[event_query](https://github.com/ajsantander/audit-tools/tree/master/event_query)**:
Simple tool that queries events of a given contract, in a given network.

**[query_tx](https://github.com/ajsantander/audit-tools/tree/master/query_tx)**:
(WIP) Simple script for querying transactions made to a contract.

**[account_scanner](https://github.com/ajsantander/audit-tools/tree/master/account_scanner)**:
(WIP) As query_tx but a bit more advanced, querying multiple blocks in parallel. Based on Ross Perkins' gist: https://gist.github.com/ross-p/bd5d4258ac23319f363dc75c2b722dd9

## ABI

**[selector_list](https://github.com/ajsantander/audit-tools/tree/master/selector_list)**:
Simple tool that prints function selectors.

**[calldata_reader](https://github.com/ajsantander/audit-tools/tree/master/calldata_reader)**:
Simple tool that parses calldata.

## Disassemblers

**[disassembler](https://github.com/ajsantander/audit-tools/tree/master/disassembler)**:
Simple tool to disassemble bytecode to EVM opcodes.

**[solmap](https://github.com/ajsantander/solmap)**:
Browser app for side by side bytecode to EVM opcode conversion which uses source maps to highlight selections both ways.

## Compiler tools

**[solz](https://github.com/ajsantander/solz)**:
Simple compiler that uses solcjs or solc to watch and compile Solidity files.
