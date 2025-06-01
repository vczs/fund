const { task } = require("hardhat/config")

task("deploy-fund", "部署合约").addParam("dataFeedAddress", "fund contract address").setAction(async(taskArgs, hre) => {
    const ethers = hre.ethers

    const [owner] = await ethers.getSigners()
    console.log(`部署合约owner账户:${owner.address}`)

    const factory = await ethers.getContractFactory("Fund");
    const fund = await factory.connect(owner).deploy(180, taskArgs.dataFeedAddress);
    await fund.waitForDeployment();
    console.log(`合约部署成功,合约地址: ${fund.target}`);

    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_KEY){
        console.log(`等待3个区块确认`)
        await fund.deploymentTransaction().wait(3)
        await verifyfund(fund.target,[180,taskArgs.dataFeedAddress])
        console.log("合约验证成功")
    }
})

async function verifyfund(fundAddress, args) {
    await hre.run("verify:verify", {
        address: fundAddress,
        constructorArguments: args,
      });
    console.log(`合约认证成功,合约地址: ${fundAddress}`)
}

module.exports = {}