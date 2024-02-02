import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts =
  process.env.DEPLOYER_PRIVATE_KEY !== undefined
    ? [process.env.DEPLOYER_PRIVATE_KEY]
    : [];

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.HOP_MNEMONIC_TESTNET,
      },
    },
    localhost: {
      url: "http://localhost:8545",
      accounts: {
        mnemonic: process.env.HOP_MNEMONIC_TESTNET,
      },
    },
    goerli: {
      url: process.env.RPC_ENDPOINT_GOERLI || "",
      accounts,
    },
    mainnet: {
      url: process.env.RPC_ENDPOINT_MAINNET || "",
      accounts,
    },
    gnosis: {
      url: process.env.RPC_ENDPOINT_GNOSIS || "",
      accounts,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
