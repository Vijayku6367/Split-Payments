require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

module.exports = {
  solidity: '0.8.19',
  networks: {
    tempo: {
      url: 'https://rpc.testnet.tempo.xyz',
      chainId: 42429,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
