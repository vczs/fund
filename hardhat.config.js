require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config()
require("./tasks")

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const ACCOUNT1_PRIVATE_KEY = process.env.ACCOUNT1_PRIVATE_KEY;
const ACCOUNT2_PRIVATE_KEY = process.env.ACCOUNT2_PRIVATE_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

module.exports = {
  defaultNetwork:"sepolia",
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url:SEPOLIA_URL,
      accounts:[ACCOUNT1_PRIVATE_KEY,ACCOUNT2_PRIVATE_KEY],
      chainId:11155111
    }
  },
  etherscan:{
    apiKey:{
      sepolia:ETHERSCAN_KEY
    }
  }
};
