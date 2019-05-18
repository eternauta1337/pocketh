const fs = require('fs');
const path = require('path');
const getWeb3 = require('../utils/getWeb3.js');
const getArtifacts = require('../utils/getArtifacts');

module.exports = {
  register: (program) => {
    program
      .command('disassemble <contractPath>')
      .description('Disassembles compiled bytecode into readable EVM opcodes.')
      .action((contractPath) => {

        // Retrieve contract artifacts and abi.
        const contractArtifacts = getArtifacts(contractPath);
        
        // Retrieve bytecode.
        const output = disassemble(
          contractArtifacts.bytecode,
          contractArtifacts.deployedBytecode
        );
        process.stdout.write(output);
      });

    let opcodes;

    function disassemble(bytecode, deployedBytecode) {

      // Remove '0x'.
      bytecode = bytecode.substring(2, bytecode.length - 1);
      deployedBytecode = deployedBytecode.substring(2, deployedBytecode.length - 1);

      // Calculate deployed bytecode offset.
      const bytecodeLen = bytecode.length / 2;
      const deployedBytecodeLen = deployedBytecode.length / 2;
      const runtimeOffset = bytecodeLen - deployedBytecodeLen;

      let res = ''; // Will contain the disassembled output.
      let currentInstructionIdx = 0;
      let currentByteIdx = 0;
      let offset = 0;

      // Sweep bytecode string.
      while(offset < bytecode.length) {

        // Append line break.
        if(currentInstructionIdx !== 0) {
          res += '\n';
        }
      
        // Grab the next substring.
        const hex = bytecode.substring(offset, offset + 2);
        offset += 2;

        // Convert the opcode from hex.
        const opcode = hexToOpcode(hex);

        // Binary opcode like PUSH?
        const binaryLen = binaryChunkLength(opcode);
        if(binaryLen > 0) {

          // Read number.
          const num = bytecode.substring(offset, offset + binaryLen); 
          offset += binaryLen;

          // Build output.
          const offsetStr = currentByteIdx < runtimeOffset ? '' : `, r${currentByteIdx - runtimeOffset}`;
          res += `${currentInstructionIdx} {0x${hex}} [c${currentByteIdx}${offsetStr}] ${opcode} 0x${num} (dec ${parseInt(num, 16)})`;
          currentByteIdx += 1 + binaryLen / 2;
        }
        else {

          // Build output.
          const offsetStr = currentByteIdx < runtimeOffset ? '' : `, r${currentByteIdx - runtimeOffset}`;
          res += `${currentInstructionIdx} {0x${hex}} [c${currentByteIdx}${offsetStr}] ${opcode}`;
          currentByteIdx++;
        }
        currentInstructionIdx++;
      }

      return res;
    }

    function binaryChunkLength(opcode) {
      const isPush = opcode.includes('PUSH');
      if(isPush) {
        const len = opcode.split('PUSH')[1];
        return parseInt(len * 2, 10);
      }
      else return 0;
    }

    function hexToOpcode(hex) {
      if(!opcodes) opcodes = buildOpcodes();
      return opcodes[hex] || `INVALID (${hex})`;
    }

    function buildOpcodes() {

      const opcodes = { 
        '00': 'STOP',
        '01': 'ADD',
        '02': 'MUL',
        '03': 'SUB',
        '04': 'DIV',
        '05': 'SDIV',
        '06': 'MOD',
        '07': 'SMOD',
        '08': 'ADDMOD',
        '09': 'MULMOD',
        '0a': 'EXP',
        '0b': 'SIGNEXTEND',
        '10': 'LT',
        '11': 'GT',
        '12': 'SLT',
        '13': 'SGT',
        '14': 'EQ',
        '15': 'ISZERO',
        '16': 'AND',
        '17': 'OR',
        '18': 'XOR',
        '19': 'NOT',
        '1a': 'BYTE',
        '20': 'SHA3',
        '30': 'ADDRESS',
        '31': 'BALANCE',
        '32': 'ORIGIN',
        '33': 'CALLER',
        '34': 'CALLVALUE',
        '35': 'CALLDATALOAD',
        '36': 'CALLDATASIZE',
        '37': 'CALLDATACOPY',
        '38': 'CODESIZE',
        '39': 'CODECOPY',
        '3a': 'GASPRICE',
        '3b': 'EXTCODESIZE',
        '3c': 'EXTCODECOPY',
        '3d': 'RETURNDATASIZE',
        '3e': 'RETURNDATACOPY',
        '40': 'BLOCKHASH',
        '41': 'COINBASE',
        '42': 'TIMESTAMP',
        '43': 'NUMBER',
        '44': 'DIFFICULTY',
        '45': 'GASLIMIT',
        '50': 'POP',
        '51': 'MLOAD',
        '52': 'MSTORE',
        '53': 'MSTORE8',
        '54': 'SLOAD',
        '55': 'SSTORE',
        '56': 'JUMP',
        '57': 'JUMPI',
        '58': 'PC',
        '59': 'MSIZE',
        '5a': 'GAS',
        '5b': 'JUMPDEST',
        'a0': 'LOG0',
        'a1': 'LOG1',
        'a2': 'LOG2',
        'a3': 'LOG3',
        'a4': 'LOG4',
        'f0': 'CREATE',
        'f1': 'CALL',
        'f2': 'CALLCODE',
        'f3': 'RETURN',
        'f4': 'DELEGATECALL',
        'f5': 'CALLBLACKBOX',
        'fa': 'STATICCALL',
        'fd': 'REVERT',
        'ff': 'SUICIDE'
      };

      // PUSH[1-32] opcodes.
      for(let i = 1; i <= 32; i++) {
        let hexKey = (parseInt('60', 16) -1 + i).toString(16); // Convert to decimal for addition, and return to hex.
        opcodes[hexKey] = `PUSH${i}`;
      }

      // DUP[1-16] opcodes.
      for(let i = 1; i <= 16; i++) {
        let hexKey = (parseInt('80', 16) -1 + i).toString(16);
        opcodes[hexKey] = `DUP${i}`;
      }
      
      // SWAP[1-16] opcodes.
      for(let i = 1; i <= 16; i++) {
        let hexKey = (parseInt('90', 16) -1 + i).toString(16);
        opcodes[hexKey] = `SWAP${i}`;
      }

      return opcodes;
    }
  }
};
