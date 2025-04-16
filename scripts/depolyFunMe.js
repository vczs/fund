const hre = require("hardhat")
const { ethers } = hre
require("@nomicfoundation/hardhat-verify");

async function main(){
    const [account1, account2] = await ethers.getSigners()
    console.log(`部署合约owner账户:${account1.address}`)

    const fundMe = await ethers.getContractFactory("Fund").then(factory => factory.connect(account1).deploy(1000));
    await fundMe.waitForDeployment();
    console.log(`合约部署成功，合约地址: ${fundMe.target}`);

    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_KEY){
        console.log(`等待3个区块确认`)
        await fundMe.deploymentTransaction().wait(3)
        await verifyFund(fundMe.target,[1000])
    } else {
        console.log("verification skipped..")
    }

    console.log(`账户1地址:${account1.address},余额:${ethers.formatEther(await ethers.provider.getBalance(account1.address))} ETH`)
    console.log(`账户2地址:${account2.address},余额:${ethers.formatEther(await ethers.provider.getBalance(account2.address))} ETH`)

    const tx1 = await fundMe.connect(account1).fund({ value: ethers.parseEther("0.001") });
    await tx1.wait();
    console.log(`账户1 fund: 0.001 ETH`);
    let contractBalance = await ethers.provider.getBalance(await fundMe.getAddress());
    console.log(`合约余额: ${ethers.formatEther(contractBalance)} ETH`);

    const tx2 = await fundMe.connect(account2).fund({ value: ethers.parseEther("0.002") });
    await tx2.wait();
    console.log(`账户2 fund: 0.002 ETH`);
    contractBalance = await ethers.provider.getBalance(await fundMe.getAddress());
    console.log(`合约余额: ${ethers.formatEther(contractBalance)} ETH`);

    const account1InFund = await ethers.formatEther(await fundMe.fundAmount(await account1.getAddress()))
    console.log(`合约中账户1众筹信息:${account1.address} is ${account1InFund} ETH`)
    const account2InFund = await ethers.formatEther(await fundMe.fundAmount(await account2.getAddress()))
    console.log(`合约中账户2众筹信息${account2.address} is ${account2InFund} ETH`)
}

async function verifyFund(fundAddress,args){
    await hre.run("verify:verify", {
        address: fundAddress,
        constructorArguments: args,
      });
    console.log(`合约认证成功,合约地址: ${fundAddress}`)
}

main().then().catch((error) => {
    console.error(error)
    process.exit(0)
})