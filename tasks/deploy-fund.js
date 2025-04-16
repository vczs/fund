const { task } = require("hardhat/config")

task("deploy-fund", "部署合约").setAction(async(taskArgs, hre) => {
    const { ethers } = hre

    const [owner] = await ethers.getSigners()
    console.log(`部署合约owner账户:${owner.address}`)

    const fundMe = await ethers.getContractFactory("Fund").then(factory => factory.connect(owner).deploy(1000));
    await fundMe.waitForDeployment();
    console.log(`合约部署成功,合约地址: ${fundMe.target}`);

    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_KEY){
        console.log(`等待3个区块确认`)
        await fundMe.deploymentTransaction().wait(3)
        await verifyFundMe(fundMe.target,[1000])
    } else {
        console.log("verification skipped..")
    }
} )

async function verifyFundMe(fundAddress, args) {
    await hre.run("verify:verify", {
        address: fundAddress,
        constructorArguments: args,
      });
    console.log(`合约认证成功,合约地址: ${fundAddress}`)
}

module.exports = {}