// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NftStaking is Ownable {
    using SafeMath for uint256;

    //Info each user
    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingAmount;
        uint256 lastStakedTime;
    }
    IERC721 public immutable nftToken;
    IERC20 public immutable ghspToken;
    uint256 public lastRewardBlock;
    uint256 public accGHSPPerShare;
    uint256 public rewardPerBlock;
    address public feeWallet;
    uint256 public harvestFee;
    uint256 public totalStakedAmount;
    uint256 private _rewardBalance;
    mapping(uint256 => address) allStakes; 
    mapping(address => mapping(uint256 => uint256)) public ownedTokens;
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // Info of each user that stakes LP tokens.
    mapping (address => UserInfo) public userInfo;

    event Staked(address staker, uint256[] tokenId);
    event UnStaked(address staker, uint256[] tokenId);
    event Harvest(address staker, uint256 amount, uint256 harvestFee);
    event DepositReward(address indexed user, uint256 amount);
    event SetFeeWallet(address indexed _feeWallet);
    event SetHarvestFee(uint256 _harvestFee);
    event UpdateRewardPerBlock(uint256 rewardPerBlock_);
    event WithdrawReward(address indexed user, uint256 amount);

    constructor(
        IERC721 _nftToken,
        IERC20 _ghspToken,
        uint256 _rewardPerBlock,
        address _feeWallet
    ) {
        nftToken = _nftToken;
        ghspToken = _ghspToken;
        rewardPerBlock = _rewardPerBlock;
        feeWallet = _feeWallet;
        harvestFee = 10;
    }
    function setFeeWallet(address _feeWallet) external onlyOwner {
        feeWallet = _feeWallet;
        emit SetFeeWallet(feeWallet);
    }

    function setHarvestFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 40, "setHarvestFee: feePercent > 40");
        harvestFee = _feePercent;
        emit SetHarvestFee(_feePercent);
    }
    
    function updateRewardPerBlock(uint256 rewardPerBlock_) external onlyOwner {
        require(rewardPerBlock_ > 0, "updateRewardPerBlock: rewardPerBlock should be positive amount");

        updateStatus();
        rewardPerBlock = rewardPerBlock_;

        emit UpdateRewardPerBlock(rewardPerBlock);
    }

    function getMultiplier(uint256 _from, uint256 _to) public pure returns (uint256) {
        return _to.sub(_from);
    }

    function getRewardBalance() public view returns (uint256) {
        if (block.number > lastRewardBlock && totalStakedAmount != 0) {
            uint256 multiplier = getMultiplier(lastRewardBlock, block.number);
            uint256 reward = multiplier.mul(rewardPerBlock);
            if(_rewardBalance > reward){
                return _rewardBalance.sub(reward);
            }
            else {
                return 0;
            }
        }
        else {
            return _rewardBalance;
        }
    }

    function depositReward(uint256 _amount) external onlyOwner {
        ghspToken.transferFrom(msg.sender, address(this), _amount);
        emit DepositReward(msg.sender, _amount);
        _rewardBalance = _rewardBalance.add(_amount);
    }

    function withdrawReward(address receiver) external onlyOwner {
        uint256 remains = getRewardBalance();
        require(remains > 0, "withdrawReward: no reward balance");
        require(remains <= ghspToken.balanceOf(address(this)), "withdrawReward: insufficient balance");
        require(receiver != address(0), "withdrawReward: invalid receiver address");
        
        updateStatus();
        _rewardBalance = 0;
        updateStatus();

        ghspToken.transfer(receiver, remains);

        emit WithdrawReward(receiver, remains);
    }

    function updateStatus() private {
        if (block.number <= lastRewardBlock) {
            return;
        }
        if (totalStakedAmount == 0) {
            lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(lastRewardBlock, block.number);
        uint256 reward = multiplier.mul(rewardPerBlock);
        if (_rewardBalance == 0) {
            lastRewardBlock = block.number;
            return;
        }
        if (_rewardBalance < reward) {
            accGHSPPerShare = accGHSPPerShare.add(_rewardBalance.mul(1e12).div(totalStakedAmount));
            _rewardBalance = 0;
        } else {
            _rewardBalance = _rewardBalance.sub(reward);
            accGHSPPerShare = accGHSPPerShare.add(reward.mul(1e12).div(totalStakedAmount));
        }
        lastRewardBlock = block.number;
    }
    function stake(uint256[] calldata tokenIds) external {
        require(_rewardBalance > 0, "rewardBalance is 0");
        require(tokenIds.length > 0, "NFT Staking: Empty Array");
        for(uint256 i = 0; i < tokenIds.length; i ++){
            require(nftToken.ownerOf(tokenIds[i]) == msg.sender, "NFT Staking: not owner of token.");
            for(uint256 j = i + 1; j < tokenIds.length; j ++){
                require(tokenIds[i] != tokenIds[j], "NFT Staking: duplicate token ids in input params.");
            }
        }
        updateStatus();
        UserInfo storage user = userInfo[msg.sender];
        if (user.amount > 0) {
            uint256 pending = user.amount.mul(accGHSPPerShare).div(1e12).sub(user.rewardDebt);
            user.pendingAmount = user.pendingAmount.add(pending);
        }
        uint256 tokenAmount = tokenIds.length;
        totalStakedAmount = totalStakedAmount.add(tokenAmount);
        uint256 lastTokenIndex ;
        for(uint256 i = 0; i < tokenIds.length; i ++){
            lastTokenIndex = user.amount + i;
            ownedTokens[msg.sender][lastTokenIndex] = tokenIds[i];
            _ownedTokensIndex[tokenIds[i]] = lastTokenIndex;
            nftToken.transferFrom(msg.sender, address(this), tokenIds[i]);
        }
        user.amount = user.amount.add(tokenAmount);
        user.rewardDebt = user.amount.mul(accGHSPPerShare).div(1e12);
        user.lastStakedTime = block.timestamp;
        emit Staked(msg.sender, tokenIds);
    }

    function unstake(uint256[] calldata tokenIds) external {
        require(tokenIds.length > 0, "NFT Staking: Empty Array");
        for(uint256 i = 0; i < tokenIds.length; i ++){
            require(ownedTokens[msg.sender][_ownedTokensIndex[tokenIds[i]]] == tokenIds[i], "Nft Unstaking: token not staked or incorrect token owner.");
            for(uint256 j = i + 1; j < tokenIds.length; j ++){
                require(tokenIds[i] != tokenIds[j], "NFT Staking: duplicate token ids in input params.");
            }
        }

        updateStatus();
        UserInfo storage user = userInfo[msg.sender];
        uint256 pending = user.amount.mul(accGHSPPerShare).div(1e12).sub(user.rewardDebt);
        if (ghspToken.balanceOf(address(this)) < pending) {
            pending = ghspToken.balanceOf(address(this));
        }
        user.pendingAmount = user.pendingAmount.add(pending);
        uint256 tokenAmount = tokenIds.length;
        uint256 lastTokenIndex ;
        for(uint256 i = 0; i < tokenAmount; i ++){
            lastTokenIndex = user.amount - i - 1;
            if(_ownedTokensIndex[tokenIds[i]] != lastTokenIndex){
                ownedTokens[msg.sender][_ownedTokensIndex[tokenIds[i]]] = ownedTokens[msg.sender][lastTokenIndex]; 
                _ownedTokensIndex[ownedTokens[msg.sender][lastTokenIndex]] = _ownedTokensIndex[tokenIds[i]]; 
            }
            delete _ownedTokensIndex[tokenIds[i]];
            delete ownedTokens[msg.sender][lastTokenIndex];
            nftToken.transferFrom(address(this), msg.sender, tokenIds[i]);
        }
        totalStakedAmount = totalStakedAmount.sub(tokenAmount);
        user.amount = user.amount.sub(tokenAmount);
        user.rewardDebt = user.amount.mul(accGHSPPerShare).div(1e12);
        emit UnStaked(msg.sender, tokenIds);
    }

    function getPending(address _user) public view returns (uint256) {
        uint256 pending = _getPending(_user);
        uint256 _harvestFee = pending.mul(harvestFee).div(100);
        return pending - _harvestFee;
    }
    
    function _getPending(address _user) private view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 acc = accGHSPPerShare;
        if (block.number > lastRewardBlock && totalStakedAmount != 0) {
            uint256 multiplier = getMultiplier(lastRewardBlock, block.number);
            uint256 reward = multiplier.mul(rewardPerBlock);
            acc = acc.add(reward.mul(1e12).div(totalStakedAmount));
        }
        return user.amount.mul(acc).div(1e12).sub(user.rewardDebt).add(user.pendingAmount);
    }

    function harvest() external {
        uint256 rewardAmount = _getPending(msg.sender);
        UserInfo storage user = userInfo[msg.sender];
        uint256 _harvestFee = rewardAmount.mul(harvestFee).div(100);
        uint256 amount = rewardAmount - _harvestFee;
        if (ghspToken.balanceOf(address(this)) < amount) {
            amount = ghspToken.balanceOf(address(this));
        }
        ghspToken.transfer(msg.sender, amount);

        if (ghspToken.balanceOf(address(this)) < _harvestFee) {
            _harvestFee = ghspToken.balanceOf(address(this));
        }
        ghspToken.transfer(feeWallet, _harvestFee);
        updateStatus();
        user.pendingAmount = 0;
        user.rewardDebt = user.amount.mul(accGHSPPerShare).div(1e12);
        emit Harvest(msg.sender, amount, _harvestFee);
    }
}