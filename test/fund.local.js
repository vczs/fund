const { ethers, getNamedAccounts, deployments,  network } = require("hardhat");
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect } = require("chai");

const { DEV_NETWORK_NAME } = require("../dev-hardhat-config");

!DEV_NETWORK_NAME.includes(network.name)
? describe.skip
: describe("test fund contract for local", async function() {
    let account1,account2
    let mockDataFeedAddress
    let fund
    beforeEach(async function() {
        [account1, account2] = await ethers.getSigners();

        await deployments.fixture(["all"]) // 执行hardhat-deploy的fixture功能，运行并部署名为"all"的部署脚本标签对应的合约，并重置到该部署状态。
        const fundDeployment = await deployments.get("Fund") // 从hardhat-deploy的部署记录中读取名为"Fund"的合约的部署信息。
        fund = await ethers.getContractAt("Fund", fundDeployment.address) // 加载已部署的名为"Fund"的合约实例。

        mockDataFeed = await deployments.get("MockV3Aggregator")
        mockDataFeedAddress = mockDataFeed.address
    })

    it("test if the contract owner is account1", async function() {
        await fund.waitForDeployment()
        const owner = await fund.owner()
        assert.equal(owner, account1.address)
    })

    it("test if the contract datafeed is mockDataFeed", async function() {
        await fund.waitForDeployment()
        const dataFeedAddress = await fund.dataFeed()
        assert.equal(dataFeedAddress, mockDataFeedAddress)
    })

    it("test fund is close. try fund would failed", 
        async function() {
            await time.increase(181); // 等待181s
            await mine();
            await expect(fund.connect(account1).fund({ value: ethers.parseEther("0.1") })).to.be.revertedWith("fund is close~");
        }
    )

    it("test already fund. try fund would failed", 
        async function() {
            await fund.connect(account1).fund({ value: ethers.parseEther("0.1") })
            await expect(fund.connect(account1).fund({ value: ethers.parseEther("0.1") })).to.be.revertedWith("you have fund~")
        }
    )

    it("test fund less taht min usdt. try fund would failed", 
        async function() {
            await expect(fund.connect(account1).fund({ value: ethers.parseEther("0.0001") })).to.be.revertedWith("send more eth~")
        }
    )

    it("test already fund. query fund amount", 
        async function() {
            await fund.connect(account1).fund({value: ethers.parseEther("0.1")})
            const account1FundAmount = await fund.connect(account1).fundAmount(account1.address)
            await expect(account1FundAmount).to.equal(ethers.parseEther("0.1"))
        }
    )

    it("test not onwer, fund already closed, target is reached, try drawFund would failed", 
        async function() {
            await fund.connect(account1).fund({value: ethers.parseEther("0.1")})
            await time.increase(181);
            await mine();
            await expect(fund.connect(account2).drawFund()).to.be.revertedWith("you not is contract owner~")
        }
    )

    it("test is onwer, target is reached, fund is exec, try drawFund would failed", 
        async function() {
            await fund.connect(account2).fund({value: ethers.parseEther("0.5")})
            await expect(fund.connect(account1).drawFund()).to.be.revertedWith("fund is exec~")
        }
    )

    it("test is onwer, fund already closed, target not reached, try drawFund would failed", 
        async function() {
            await fund.connect(account1).fund({value: ethers.parseEther("0.001")})
            await time.increase(181);
            await mine();
            await expect(fund.connect(account1).drawFund()).to.be.revertedWith("target is not reached~")
        }
    )

    it("test is onwer, fund already closed, target is reached, drawFund success", 
        async function() {
            await fund.connect(account2).fund({value: ethers.parseEther("0.5")})
            await time.increase(181);
            await mine(); 
            await expect(fund.connect(account1).drawFund()).to.emit(fund, "DrawFund").withArgs(account1.address, ethers.parseEther("0.5"))
        }
    )

    it("test fund is exec, refund would failed", 
        async function() {
            await fund.connect(account2).fund({value: ethers.parseEther("0.1")})
            await expect(fund.connect(account2).refund()).to.be.revertedWith("fund is exec~")
        }
    )

    it("test target not reached, fund already end, refund would failed", 
        async function() {
            await fund.connect(account2).fund({value: ethers.parseEther("0.01")})
            await time.increase(181);
            await mine(); 
            await expect(fund.connect(account2).refund()).to.be.revertedWith("target is reached~")
        }
    )

    it("test no fund, fund already end, target is reached, refund would failed", 
        async function() {
            await fund.connect(account2).fund({value: ethers.parseEther("0.001")})
            await time.increase(181);
            await mine(); 
            await expect(fund.connect(account1).refund()).to.be.revertedWith("there is no fund for you~")
        }
    )

    it("test target not reached, fund already end, refund success", 
        async function() {
            await fund.connect(account2).fund({value: ethers.parseEther("0.001")})
            await time.increase(181);
            await mine(); 
            await expect(fund.connect(account2).refund()).to.emit(fund, "Refund").withArgs(account2.address, ethers.parseEther("0.001"))
        }
    )
})