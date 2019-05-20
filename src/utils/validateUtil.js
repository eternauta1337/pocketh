const Web3 = require('web3');

const web3 = new Web3();

const validateUtil = {

  positiveInteger: (value) => {
    return value.match(/^\+?[1-9][\d]*$/);
  },

  hex: (value) => {
    return value.match(/^0x[a-fA-F0-9]+$/);
  },

  bytes32: (value) => {
    return validateUtil.hex(value) && value.length === 66;
  },

  address: (value) => {
    return validateUtil.hex(value) && value.length === 42;
  },

  checksumAddress: (value) => {
    return web3.utils.isAddresss(value);
  }
};

module.exports = validateUtil;
