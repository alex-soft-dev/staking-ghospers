import {    
    NFT_CONNECT,
    NFT_DISCONNECT,
    NFT_UPDATEREWARD ,
    NFT_PREVPOOLINFO,
    NFT_HISTORY,
} from '../actions/actionType';

import {
    IS_NFT_CONNECTED,    
    WALLET_ADDRESS,
    NFT_BALANCE,
    NFT_REWARD,
    NFT_HARVESTHISTORY,
    NFT_STAKEHISTORY,
    STAKE_BALANCE,
    REWARDPERSEC,
    SPINNERSHOW,
    IS_ADMIN,
    ADMIN_INFO,
    ADMIN_HARVEST_HISTORY,
    ADMIN_STAKE_HISTORY,
    ADMIN_IS_RUNNING,
    SPINNERTEXT,
    ALL_STAKES,
    FEE_ADDRESS,
    HARVEST_FEE,    
    ADMIN_STAKING_DAYS,
    ADMIN_TOTAL_SUPPLY,
    PREV_NFT_STAKES,
    PREV_NFT_REWARDS,
    PREV_NFT_BALANCE_STAKE,
} from '../constants';

const initialState = {
    [IS_NFT_CONNECTED] : false,
    [IS_NFT_CONNECTED] : false,
    [WALLET_ADDRESS] : "0x0000000000000000000000000000000000000000",
    [NFT_HARVESTHISTORY] : {"0":[], "1":[], "2":[], "3":[]},
    [NFT_STAKEHISTORY] : [],
    [STAKE_BALANCE] : 0,
    [REWARDPERSEC] : 0,
    [NFT_REWARD] : 0,
    [NFT_BALANCE] : 0,
    [SPINNERSHOW] : false,
    [IS_ADMIN] : false,   
    balanceofstakes : {},    
    Wbalance : 0, 
    nft_balanceURIs : [],
    nft_balanceIds : [],
    nft_stakeUris : [],
    [ADMIN_INFO] : null,   
    [ADMIN_HARVEST_HISTORY] : null,   
    [ADMIN_STAKE_HISTORY] : null,
    [ADMIN_IS_RUNNING] : true,
    [ADMIN_STAKING_DAYS] : 1,
    [ADMIN_TOTAL_SUPPLY] : 0,   
    [SPINNERTEXT] : "Confirming transaction",
    [ALL_STAKES] : 0,
    [FEE_ADDRESS] : "0x0000000000000000000000000000000000000000",
    [HARVEST_FEE] : 0,        
    [PREV_NFT_STAKES] : [],
    [PREV_NFT_REWARDS] : 0,
    [PREV_NFT_BALANCE_STAKE]: 0,
    filterTransactions: [],
    moreState: false,
    curCnt: 0
}

export default function walletReducer(state = initialState, action) {
    // The reducer normally looks at the action type field to decide what happens
    switch (action.type) {
        case NFT_CONNECT:
            return({
                ...state,
                [IS_NFT_CONNECTED]:true,
                [WALLET_ADDRESS]: action.payload.address,
                [NFT_BALANCE]: action.payload.balance,
                [NFT_REWARD]: action.payload.reward,
                // [NFT_HARVESTHISTORY]: action.payload.harvestHistory,
                // [NFT_STAKEHISTORY]: action.payload.stakeHistory,
                filterTransactions: action.payload.filterTransactions,
                [STAKE_BALANCE]: action.payload.stakeBalance,
                [REWARDPERSEC]: action.payload.rewardPerSec,
                balanceofstakes : action.payload.balanceofstakes, 
                Wbalance : action.payload.Wbalance,
                nft_balanceURIs : action.payload.nft_balanceURIs, 
                nft_balanceIds : action.payload.nft_balanceIds, 
                nft_stakeUris : action.payload.nft_stakeUris, 
                [SPINNERSHOW]:false,
                [IS_ADMIN] : action.payload.is_admin,
                [ADMIN_INFO] : action.payload.admin_info,
                [ADMIN_HARVEST_HISTORY] : action.payload.adminHarvestHistory,
                [ADMIN_STAKE_HISTORY] : action.payload.adminStakeHistory,    
                [ADMIN_IS_RUNNING] : action.payload.adminIsRunning,
                [ALL_STAKES] : action.payload.allStakes,
                [ADMIN_TOTAL_SUPPLY] : action.payload.adminTotalSupply,
                [ADMIN_STAKING_DAYS] : action.payload.adminStakingDays,
                [FEE_ADDRESS] : action.payload.adminFeeAddress,
                [HARVEST_FEE] : action.payload.adminHarvestFee,
            });            
        case NFT_DISCONNECT:
            return({
            ...state,
            [IS_NFT_CONNECTED]:false
            })
        case SPINNERSHOW:
        return({
        ...state,
        [SPINNERSHOW]:action.payload.show,
        [SPINNERTEXT]:action.payload.spinnertext
        })
        case NFT_UPDATEREWARD:
        return({
        ...state,
        [NFT_REWARD]:action.payload.reward,
        [REWARDPERSEC] :action.payload.rewardPerSec
        })                
        case NFT_PREVPOOLINFO:
            return ({
                ...state,
                [PREV_NFT_REWARDS]: action.payload.prevNFTRewards,
                [PREV_NFT_BALANCE_STAKE]: action.payload.prevNFTBalanceStake,
            });
        case NFT_HISTORY:
            return ({
                ...state,
                [NFT_HARVESTHISTORY]: action.payload.harvestHistory,
                [NFT_STAKEHISTORY]: action.payload.stakeHistory,
                moreState: action.payload.moreState,
                curShowCnt: action.payload.curShowCnt
            });
        default:          
            return state;
    }
    
}