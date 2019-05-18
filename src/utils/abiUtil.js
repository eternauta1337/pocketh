const BN = require('bn.js');
const stringUtil = require('./stringUtil.js');
const Web3 = require('web3');

const web3 = new Web3();

module.exports = {
  parseVariableValue: (type, hex) => {
    hex = stringUtil.remove0x(hex);
  
    if(type.startsWith('struct')) {
      return 'composite value';
    }

    if(type.startsWith('contract')) {
      return `0x${hex}`;
    }

    if(type === 'bytes' || type.includes('[]') || type.startsWith('mapping')) {
      return 'dynamic value';
    }

    if(type.startsWith('uint')) {
      return (new BN(hex, 16)).toString(10);
    }

    if(type.startsWith('int')) {
      return (new BN(hex, 16)).fromTwos(256).toString(10);
    }

    if(type.startsWith('bytes')) {
      return web3.utils.toAscii(`0x${hex}`);
    }

    if(type === 'string') {
      if(hex === '0'.repeat(62)) return 'dynamic value';
      return web3.utils.toAscii(`0x${hex}`);
    }

    if(type === 'bool') {
      return hex === '01' ? 'true' : 'false';
    }

    if(type === 'address') {
      return `0x${hex}`;
    }

    throw new Error(`abiUtil cannot determine the value of variable of type ${type}`);
  }
};
