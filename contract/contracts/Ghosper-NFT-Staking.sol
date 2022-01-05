// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Ghosper-NFT Staking
 * Distribute BEP20 rewards over discrete-time schedules for the staking of NFTs on Ethereum network.
 * This contract is designed on a self-service model, where users will stake NFTs, unstake NFTs and claim rewards through their own transactions only.
 */
contract NftStaking is Ownable {

    /* ------------------------------ States --------------------------------- */

    using SafeMath for uint256;

    IERC721 public immutable nftTokenAddress;           // contract address of nft

    IERC20 public immutable rewardTokenAddress;         // contract address of erc20 - rewarding token

    mapping(uint256 => address) allStakes;              // all stakes : tokenId => staker

    uint256[] stakeIndices;                             // contains all staked tokenID

    address public feeAddress;                          // address for fee

    uint256 public harvestFee;                          // harvest fee

    mapping(address => UserInfo) stakerInfos;           // user infos

    struct UserInfo{                                    
        uint256 reward;                                 // amount of rewards
        uint256 lastUpdatedTime;                        // last updated time of rewards
    }

    struct SnapStaking {                                // SnapShot of Staking
        address user;                                   // staker
        uint256 time;                                   // time
        bool status;                                    // stake or unstake
        uint256 tokenId;                                // tokenId
    }

    SnapStaking[] public stakingHistories;              // history of all staking

    struct SnapHarvest {                                // SnapShot of Harvesting
        address user;                                   // staker
        uint256 time;                                   // time
        bool status;                                    // pending or complete
        uint256 amount;                                 // amount
        uint256 fee;                                    // fee
    }

    SnapHarvest[] public harvestingHistories;           // history of harvest
    
    bool public isRunning;                              // is running or not

    uint256 public decimal;                             // decimal of reward token

    uint256 public totalSupply;                         // total Supply of rewarding - min: 10K

    uint256 public totalStakingPeriodDays;              // total staking period by days - min: 1 Month
    
    uint256 private _totalRewards;                      // total Rewardings

    uint256 private _totalHarvest;                      // total amount of harvested

    uint256 private _totalFee;                          // total amount of fee

    uint256 private _rewardCapacity;                    // total amount of token in contract for rewarding

    uint256 private _rewardAmountPerSecond;             // total rewarding per second

    /* ------------------------------ Events --------------------------------- */

    event Staked(address staker, uint256[] tokenId);
    
    event UnStaked(address staker, uint256[] tokenId);

    event Harvest(address staker, uint256 amount);

    event AdminDeposit(address admin, uint256 amount);

    event AdminWithdraw(address admin, uint256 amount);

    event AdminUnStaked(address staker, uint256 tokenId);

    event AdminUpdatedAPY(uint256 totalSupply, uint256 totalPeriods);

    event AdminUpdatedRunning(bool status);

    event AdminUpdatedHarvestFee(uint fee);

    event AdminUpdatedFeeAddress(address feeAddress_);

    /* ------------------------------ Modifiers --------------------------------- */


    /* ------------------------------ User Functions --------------------------------- */

    /* 
        Contructor of contract
    params:
        - nftTokenAddress: Contract Address of NFT
        - totalSupply: total amount of rewarding tokens
        - totalStakingPeriodDays: total time of staking for nft tokens by days
        - deciaml: decimal of rewarding token
    */
    constructor(
        IERC721 nftTokenAddress_,
        IERC20 rewardTokenAddress_,
        uint256 totalSupply_,
        uint256 totalStakingPeriodDays_,
        address feeAddress_,
        uint256 harvestFee_
    ) {
        require(totalSupply_ >= 1e4 * (10 ** 18), "Contract Constructor: Not Enough Supply Amount, bigger than 10K");
        require(totalStakingPeriodDays_ > 0, "Contract Constructor: Not Enough Staking Period, bigger than 1 days");
        require(feeAddress_ != address(0), "Contract Constructor: Invalid fee address");

        nftTokenAddress = nftTokenAddress_;
        rewardTokenAddress = rewardTokenAddress_;

        decimal = 18;

        totalSupply = totalSupply_ ;
        totalStakingPeriodDays = totalStakingPeriodDays_;
        
        isRunning = true;

        feeAddress = feeAddress_;
        harvestFee = harvestFee_;

        _updateRewardAmountPerSecond();
    }

    /*
        Cal rewards per seconds from APY
    */
    function _updateRewardAmountPerSecond() private {
        _rewardAmountPerSecond = totalSupply / (totalStakingPeriodDays * 24 * 3600);
    }

    /*
        Get total count of staked token
    */
    function numberOfTotalStakes() public view returns(uint256){
        uint256 count = 0;
        for(uint256 i = 0; i < stakeIndices.length; i ++){
            if(allStakes[stakeIndices[i]] != address(0))
                count ++;
        }
        return count;
    }

    /*
        Get count of staked token per user
    */
    function _numberOfStakes(address staker) private view returns(uint256){
        uint256 count = 0;
        for(uint256 i = 0; i < stakeIndices.length; i ++){
            if(allStakes[stakeIndices[i]] == staker)
                count ++;
        }
        return count;
    }

    /*
        Update Rewardings(amount and time)
        notice: rewarding amount increases only isRunning
    */
    function _updateRewards(address staker) private {
        uint256 total = numberOfTotalStakes();
        uint256 count = _numberOfStakes(staker);
        
        if(stakerInfos[staker].lastUpdatedTime == 0 || total == 0 || count == 0) return;

        uint256 current = block.timestamp;

        if(isRunning){
            uint256 rewarding = _calculateAddingRewards(staker);
            stakerInfos[staker].reward = stakerInfos[staker].reward + rewarding;
            _totalRewards = _totalRewards + rewarding;
        }

        stakerInfos[staker].lastUpdatedTime = current;
    }

    /*
        Get Adding rewardings not stored in storage
    */
    function _calculateAddingRewards(address staker) private view returns(uint256){
        uint256 total = numberOfTotalStakes();
        uint256 count = _numberOfStakes(staker);
        
        if(!isRunning || stakerInfos[staker].lastUpdatedTime == 0 || total == 0 || count == 0)
            return 0;
        
        uint256 current = block.timestamp;
        uint256 rewarding = (current - stakerInfos[staker].lastUpdatedTime) * _rewardAmountPerSecond * count / total;

        return rewarding;
    }

    /*
        Get total Adding rewardings not stored in storage
    */
    function _calculateTotalAddingRewards() private view returns(uint256){
        uint256 totalAdding;
        for(uint256 i = 0; i < stakeIndices.length; i ++){
            if(allStakes[stakeIndices[i]] != address(0)){
                totalAdding = totalAdding + _calculateAddingRewards(allStakes[stakeIndices[i]]);
            }
        }
        return totalAdding;
    }

    /*
        Update Rewardings for all stakers
    */
    function _updateAllRewards() private {
        for(uint256 i = 0; i < stakeIndices.length; i++){
            if(allStakes[stakeIndices[i]] != address(0)){
                _updateRewards(allStakes[stakeIndices[i]]);
            }
        }
    }

    /*
        Get farming amount per second by user
    */
    function rewardsPerSecond() external view returns(uint256){
        uint256 total = numberOfTotalStakes();
        uint256 count = _numberOfStakes(msg.sender);
        if(total == 0 || count == 0) return 0;
        uint256 rewarding = _rewardAmountPerSecond * count / total;
        return rewarding;
    }

    /*
        Stake nft token
    */
    function stake(uint256[] calldata tokenIds) external {
        require(tokenIds.length > 0, "NFT Staking: Empty Array");
        for(uint256 i = 0; i < tokenIds.length; i ++){
            uint256 tokenId = tokenIds[i];
            require(allStakes[tokenId] == address(0), "NFT Staking: token already staked.");
            for(uint256 j = i + 1; j < tokenIds.length; j ++){
                require(tokenIds[i] != tokenIds[j], "NFT Staking: duplicate token ids in input params.");
            }
        }

        _updateRewards(msg.sender);

        for(uint256 i = 0; i < tokenIds.length; i ++){
            uint256 tokenId = tokenIds[i];
            allStakes[tokenId] = msg.sender;
            stakeIndices.push(tokenId);
            stakingHistories.push(SnapStaking(msg.sender, block.timestamp, true, tokenId));
            stakerInfos[msg.sender].lastUpdatedTime = block.timestamp;
            nftTokenAddress.transferFrom(msg.sender, address(this), tokenId);
        }

        emit Staked(msg.sender, tokenIds);
    }

    /*
        Unstake NFT token
    */
    function unstake(uint256[] calldata tokenIds) external {
        require(tokenIds.length > 0, "NFT Staking: Empty Array");
        for(uint256 i = 0; i < tokenIds.length; i ++){
            uint256 tokenId = tokenIds[i];
            require(allStakes[tokenId] == msg.sender, "Nft Unstaking: token not staked or incorrect token owner.");
            for(uint256 j = i + 1; j < tokenIds.length; j ++){
                require(tokenIds[i] != tokenIds[j], "NFT Staking: duplicate token ids in input params.");
            }
        }

        _updateRewards(msg.sender);

        for(uint256 i = 0; i < tokenIds.length; i ++){
            uint256 tokenId = tokenIds[i];
            allStakes[tokenId] = address(0);
            _removeTokenIdfromIndices(tokenId);
            stakingHistories.push(SnapStaking(msg.sender, block.timestamp, false, tokenId));

            nftTokenAddress.transferFrom(address(this), msg.sender, tokenId);
        }
        
        emit UnStaked(msg.sender, tokenIds);
    }

    /*
        Remove tokenID from array of staking tokens - this will be used as index in mapping
    */
    function _removeTokenIdfromIndices(uint256 tokenId) private {
        uint256 i = 0;
        for(i = 0; i < stakeIndices.length; i ++){
            if(stakeIndices[i] == tokenId){
                break;
            }
        }
        if(i >= stakeIndices.length) return;
        for(uint256 j = i; j < stakeIndices.length - 1; j ++){
            stakeIndices[j] = stakeIndices[j + 1];
        }
        stakeIndices.pop();
    }

    /*
        Harvest rewardings
    */
    function harvest(uint256 amount) external {
        _updateRewards(msg.sender);

        require(_rewardCapacity >= amount, "Harvest Rewarding: not enough reward capacity.");
        require(amount > 0 && stakerInfos[msg.sender].reward >= amount, "Harvest Rewarding: not enough rewards");

        stakerInfos[msg.sender].reward = stakerInfos[msg.sender].reward - amount;
        
        _totalHarvest = _totalHarvest + amount;
        _rewardCapacity = _rewardCapacity - amount;

        uint256 fee = amount * harvestFee / 100;

        _totalFee = _totalFee + fee;

        harvestingHistories.push(SnapHarvest(msg.sender, block.timestamp, true, amount, harvestFee));

        _totalHarvest = _totalHarvest + amount;

        rewardTokenAddress.transfer(msg.sender, amount - fee);
        rewardTokenAddress.transfer(feeAddress, fee);

        emit Harvest(msg.sender, amount);
    }

    /*
        Get all staked tokenIDs per user
        notice: make memory array for return
    */
    function balanceOfStakes() external view returns (uint256[] memory){
        uint256 len = 0;
        for(uint256 i = 0; i < stakeIndices.length; i ++){
            if(allStakes[stakeIndices[i]] == msg.sender){
                len ++;
            }
        }

        uint256[] memory stakes = new uint256[](len);
        uint256 index = 0;
        for(uint256 i = 0; i < stakeIndices.length; i ++){
            if(allStakes[stakeIndices[i]] == msg.sender){
                stakes[index] = stakeIndices[i];
                index ++;
            }
        }
        return stakes;
    }

    /*
        Get reward amounts
    */
    function balanceOfRewards() external view returns(uint256){
        return _balanceOfRewards(msg.sender);
    }

    function _balanceOfRewards(address staker) private view returns(uint256){
        return stakerInfos[msg.sender].reward + _calculateAddingRewards(staker);
    }

    /*
        Get logs of stake and unstake per user
    */
    function historyOfStakes() external view returns(uint256[] memory, uint256[] memory, bool[] memory){
        uint256 len = 0;
        for(uint256 i = 0; i < stakingHistories.length; i ++){
            if(stakingHistories[i].user == msg.sender){
                len ++;
            }
        }

        uint256[] memory times = new uint256[](len);
        uint256[] memory tokens = new uint256[](len);
        bool[] memory status = new bool[](len);
        uint256 index = 0;

        for(uint256 i = 0; i < stakingHistories.length; i ++){
            if(stakingHistories[i].user == msg.sender){
                times[index] = stakingHistories[i].time;
                tokens[index] = stakingHistories[i].tokenId;
                status[index] = stakingHistories[i].status;
                index ++;
            }
        }
        return (times, tokens, status);
    }

    /*
        Get logs of harvest per user
    */
    function historyOfHarvest() external view returns(uint256[] memory, uint256[] memory, bool[] memory, uint256[] memory){
        uint256 len = 0;
        for(uint256 i = 0; i < harvestingHistories.length; i ++){
            if(harvestingHistories[i].user == msg.sender){
                len ++;
            }
        }

        uint256[] memory times = new uint256[](len);
        uint256[] memory amounts = new uint256[](len);
        bool[] memory status = new bool[](len);
        uint256[] memory fees = new uint256[](len);
        uint256 index = 0;

        for(uint256 i = 0; i < harvestingHistories.length; i ++){
            if(harvestingHistories[i].user == msg.sender){
                times[index] = harvestingHistories[i].time;
                amounts[index] = harvestingHistories[i].amount;
                status[index] = harvestingHistories[i].status;
                fees[index] = harvestingHistories[i].fee;
                index ++;
            }
        }
        return (times, amounts, status, fees);
    }

    /* ------------------------------ Admin Functions --------------------------------- */
    /*
        Deposit token for rewarding by admin
        note - user should call the token address and approve for the amount for this contract
    */
    function adminDepositReward(uint256 amount) external onlyOwner {
        _rewardCapacity = _rewardCapacity + amount;
        
        rewardTokenAddress.transferFrom(msg.sender, address(this), amount);
        emit AdminDeposit(msg.sender, amount);
    }

    /*
        Withdraw rewarding token by admin
    */
    function adminWithdrawReward(uint256 amount) external onlyOwner {
        uint256 pendingRewards = _totalRewards + _calculateTotalAddingRewards() - _totalHarvest;
        require(_rewardCapacity - pendingRewards >= amount, "Admin Witdraw Rewards: not enough rewards capacity to withdraw");
        _rewardCapacity = _rewardCapacity - amount;

        rewardTokenAddress.transfer(msg.sender, amount);
        emit AdminWithdraw(msg.sender, amount);
    }
    /*
        Unstake NFT to staker by Admin 
    */
    function adminUnstakeNFT(uint256 tokenId) external onlyOwner {
        require(allStakes[tokenId] != address(0), "Admin Nft Unstaking: token not staked");

        address staker = allStakes[tokenId];
        _updateRewards(staker);

        allStakes[tokenId] = address(0);
        _removeTokenIdfromIndices(tokenId);
        stakingHistories.push(SnapStaking(staker, block.timestamp, false, tokenId));

        nftTokenAddress.transferFrom(address(this), staker, tokenId);
        emit AdminUnStaked(staker, tokenId);
    }

    /*
        Get all logs of stake and unstake
    */
    function adminAllHistoriesOfStakes() external view onlyOwner returns(uint256[] memory, uint256[] memory, bool[] memory){
        uint256 len = stakingHistories.length;
        uint256[] memory times = new uint256[](len);
        uint256[] memory tokens = new uint256[](len);
        bool[] memory status = new bool[](len);

        for(uint256 i = 0; i < stakingHistories.length; i ++){
            times[i] = stakingHistories[i].time;
            tokens[i] = stakingHistories[i].tokenId;
            status[i] = stakingHistories[i].status;
        }
        return (times, tokens, status);
    }

    /*
        Get all logs of harvest
    */
    function adminAllHistoriesOfHarvest() public view onlyOwner returns(uint256[] memory, uint256[] memory, bool[] memory, uint256[] memory){
        uint256 len = harvestingHistories.length;
        uint256[] memory times = new uint256[](len);
        uint256[] memory amounts = new uint256[](len);
        bool[] memory status = new bool[](len);
        uint256[] memory fees = new uint256[](len);

        for(uint256 i = 0; i < harvestingHistories.length; i ++){
            times[i] = harvestingHistories[i].time;
            amounts[i] = harvestingHistories[i].amount;
            status[i] = harvestingHistories[i].status;
            fees[i] = harvestingHistories[i].fee;
        }
        return (times, amounts, status, fees);
    }

    /*
        Get rewards of staker
    */
    function adminRewards(address staker) public view onlyOwner returns(uint256){
        return _balanceOfRewards(staker);
    }

    /*
        Start or stop staking logic by admin
    */
    function adminSetRunning(bool running_) public onlyOwner{
        if(running_ == isRunning) return;
        _updateAllRewards();
        isRunning = running_;
        emit AdminUpdatedRunning(isRunning);
    }

    /*
        Get Total Rewards, Harvest, Completed Harvest
    */
    function adminTotalRewardAndHarvest() public view onlyOwner returns(uint256, uint256, uint256, uint256){
        uint256 totalAdding = _calculateTotalAddingRewards();
        return (_rewardCapacity, _totalRewards + totalAdding, _totalHarvest, _totalFee);
    }


    /* 
        Update APY
    params:
        - nftTokenAddress: Contract Address of NFT
        - totalSupply: total amount of rewarding tokens
        - totalStakingPeriodDays: total time of staking for nft tokens by months
        - deciaml: decimal of rewarding token
    */
    function adminUpdateAPY(uint256 totalSupply_, uint256 totalPeriods_) public onlyOwner{
        require(totalSupply_ >= 1e4 * (10 ** decimal), "Admin Update APY: Not Enough Supply Amount, bigger than 10K");
        require(totalPeriods_ > 0, "Contract Constructor: Not Enough Staking Period, bigger than 1 (months)");

        _updateAllRewards();
        totalSupply = totalSupply_;
        totalStakingPeriodDays = totalPeriods_;
        _updateRewardAmountPerSecond();

        emit AdminUpdatedAPY(totalSupply, totalStakingPeriodDays);
    }

    function adminUpdateHarvestFee(uint fee) public onlyOwner{
        harvestFee = fee;

        emit AdminUpdatedHarvestFee(fee);
    }

    function adminUpdateFeeAddress(address address_) public onlyOwner{
        require(address_ != address(0), "Admin Update Fee Address: Invalid address");

        feeAddress = address_;

        emit AdminUpdatedFeeAddress(address_);
    }
}