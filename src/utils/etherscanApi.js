const axios = require('axios');

module.exports = {

  getSourceCode: async (address) => {
    const req = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}`;
    const response = await axios.get(req);
    const sourceCode =  response.data.result[0].SourceCode;
    return sourceCode;
  },
};
