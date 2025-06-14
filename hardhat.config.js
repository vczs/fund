require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@chainlink/env-enc").config();
require("./task");

const ACCOUNT1_PRIVATE_KEY = process.env.ACCOUNT1_PRIVATE_KEY;
const ACCOUNT2_PRIVATE_KEY = process.env.ACCOUNT2_PRIVATE_KEY;
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;
const SEPOLIA_URL = process.env.SEPOLIA_URL;

const NET_WORK_ID_CONFIG = {
  11155111: {
      ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  },
  97: {
      ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
  }
}
const DEPLOY_MENT_TIME = 180
const CONFIRMATIONS_BLOCK = 5

module.exports = {
  defaultNetwork:"hardhat", // sepolia hardhat

  solidity: "0.8.28",

  mocha: {
    timeout: 300000
  },

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
  },

  namedAccounts: {
    account1: {
      default: 0,
    },
    account2: {
      default: 1,
    },
  },

  NET_WORK_ID_CONFIG,
  DEPLOY_MENT_TIME,
  CONFIRMATIONS_BLOCK
  
};
