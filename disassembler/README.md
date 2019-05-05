# disassembler

Simple util to disassemble compiled bytecode to EVM opcodes.

## Usage
```
npm run disassemble <contractPath>
```

## Parameters:
- contractPath: The compiled json artifacts of a contract.

## Example:
```
npm run disassemble ~/cryptokitties/build/contracts/KittyCore.json
```

## Sample output:
```
0 {0x60} [c0] PUSH1 0x80 (dec 128)
1 {0x60} [c2] PUSH1 0x40 (dec 64)
2 {0x52} [c4] MSTORE
3 {0x34} [c5] CALLVALUE
4 {0x80} [c6] DUP1
5 {0x15} [c7] ISZERO
6 {0x61} [c8] PUSH2 0x0010 (dec 16)
7 {0x57} [c11] JUMPI
8 {0x60} [c12] PUSH1 0x00 (dec 0)
9 {0x80} [c14] DUP1
10 {0xfd} [c15] REVERT
11 {0x5b} [c16] JUMPDEST
12 {0x50} [c17] POP
13 {0x61} [c18] PUSH2 0x2710 (dec 10000)
14 {0x60} [c21] PUSH1 0x00 (dec 0)
15 {0x80} [c23] DUP1
16 {0x32} [c24] ORIGIN
...
```
