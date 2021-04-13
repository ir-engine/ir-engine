require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  networks: {
    development: {
      host: process.env.RPC_HOST, // Localhost (default: none)
      port: 7545,
      gas: 6721975,
      gasPrice: 20000000000,
      network_id: 5777,
      from: new HDWalletProvider(
        process.env.KEY_MNEMONIC,
        process.env.WALLET_PROVIDER_URL
      ).getAddress(0),
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider({
          mnemonic: process.env.KEY_MNEMONIC,
          providerOrUrl: `https://rinkeby.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
          addressIndex: 0,
        })
      },
      network_id: 4,
      gas: 4500000,
      gasPrice: 10000000000,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '^0.8.0', // Fetch exact version from solc-bin (default: truffle's version)
    },
  },

  db: {
    enabled: false,
  },

  etherscan: {
    apiKey: process.env.APIETHERSCAN,
  },
}
