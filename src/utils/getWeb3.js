const fs = require('fs');
const Web3 = require('web3');

module.exports = async (networkName) => {

  // Retrieve provider info.
  const config = JSON.parse(fs.readFileSync('./networks.json', 'utf8'));
  const network = config.networks[networkName];
  if(!network) throw new Error(`Network ${networkName} not found!`);

  // Instantiate web3.
  const provider = `${network.host}${network.port ? `:${network.port}` : ''}`;
  const web3 = new Web3(provider);

  return web3;
};
