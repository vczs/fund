const { task } = require("hardhat/config")

task("tx-fund", "合约众筹").addParam("address", "fund contract address").setAction(async(taskArgs, hre) => {
    const { ethers } = hre

    const [account1, account2] = await ethers.getSigners()
    const fund = (await ethers.getContractFactory("Fund")).attach(taskArgs.address)

    console.log(`账户1地址:${account1.address},余额:${ethers.formatEther(await ethers.provider.getBalance(account1.address))} ETH`)
    console.log(`账户2地址:${account2.address},余额:${ethers.formatEther(await ethers.provider.getBalance(account2.address))} ETH`)

    const tx1 = await fund.connect(account1).fund({ value: ethers.parseEther("0.001") });
    await tx1.wait();
    let contractBalance = await ethers.provider.getBalance(await fund.getAddress());
    console.log(`账户1众筹:0.001 ETH,合约余额: ${ethers.formatEther(contractBalance)} ETH`);

    const tx2 = await fund.connect(account2).fund({ value: ethers.parseEther("0.002") });
    await tx2.wait();
    contractBalance = await ethers.provider.getBalance(await fund.getAddress());
    console.log(`账户1众筹:0.002 ETH,合约余额: ${ethers.formatEther(contractBalance)} ETH`);

    const account1InFund = await ethers.formatEther(await fund.fundAmount(account1.address))
    console.log(`合约中账户1众筹信息:${account1.address} is ${account1InFund} ETH`)
    const account2InFund = await ethers.formatEther(await fund.fundAmount(account2.address))
    console.log(`合约中账户2众筹信息${account2.address} is ${account2InFund} ETH`)
})

module.exports = {}