import BigNumber from "bignumber.js";

export const NFT_ADDRESS = "nft_address";

//mainnet address for GHSP token
export const MAIN_GHSP_ADDRESS = "0x4a0Cc0876EC16428A4Fa4a7C4c300dE2DB73b75b";

//main address for GHSP
export const MAIN_STAKE_ADDRESS = "0x55b0089eCc1895F3a8cd4574BB98b451Fd898893";

export const MAIN_STAKE_ADDRESS_V0 = "0x46B04B817C5fe596077481291D72Bc63F2608b3F";

//test address for GHSP token
export const TEST_GHSP_ADDRESS = "0xdb639D33BEa7fEA1Aca20EE1F13d1293964e7de8";

//test address for GHSP
export const TEST_STAKE_ADDRESS = "0xE6903a9e6A547EBED56D7Ba5FB3Fe85F3468d417";

export const TEST_STAKE_ADDRESS_V0 = "0x7517681C2faF2CEf050a5228a01145c262F9E25a";

export const MAIN_GHOSPER_ADDRESS = "0xC68DAa7b9629eA28452B85C3f3dAA4E905F2F01D";

//mainnet address for NFT
export const MAIN_GHOSPER_STAKE_ADDRESS_V1 = "0x179574E7113Ef74f93d244Cb4A6b2cdaAe49B8B7";
export const MAIN_GHOSPER_STAKE_ADDRESS = "0x963b460f2A3ba15563182CbFd1240F846C56eD49";

export const TEST_GHOSPER_ADDRESS = "0x89bB06cd140bcc1EBA4095eaa286Eaa0f9F60E33";

// TESTnet address for NFT
export const TEST_GHOSPER_STAKE_ADDRESS_V1 = "0x00F6811d71e22133F5Cd29125d438ef4aD41Ee46";
export const TEST_GHOSPER_STAKE_ADDRESS = "0x850bCB3d0d57C36A4E1E144b464fE197C10C1E04";


export const WEB3 = "web3";
export const WALLET_ADDRESS = "wallet_address";
export const NFT_BALANCE = "nft_balance";
export const GHSP_BALANCE = "ghsp_balance";

export const IS_NFT_CONNECTED = "is_nft_connected";
export const IS_GHSP_CONNECTED = "is_ghsp_connected";
export const IS_ADMIN = "is_admin";

export const BINANCE_TEST = "https://data-seed-prebsc-1-s1.binance.org:8545/";
export const BINANCE_MAIN = "https://bsc-dataseed.binance.org/";

export const TEST_CHAINID = "0x61";
export const MAIN_CHAINID = "0x38";

export const TEST_ETHCHAINID = "0x4";
export const MAIN_ETHCHAINID = "0x1";

export const ETHEREUM_TEST = "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
export const ETHEREUM_MAIN = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

export const OPENSEA_TEST = "https://testnets-api.opensea.io/api/v1/";
export const OPENSEA_MAIN = "https://api.opensea.io/api/v1/";

export const OPENSEA_LINKTEST = "https://testnets.opensea.io/assets/";
export const OPENSEA_LINKMAIN = "https://opensea.io/assets/";

export const GHSP_REWARD = "ghsp_reward";
export const GHSP_HARVESTHISTORY = "ghsp_harvesthistory";
export const GHSP_STAKEHISTORY = "ghsp_stakehistory";

export const NFT_REWARD = "nft_reward";
export const NFT_HARVESTHISTORY = "nft_harvesthistory";
export const NFT_STAKEHISTORY = "nft_stakehistory";

export const WEB3APIKEY = "dQHuqyi1lC78Lz6UodHRsl1KR9ZgvDK0lawdYIqwGoe5rM4okuCn2OVXVxj2oiux";

export const STAKE_BALANCE = "stake_balance";
export const DECIMAL = 18;
export const REWARDPERSEC = "rewardPerSec";
export const SPINNERSHOW = "spinnershow";
export const SPINNERTEXT = "spinnertext";

export const ADMIN_DEPOSIT = "admin_deposit";
export const ADMIN_WITHDRAWL = "admin_withdrawl";

export const ADMIN_INFO = "admin_info";
export const ADMIN_HARVEST_HISTORY = "admin_harvest_history";
export const ADMIN_STAKE_HISTORY = "admin_stake_history";  
export const ADMIN_IS_RUNNING = "admin_is_running";
export const ADMIN_TOTAL_SUPPLY = "admin_total_supply";
export const ADMIN_STAKING_DAYS = "admin_staking_days";


export const FEE_ADDRESS = "fee_address";
export const HARVEST_FEE = "harvest_fee";
export const UNSTAKE_FEE1 = "unstake_fee1";
export const UNSTAKE_FEE2 = "unstake_fee2";
export const UNSTAKE_FEE3 = "unstake_fee3";
export const UNSTAKE_FEE4 = "unstake_fee4";
export const UNSTAKE_FEE5 = "unstake_fee5";

export const PREV_STAKES = "prev_stakes";
export const PREV_REWARDS = "prev_rewards";

export const PREV_NFT_STAKES = "prev_nft_stakes";
export const PREV_NFT_REWARDS = "prev_nft_rewards";
export const PREV_NFT_BALANCE_STAKE = "prev_nft_balance_stake";

export const ALL_STAKES = "all_stakes";

export function toWEI(number){
    return BigNumber(number).shiftedBy(DECIMAL);
}

export function fromWEI(number){
    return BigNumber(number).shiftedBy(-1 * DECIMAL).toNumber();
}

export const moralisTestnetServerURL = "https://takung4uptwj.usemoralis.com:2053/server";

export const moralisTestnetAppID = "GDzXtDwZP5OvWp3QehB2VUdLqr5JpQ2UywEjZ34v";

export const moralisMainnetServerURL = "https://yt8ws6xnmxfc.usemoralis.com:2053/server";

export const moralisMainnetAppID = "h0yDqBdScabYLhvwihcrZsv0hXaTYUImod15LWNk";

export const mainStartBlockNumber = "15971974";

export const testStartBlockNumber = "17448053";

export const mainNFTStartBlockNumber = "16964618";

export const testNFTStartBlockNumber = "18464795";