const { NET_WORK_ID_CONFIG, DEPLOY_MENT_TIME, CONFIRMATIONS_BLOCK } = require("../hardhat.config")
const { DEV_NETWORK_NAME, MOCK_DECIMAL, MOCK_INITIAL_ANSWER } = require("../dev-hardhat-config")

module.exports= async({getNamedAccounts, deployments, network}) => {
    const deploy = deployments.deploy
    const account1Addr = (await getNamedAccounts()).account1;
    
    let confirmations,dataFeedAddr
    if(DEV_NETWORK_NAME.includes(network.name)) {
        const mockV3Aggregator = await deploy("MockV3Aggregator", {
            from: account1Addr,
            args: [MOCK_DECIMAL, MOCK_INITIAL_ANSWER],
            log: true
        })
        confirmations = 0
        dataFeedAddr = mockV3Aggregator.address
    } else {
        confirmations = CONFIRMATIONS_BLOCK
        dataFeedAddr = NET_WORK_ID_CONFIG[network.config.chainId].ethUsdDataFeed
    }

    const fund = await deploy("Fund", {
        from: account1Addr,
        args: [DEPLOY_MENT_TIME, dataFeedAddr],
        waitConfirmations: confirmations,
        log: true
    })

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        await hre.run("verify:verify", {
            address: fund.address,
            constructorArguments: [DEPLOY_MENT_TIME, dataFeedAddr],
          });
        console.log(`合约验证成功,合约地址: ${fund.address}`)
    }
}

module.exports.tags = ["all", "fund"]