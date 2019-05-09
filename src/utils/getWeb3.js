const fs = require('fs');
const Web3 = require('web3');

module.exports = async (networkName) => {
  console.log(``);
  console.log(`Conecting web3...`);

  // Retrieve provider info.
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const network = config.networks[networkName];
  if(!network) throw new Error(`Network ${networkName} not found!`);

  // Instantiate web3.
  const provider = `${network.host}${network.port ? `:${network.port}` : ''}`;
  console.log(`provider:`, provider);
  const web3 = new Web3(provider);

  // Test connection.
  const id = await web3.eth.net.getId();
  console.log(`web3 connected to network with id: ${id}`);
  console.log(``);

  return web3;
};
