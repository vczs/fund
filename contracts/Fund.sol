// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract Fund{
    event DrawFund(address,uint256);
    event Refund(address,uint256);

    // 外部合约:喂价数据
    AggregatorV3Interface public dataFeed;

    // 合约所有者
    address public owner;

    // 合约投资者支付金额
    mapping(address => uint256) public fundAmount;
    // 合约融资目标
    uint256 constant private CONTRACT_TARGET_USD_AMOUNT = 2;
    // 投资最小金额(USD)
    uint256 constant private FUND_MIN_USD_AMOUNT = 1;
    // 合约生效时间(部署时间)
    uint256 private FUND_EXEC_TIMESTAMP;
    // 合约关闭时间
    uint256 private FUND_CLOSE_TIMESTAMP;

    // 合约构造函数
    constructor(uint256 deployMentTime, address dataFeedAddress) {
        dataFeed = AggregatorV3Interface(dataFeedAddress);
        owner = msg.sender;
        FUND_EXEC_TIMESTAMP = block.timestamp;
        FUND_CLOSE_TIMESTAMP = FUND_EXEC_TIMESTAMP + deployMentTime;
    }

    //**********************************************************************//
    // 合约投资
    function fund() external payable{
        require(block.timestamp < FUND_CLOSE_TIMESTAMP,"fund is close~");
        require(fundAmount[msg.sender] == 0, "you have fund~");
        require(ethToUsd(msg.value) >= FUND_MIN_USD_AMOUNT, "send more eth~");
        fundAmount[msg.sender] = msg.value;
    }
    // 合约退款
    function refund() external {
        require(block.timestamp >= FUND_CLOSE_TIMESTAMP,"fund is exec~");
        require(ethToUsd(address(this).balance) < CONTRACT_TARGET_USD_AMOUNT,"target is reached~");
        require(fundAmount[msg.sender] != 0, "there is no fund for you~");
        uint256 amount = fundAmount[msg.sender];
        fundAmount[msg.sender] = 0; // 先将余额置零，防止重入攻击
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success,"refund transfer failed~");
        emit Refund(msg.sender, amount);
    }
    // 合约提款
    function drawFund() external onlyOWner{
        require(block.timestamp >= FUND_CLOSE_TIMESTAMP,"fund is exec~");
        require(ethToUsd(address(this).balance) >= CONTRACT_TARGET_USD_AMOUNT, "target is not reached~");

        uint256 balance = address(this).balance;
        bool success;
        (success, )= payable(msg.sender).call{ value: balance }("");
        require(success,"draw transfer failed~");
        fundAmount[msg.sender] = 0;
        emit DrawFund(msg.sender, balance);
    }
    // 更换合约所有者
    function transferContractOwner(address _owner) external onlyOWner{
        owner = _owner;
    }
    //**********************************************************************//

    // 获取最新ETH/USD价格数据
    function getChainlinkDataFeedLatestAnswer() private view returns (int) {
        ( ,int answer, , ,) = dataFeed.latestRoundData();
        return answer;
    }

    // eth转usd
    function ethToUsd(uint256 weiAmount) internal view returns(uint256) {
        uint256 price = uint256(getChainlinkDataFeedLatestAnswer());
        return price * weiAmount / (10 ** 26); 
    }
    
    // 仅允许合约所有者调用
    modifier onlyOWner(){
       require(msg.sender == owner,"you not is contract owner~");_;
    }
}