const etherscan = require('etherscan-api');

module.exports = (network) => {
  return etherscan.init(
    '391YIKRFHH8PANTHRX482KKHSUMBA3NPMF',
    network,
    15000
  );
};
