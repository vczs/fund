const { task } = require("hardhat/config")

task("draw-fund", "合约提款").addParam("address", "fund contract address").setAction(async (taskArgs, hre) => {
    const { ethers } = hre;

    const [owner] = await ethers.getSigners()
    
    const fund = (await ethers.getContractFactory("Fund")).attach(taskArgs.address)
    console.log(`提款合约地址: ${taskArgs.address}`)

    try {
      const tx = await fund.connect(owner).drawFund()
      await tx.wait()
      console.log("提款成功!")
    } catch (err) {
      console.error("提款失败:", err.message)
    }
  })


module.exports = {}