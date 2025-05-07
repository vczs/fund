const { ethers, getNamedAccounts, deployments } = require("hardhat");
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const { DEV_NETWORK_NAME } = require("../dev-hardhat-config");

DEV_NETWORK_NAME.includes(network.name)
? describe.skip
: describe("test fund contract for sepolia", async function() {
    let account1,account2
    let fund
    beforeEach(async function() {
        [account1, account2] = await ethers.getSigners();

        await deployments.fixture(["all"])
        const fundDeployment = await deployments.get("Fund")
        fund = await ethers.getContractAt("Fund", fundDeployment.address)
    })

    it("fund and drawFund success", async function() {
            await fund.connect(account1).fund({value: ethers.parseEther("0.001")})
            await fund.connect(account2).fund({value: ethers.parseEther("0.001")})
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            const tx = await fund.connect(account1).drawFund()
            const txReceipt = await tx.wait()
            expect(txReceipt).to.be.emit(fund, "DrawFund").withArgs(account1.address, ethers.parseEther("0.002"))
        }
    )
    
    it("fund and reFund success",
        async function() {
            await fund.connect(account1).fund({value: ethers.parseEther("0.001")})
            await new Promise(resolve => setTimeout(resolve, 181 * 1000))
            const tx = await fund.connect(account1).refund()
            const txReceipt = await tx.wait()
            expect(txReceipt).to.be.emit(fund, "Refund").withArgs(account1.address, ethers.parseEther("0.001"))
        }
    )

})