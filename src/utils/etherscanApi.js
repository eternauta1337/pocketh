const axios = require('axios');

// Docs: https://etherscan.io/apis
const ETHERSCAN_API = `https://api.etherscan.io/api`;
const apikey = `391YIKRFHH8PANTHRX482KKHSUMBA3NPMF`;

module.exports = {

  getEtherPrice: async () => {
    const response = await axios.get(ETHERSCAN_API, {
      params: {
        module: 'stats',
        action: 'ethprice',
        apikey
      }
    });
    return response.data.result.ethusd;
  },

  getSourceCode: async (address) => {
    const response = await axios.get(ETHERSCAN_API, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address,
        apikey
      }
    });
    return response.data.result[0].SourceCode;
  },

  getSourceCodeFull: async (address) => {
    const response = await axios.get(ETHERSCAN_API, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address,
        apikey
      }
    });
    return response.data.result;
  },

  getAbi: async (address) => {
    const response = await axios.get(ETHERSCAN_API, {
      params: {
        module: 'contract',
        action: 'getabi',
        address,
        apikey
      }
    });
    return JSON.parse(response.data.result)
  },
};

function trace(response) {
  console.log(response.data.result);
}
