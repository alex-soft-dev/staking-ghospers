import {
    GHSP_CONNECT,
    // NFT_CONNECT,
    GHSP_DISCONNECT,
    GHSP_PREVPOOLINFO,
    GHSP_UPDATEREWARD,
    GHSP_HISTORY
} from '../actions/actionType';

import {
    IS_NFT_CONNECTED,
    IS_GHSP_CONNECTED, 
    WEB3,
    WALLET_ADDRESS,
    GHSP_BALANCE,
    GHSP_REWARD,
    GHSP_HARVESTHISTORY,
    GHSP_STAKEHISTORY,
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
    UNSTAKE_FEE1,
    UNSTAKE_FEE5,
    UNSTAKE_FEE4,
    UNSTAKE_FEE3,
    UNSTAKE_FEE2,
    ADMIN_STAKING_DAYS,
    ADMIN_TOTAL_SUPPLY,
    PREV_STAKES,
    PREV_REWARDS
} from '../constants';

const initialState = {
    [IS_GHSP_CONNECTED] : false,
    [IS_NFT_CONNECTED] : false,
    [WEB3]: null,
    [WALLET_ADDRESS] : "0x0000000000000000000000000000000000000000",
    [GHSP_HARVESTHISTORY] : {"0":[], "1":[], "2":[]},
    [GHSP_STAKEHISTORY] : {"0":[], "1":[], "2":[]},   
    [STAKE_BALANCE] : 0,
    [REWARDPERSEC] : 0,
    [GHSP_REWARD] : 0,
    [GHSP_BALANCE] : 0,
    [SPINNERSHOW] : false,
    [IS_ADMIN] : false,   
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
    [UNSTAKE_FEE1] : 0,
    [UNSTAKE_FEE2] : 0,
    [UNSTAKE_FEE3] : 0,
    [UNSTAKE_FEE4] : 0,
    [UNSTAKE_FEE5] : 0,
    [PREV_STAKES] : 0,
    [PREV_REWARDS] : 0,
    moreState: false,
    curShowCnt: 0,
}

export default function walletReducer(state = initialState, action) {
    // The reducer normally looks at the action type field to decide what happens
    switch (action.type) {
        case GHSP_CONNECT:
            return({
                ...state,
                [IS_GHSP_CONNECTED]:true,
                [WEB3]: action.payload.web3,
                [WALLET_ADDRESS]: action.payload.address,
                [GHSP_BALANCE]: action.payload.balance,
                [GHSP_REWARD]: action.payload.reward,
                // [GHSP_HARVESTHISTORY]: action.payload.harvestHistory,
                // [GHSP_STAKEHISTORY]: action.payload.stakeHistory,
                [STAKE_BALANCE]: action.payload.stakeBalance,
                [REWARDPERSEC]: action.payload.rewardPerSec,
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
                [UNSTAKE_FEE1] : action.payload.adminUnstakeFee1,
                [UNSTAKE_FEE2] : action.payload.adminUnstakeFee2,
                [UNSTAKE_FEE3] : action.payload.adminUnstakeFee3,
                [UNSTAKE_FEE4] : action.payload.adminUnstakeFee4,
                [UNSTAKE_FEE5] : action.payload.adminUnstakeFee5,
                filterTransactions: action.payload.filterTransactions
            });
        case GHSP_DISCONNECT:
            return({
            ...state,
            [WEB3]: null,
            [IS_GHSP_CONNECTED]:false
            })
        case SPINNERSHOW:
        return({
        ...state,
        [SPINNERSHOW]:action.payload.show,
        [SPINNERTEXT]:action.payload.spinnertext
        })
        case GHSP_UPDATEREWARD:
        return({
        ...state,
        [GHSP_REWARD]:action.payload.reward,
        [REWARDPERSEC] :action.payload.rewardPerSec
        })
        case GHSP_PREVPOOLINFO:
            return ({
                ...state,
                [PREV_STAKES]: action.payload.prevStakes,
                [PREV_REWARDS]: action.payload.prevRewards
            });
        case GHSP_HISTORY:
            return ({
                ...state,
                [GHSP_HARVESTHISTORY]: action.payload.harvestHistory,
                [GHSP_STAKEHISTORY]: action.payload.stakeHistory,
                moreState: action.payload.moreState,
                curShowCnt: action.payload.curShowCnt
            });
        default:          
            return state;
    }
    
}