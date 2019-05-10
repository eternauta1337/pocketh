module.exports = {
  networks: {
    infura_mainnet: {
      host: "https://mainnet.infura.io/v3/ac987ae2aa3c436c958e050a82a5c8da"
    },
    infura_ropsten: {
      host: "https://ropsten.infura.io/v3/ac987ae2aa3c436c958e050a82a5c8da"
    },
    infura_rinkeby: {
      host: "https://rinkeby.infura.io/v3/ac987ae2aa3c436c958e050a82a5c8da"
    },
    mainnet: {
      host: "http://localhost",
      port: "8546"
    }
  },
  compilers: {
    solc: {
      version: "0.5.7"
    }
  }
};
