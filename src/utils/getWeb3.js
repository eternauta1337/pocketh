const fs = require('fs');
const Web3 = require('web3');

const defaultNetworks = {
  mainnet: "https://mainnet.infura.io/v3/ac987ae2aa3c436c958e050a82a5c8da",
  ropsten: "https://ropsten.infura.io/v3/ac987ae2aa3c436c958e050a82a5c8da",
  rinkeby: "https://rinkeby.infura.io/v3/ac987ae2aa3c436c958e050a82a5c8da",
  localhost: "http://localhost:8545"
};

module.exports = async (network) => {
  const provider = defaultNetworks[network] ? defaultNetworks[network] : network;
  return new Web3(provider);
};
