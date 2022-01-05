import {
  GHSP_CONNECT,
  NFT_CONNECT,
  NFT_UPDATEREWARD,
  GHSP_DISCONNECT,
  NFT_DISCONNECT,
  GHSP_UPDATEREWARD,
  GHSP_PREVPOOLINFO,
  NFT_PREVPOOLINFO,
  NFT_HISTORY,
  GHSP_HISTORY
} from "./actionType";

import ghspABI from "../../ABI/ghsp.json";
import stakeABI from "../../ABI/stake.json";
import stakeV0ABI from "../../ABI/stakeV0.json";
import ghosperABI from "../../ABI/ghosperNFT.json";
import stakeNFTV1ABI from "../../ABI/stakeNFTV1.json";
import stakeNFTABI from "../../ABI/stakeNFT.json";
import Moralis from 'moralis';

import {
  MAIN_GHSP_ADDRESS,
  TEST_GHSP_ADDRESS,
  MAIN_STAKE_ADDRESS,
  TEST_STAKE_ADDRESS,
  BINANCE_TEST,
  BINANCE_MAIN,
  SPINNERSHOW,
  MAIN_CHAINID,
  toWEI,
  fromWEI,
  TEST_CHAINID,
  MAIN_GHOSPER_ADDRESS,
  TEST_GHOSPER_ADDRESS,
  MAIN_GHOSPER_STAKE_ADDRESS_V1,
  TEST_GHOSPER_STAKE_ADDRESS_V1,
  moralisMainnetServerURL,
  moralisTestnetServerURL,
  moralisMainnetAppID,
  moralisTestnetAppID,
  mainStartBlockNumber,
  testStartBlockNumber,
  mainNFTStartBlockNumber,
  testNFTStartBlockNumber,
  TEST_STAKE_ADDRESS_V0,
  MAIN_STAKE_ADDRESS_V0,
  TEST_GHOSPER_STAKE_ADDRESS,
  MAIN_GHOSPER_STAKE_ADDRESS
} from "../constants";

import Web3 from "web3";


import { PRODUCT_MODE } from "../../config";

let BINANCE_NET = PRODUCT_MODE ? BINANCE_MAIN : BINANCE_TEST;
let CHAINID = PRODUCT_MODE ? MAIN_CHAINID : TEST_CHAINID;
let GHSP_ADDRESS = PRODUCT_MODE ? MAIN_GHSP_ADDRESS : TEST_GHSP_ADDRESS;
let STAKE_ADDRESS = PRODUCT_MODE ? MAIN_STAKE_ADDRESS : TEST_STAKE_ADDRESS;

let GHOSPER_ADDRESS = PRODUCT_MODE ? MAIN_GHOSPER_ADDRESS : TEST_GHOSPER_ADDRESS;
let NFTSTAKE_ADDRESS_V1 = PRODUCT_MODE ? MAIN_GHOSPER_STAKE_ADDRESS_V1 : TEST_GHOSPER_STAKE_ADDRESS_V1;
let NFTSTAKE_ADDRESS = PRODUCT_MODE ? MAIN_GHOSPER_STAKE_ADDRESS : TEST_GHOSPER_STAKE_ADDRESS;
const STAKING_ADDRESS_V0 = PRODUCT_MODE ? MAIN_STAKE_ADDRESS_V0 : TEST_STAKE_ADDRESS_V0;
const serverUrl = PRODUCT_MODE ? moralisMainnetServerURL : moralisTestnetServerURL;

const appId = PRODUCT_MODE ? moralisMainnetAppID : moralisTestnetAppID;

const startBlockNumber = PRODUCT_MODE ? mainStartBlockNumber : testStartBlockNumber;

const startNFTBlockNumber = PRODUCT_MODE ? mainNFTStartBlockNumber : testNFTStartBlockNumber;

const moralisChain = PRODUCT_MODE ? "bsc" : "bsc testnet";

export function ghsp_connect() {
  // is metamask connected and get the wallet address

  return async (dispatch) => {

    if(window.ethereum === undefined || !window.ethereum.isMetaMask) {
      dispatch(ghsp_disconnect());
      dispatch(spinner_show(true, "Please install metamask..."));
      return false;
    }
    let web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log("User denied account access");
        return false;
      }
    } else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    } else {
      
      web3Provider = new Web3.providers.HttpProvider(BINANCE_NET);
    }    
    const web3 = new Web3(web3Provider);

    try {      
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAINID }],
      });
    } catch (switchError) {
        dispatch(ghsp_disconnect());
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: CHAINID, rpcUrl: BINANCE_NET /* ... */ }],
          });
        } catch (addError) {
          dispatch(ghsp_disconnect());
        }
      }
      return false;
    }

    let account;
    let is_admin = false;
    let is_connected = false;    
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
      }
      is_connected = true;
      return accounts[0];
    });
    const ghspToken = new web3.eth.Contract(ghspABI, GHSP_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    if (is_connected) {
      dispatch(spinner_show(true, "Updating Data..."));
    } else {
      dispatch(spinner_show(true, "Connecting Wallet..."));
    }   
    
    let owner_address = await stakeToken.methods
      .owner()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        return res;
      });
    // if (account == owner_address) {
    //   is_admin = true;
    // }
    let balance = await ghspToken.methods
      .balanceOf(account)
      .call(function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });

    let userInfo = await stakeToken.methods
    .userInfo(account)
    .call({ from: account }, function (err, res) {
        if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show(false));
            return;
        }
        return res;
    });
    
    let reward = await stakeToken.methods
      .getPending(account)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });

    let stakeBalance = userInfo.amount;
    stakeBalance = fromWEI(stakeBalance);
    
    // Moralis.start({ serverUrl, appId });
    // const act1 = account;
    // const options = { chain: moralisChain, address: act1, order: "desc", from_block: startBlockNumber};
    // const transactions = await Moralis.Web3API.account.getTransactions(options);
    
    // let lenTran = transactions.result.length;
    
    let filterTransactions = []
    // for(let j = 0; j < lenTran; j++) {
    //     if(transactions.result[j].to_address === STAKE_ADDRESS.toLowerCase()) {
    //         filterTransactions.push(transactions.result[j]);
    //         // console.log(transactions.result[j].block_number);
    //     }
    // }

    // await dispatch(getHistory(web3, account, [], [], filterTransactions, 0));

    let allStakes = await stakeToken.methods
      .totalStakedAmount()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });
    allStakes = fromWEI(allStakes);
    
    let rewardPerSec = await stakeToken.methods
      .rewardPerBlock()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });    
    rewardPerSec = fromWEI(rewardPerSec);

    let admin_info = null;
    let adminHarvestHistory = null;
    let adminStakeHistory = null;
    let adminIsRunning = true;
    let adminTotalSupply = 0;
    let adminStakingDays = 0;
    let adminFeeAddress = null;
    let adminHarvestFee = 0;
    let adminUnstakeFee1 = 0;
    let adminUnstakeFee2 = 0;
    let adminUnstakeFee3 = 0;
    let adminUnstakeFee4 = 0;
    let adminUnstakeFee5 = 0;

    if (is_admin) {
      admin_info = await stakeToken.methods
        .adminTotalRewardAndHarvest()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }

          // console.log(res);
          return res;
        });

      adminHarvestHistory = await stakeToken.methods
        .adminAllHistoriesOfHarvest()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminStakeHistory = await stakeToken.methods
        .adminAllHistoriesOfStakes()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });
      adminStakeHistory = await stakeToken.methods
        .adminAllHistoriesOfStakes()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminIsRunning = await stakeToken.methods
        .isRunning()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminFeeAddress = await stakeToken.methods
        .feeAddress()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminHarvestFee = await stakeToken.methods
        .harvestFee()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      // console.log("Harvest Fee: " + adminHarvestFee);

      adminUnstakeFee2 = await stakeToken.methods
        .unstakeFee2()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });
      adminUnstakeFee3 = await stakeToken.methods
        .unstakeFee3()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });
      adminUnstakeFee4 = await stakeToken.methods
        .unstakeFee4()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });
      adminUnstakeFee5 = await stakeToken.methods
        .unstakeFee5()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });
    }

    dispatch(getPreviousPoolInfo(web3, account));

    // adminTotalSupply = await stakeToken.methods
    //   .totalSupply()
    //   .call({ from: account }, function (err, res) {
    //     if (err) {
    //       console.log("An error occured", err);
    //       dispatch(spinner_show());
    //       return;
    //     }
    //     return res;
    //   });

    //console.log("adminTotalSupply------------------" + adminTotalSupply);
    // adminStakingDays = await stakeToken.methods
    //   .totalStakingPeriodDays()
    //   .call({ from: account }, function (err, res) {
    //     if (err) {
    //       console.log("An error occured", err);
    //       dispatch(spinner_show());
    //       return;
    //     }
    //     return res;
    //   });      
    //console.log(balance, reward, stakeBalance, harvestHistory, stakeHistory);    
    dispatch({
      type: GHSP_CONNECT,
      payload: {
        web3: web3,
        address: account,
        reward: fromWEI(reward),
        balance: fromWEI(balance),
        // harvestHistory: harvestHistory,
        // stakeHistory: stakeHistory,
        filterTransactions: filterTransactions,
        stakeBalance: stakeBalance,
        rewardPerSec: rewardPerSec,
        is_admin: is_admin,
        spinnershow: false,
        admin_info: admin_info,
        allStakes: allStakes,
        adminTotalSupply: fromWEI(adminTotalSupply),
        adminStakingDays: adminStakingDays,
        adminHarvestHistory: adminHarvestHistory,
        adminStakeHistory: adminStakeHistory,
        adminIsRunning: adminIsRunning,
        adminFeeAddress: adminFeeAddress,
        adminHarvestFee: adminHarvestFee,
        adminUnstakeFee1: adminUnstakeFee1,
        adminUnstakeFee2: adminUnstakeFee2,
        adminUnstakeFee3: adminUnstakeFee3,
        adminUnstakeFee4: adminUnstakeFee4,
        adminUnstakeFee5: adminUnstakeFee5,
      },
    });
  };
}

export function ghsp_disconnect() {
  return (dispatch) => {
    dispatch({
      type: GHSP_DISCONNECT,
    });
  };
}

export function spinner_show(show = false, spinnertext = "") {
  return (dispatch) => {
    dispatch({
      type: SPINNERSHOW,
      payload: {
        show: show,
        spinnertext: spinnertext,
      },
    });
  };
}

export function ghsp_stake(web3, account, amount = 0) {
  return async (dispatch) => {
    const ghspToken = new web3.eth.Contract(ghspABI, GHSP_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = toWEI(amount);
    dispatch(spinner_show(true, "Requesting Approval..."));
    await ghspToken.methods
      .approve(STAKE_ADDRESS, amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Approval..."));
        return res;
      });

    dispatch(spinner_show(true, "Requesting Stake..."));
    await stakeToken.methods
      .stake(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      })
      .then((res)=>{
        let eventData = res.events.Stake;
        if(eventData !== undefined || eventData !== null) {
          dispatch(ghsp_connect());
        }
        console.log("Stake Event--------------------", res);
      });
  };
}

export function admin_deposit(amount = 0) {
  return async (dispatch) => {
    console.log(amount);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(amount);

    const ghspToken = new web3.eth.Contract(ghspABI, GHSP_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = toWEI(amount);
    dispatch(spinner_show(true, "Requesting Approval..."));
    let approve = await ghspToken.methods
      .approve(STAKE_ADDRESS, amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Approval..."));
        return res;
      });
    console.log(approve);
    dispatch(spinner_show(true, "Requesting Deposit..."));
    let deposit = await stakeToken.methods
      .adminDepositReward(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminDeposit();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(deposit);
  };
}

export function admin_withdraw(amount = 0) {
  return async (dispatch) => {
    console.log(amount);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(amount);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = toWEI(amount);
    dispatch(spinner_show(true, "Requesting Withdraw..."));
    let withdraw = await stakeToken.methods
      .adminWithdrawReward(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminWithdraw();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(withdraw);
  };
}

export function setIsRunning(isRunning = true) {
  return async (dispatch) => {
    console.log(isRunning);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(isRunning);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    dispatch(spinner_show(true, "Requesting Set Status..."));
    let newIsRunning = await stakeToken.methods
      .adminSetRunning(isRunning)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedRunning();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(newIsRunning);
  };
}

export function admin_updateFeeAddr(feeAddress) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    dispatch(spinner_show(true, "Requesting Update Fee Address..."));
    let newFeeAddress = await stakeToken.methods
      .adminUpdateFeeAddress(feeAddress)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedFeeAddress();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(newFeeAddress);
  };
}

export function admin_updateHarvestFee(amount) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = Number(amount);
    console.log(amountVal);

    dispatch(spinner_show(true, "Requesting Update Harvest Fee..."));
    let newHarvestFee = await stakeToken.methods
      .adminUpdateHarvestFee(amountVal)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedHarvestFee();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(newHarvestFee);
  };
}

export function admin_updateUnstakeFee(id, amount) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = Number(amount);

    dispatch(spinner_show(true, "Requesting Update Unstake Fee..."));
    let newHarvestFee = await stakeToken.methods["adminUpdateUnstakeFee" + id](
      amountVal
    ).send({ from: account }, function (err, res) {
      if (err) {
        console.log("An error occured", err);
        dispatch(spinner_show());
        return;
      }
      dispatch(spinner_show(true, "Processing Transaction..."));
      return res;
    });

    var stakeTokenEvent = stakeToken.events["AdminUpdatedUnstakeFee" + id]();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(newHarvestFee);
  };
}

export function adminUpdateAPY(amount = 0, period = 0) {
  console.log(amount, "----------------------------", period);

  return async (dispatch) => {
    console.log(amount);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(amount);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = toWEI(amount);

    dispatch(spinner_show(true, "Requesting Update APY..."));
    let apy = await stakeToken.methods
      .adminUpdateAPY(amountVal.toString(10), period)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedAPY();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(ghsp_connect());
      },
      (error) => {}
    );

    console.log(apy);
  };
}

export function ghsp_unstake(web3, account, amount = 0) {
  return async (dispatch) => {
    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let amountVal = toWEI(amount);

    dispatch(spinner_show(true, "Requesting Unstake..."));

    await stakeToken.methods
      .unStake(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      })
      .then((res)=>{
        let eventData = res.events.UnStake;
        if(eventData !== undefined || eventData !== null) {
          dispatch(ghsp_connect());
        }
      });
  };
}

export function ghsp_harvest(web3, account, restake=false) {
  return async (dispatch) => {
    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);
    dispatch(spinner_show(true, "Requesting "+(restake ? "Restake" : "Harvest")+"..."));

    await stakeToken.methods
      .harvest(restake)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      })
      .then((res) => {
        let eventData = restake ? res.events.ReStake : res.events.Harvest;
        if(eventData !== undefined) {
          dispatch(ghsp_connect());
        }
        ghsp_connect();
      });
  };
}

export function ghsp_updateReward() {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        return false;
      }
      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    let reward = await stakeToken.methods
      .getPending(account)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);

          return;
        }
        return res;
      });
    let rewardPerSec = await stakeToken.methods
      .rewardPerBlock()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });    
    rewardPerSec = fromWEI(rewardPerSec);

    let userInfo = await stakeToken.methods
    .userInfo(account)
    .call({ from: account }, function (err, res) {
        if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show(false));
            return;
        }
        return res;
    });

    let allStakes = await stakeToken.methods
      .totalStakedAmount()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });

    allStakes = fromWEI(allStakes);
    let stakeBalance = userInfo.amount;
    stakeBalance = fromWEI(stakeBalance);

    dispatch({
      type: GHSP_UPDATEREWARD,
      payload: {
        reward: fromWEI(reward),
        rewardPerSec: rewardPerSec,
      },
    });
  };
}

export function nft_connect() {
  return async (dispatch) => {

    if(window.ethereum === undefined || !window.ethereum.isMetaMask) {
      dispatch(ghsp_disconnect());
      dispatch(spinner_show(true, "Please install metamask..."));
      return false;
    }
    let web3Provider;
    if (window.ethereum) {
      web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log("User denied account access");
        return false;
      }
    } else if (window.web3) {
      web3Provider = window.web3.currentProvider;
    } else {
      
      web3Provider = new Web3.providers.HttpProvider(BINANCE_NET);
    }
    const web3 = new Web3(web3Provider);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: CHAINID }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: CHAINID, rpcUrl: BINANCE_NET /* ... */ }],
          });
        } catch (addError) {
          dispatch(nft_disconnect());
        }
      }
      else {
        dispatch(nft_disconnect());
      }
    }

    let account;
    let is_admin = false;
    let is_connected = false;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(nft_disconnect());        
      }
      is_connected = true;
      return accounts[0];
    });

    const ghosperToken = new web3.eth.Contract(ghosperABI, GHOSPER_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);
    
    const wghosperToken = new web3.eth.Contract(ghspABI, GHSP_ADDRESS);

    if (is_connected) {
      dispatch(spinner_show(true, "Updating Data..."));
    } else {
      dispatch(spinner_show(true, "Connecting Wallet..."));
    }

    let owner_address = await stakeToken.methods
      .owner()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        return res;
      });
    is_admin = false;
    // if (account === owner_address) {
    //   is_admin = true;
    // }
    let balance = await ghosperToken.methods
      .balanceOf(account)
      .call(function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }        
        return res;
        
      });

      let nft_balanceIds = [];
      let nft_balanceUris = [];

      if (balance > 0) {
        for(let i=0; i<balance; i++) {
          let info = await get_nftId(account, i);
          nft_balanceIds.push(info.id);
          nft_balanceUris.push(info.uri);
        }
      }

      let Wbalance = await wghosperToken.methods
      .balanceOf(account)
      .call(function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        // console.log('--------------', res);
        return res;
        
      });

      let userInfo = await stakeToken.methods
      .userInfo(account)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
        
      });
      
      let countOfStakes = userInfo.amount;
      let balanceOfStakes = [];
      for(let i = 0; i < countOfStakes; i++) {
        let tokenId = await stakeToken.methods
          .ownedTokens(account, i)
          .call({ from: account }, function (err, res) {
            if (err) {
              console.log("An error occured", err);
              dispatch(spinner_show());
              return;
            }
            return res;
          });
        
          balanceOfStakes.push(tokenId);
      }

      let nft_stakeUris = [];
      
      if (balanceOfStakes.length > 0) {
        for(let i=0; i<balanceOfStakes.length; i++) {
          let uri = await get_nftURI(account, balanceOfStakes[i]);
          nft_stakeUris.push(uri);
        }
      }

    let reward = await stakeToken.methods
      .getPending(account)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });

    let stakeBalance = userInfo.amount;
    stakeBalance = fromWEI(reward);
    

    // to get stake nft image url

    // to get unstake nft image url
    // Moralis.start({ serverUrl, appId });
    // const options = { chain: moralisChain, address: account, order: "desc", from_block: startNFTBlockNumber};
    // const transactions = await Moralis.Web3API.account.getTransactions(options);
    
    // let lenTran = transactions.result.length;
    
    let filterTransactions = []
    // for(let j = 0; j < lenTran; j++) {
    //     if(transactions.result[j].to_address === NFTSTAKE_ADDRESS_V1.toLowerCase()) {
    //         filterTransactions.push(transactions.result[j]);
    //     }
    // }

    // await dispatch(getNFTHistory(web3, account, [], [], filterTransactions, 0));

    let allStakes = await stakeToken.methods
      .totalStakedAmount()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });

    let rewardPerSec = await stakeToken.methods
      .rewardPerBlock()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        return res;
      });      

    let admin_info = null;
    let adminHarvestHistory = null;
    let adminStakeHistory = null;
    let adminIsRunning = true;
    let adminTotalSupply = 0;
    let adminStakingDays = 0;
    let adminFeeAddress = null;
    let adminHarvestFee = 0;    

    if (is_admin) {
      admin_info = await stakeToken.methods
        .adminTotalRewardAndHarvest()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }

          return res;
        });

      adminHarvestHistory = await stakeToken.methods
        .adminAllHistoriesOfHarvest()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminStakeHistory = await stakeToken.methods
        .adminAllHistoriesOfStakes()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });
      adminStakeHistory = await stakeToken.methods
        .adminAllHistoriesOfStakes()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminIsRunning = await stakeToken.methods
        .isRunning()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminFeeAddress = await stakeToken.methods
        .feeAddress()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      adminHarvestFee = await stakeToken.methods
        .harvestFee()
        .call({ from: owner_address }, function (err, res) {
          if (err) {
            console.log("An error occured", err);
            dispatch(spinner_show());
            return;
          }
          return res;
        });

      // console.log("Harvest Fee: " + adminHarvestFee);
      
    }
    // adminTotalSupply = await stakeToken.methods
    //   .totalSupply()
    //   .call({ from: account }, function (err, res) {
    //     if (err) {
    //       console.log("An error occured", err);
    //       dispatch(spinner_show());
    //       return;
    //     }
    //     return res;
    //   });

    // //console.log("adminTotalSupply------------------" + adminTotalSupply);
    // adminStakingDays = await stakeToken.methods
    //   .totalStakingPeriodDays()
    //   .call({ from: account }, function (err, res) {
    //     if (err) {
    //       console.log("An error occured", err);
    //       dispatch(spinner_show());
    //       return;
    //     }
    //     return res;
    //   });
      dispatch(getPreviousPoolInfoNFT(web3, account));
      dispatch(spinner_show());
    dispatch({
      type: NFT_CONNECT,
      payload: {
        address: account,
        reward: fromWEI(reward),
        balance: balance,
        // harvestHistory: harvestHistory,
        // stakeHistory: stakeHistory,
        filterTransactions: filterTransactions,
        stakeBalance: stakeBalance,
        rewardPerSec: fromWEI(rewardPerSec),
        balanceofstakes : balanceOfStakes,
        Wbalance : fromWEI(Wbalance),
        is_admin: is_admin,
        spinnershow: false,
        admin_info: admin_info,
        allStakes: allStakes,
        adminTotalSupply: fromWEI(adminTotalSupply),
        adminStakingDays: adminStakingDays,
        adminHarvestHistory: adminHarvestHistory,
        adminStakeHistory: adminStakeHistory,
        adminIsRunning: adminIsRunning,
        adminFeeAddress: adminFeeAddress,
        adminHarvestFee: adminHarvestFee,
        nft_balanceURIs : nft_balanceUris,
        nft_balanceIds : nft_balanceIds,
        nft_stakeUris : nft_stakeUris
      },
    });
  };
}

export function nft_disconnect() {
  return (dispatch) => {
    dispatch({
      type: NFT_DISCONNECT,
    });
    // dispatch(spinner_show());
  };
}

export function nft_updateReward() {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        return false;
      }
      return accounts[0];
    });    

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);   

    let reward = await stakeToken.methods
      .getPending(account)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);

          return;
        }
        return res;
      });
    let rewardPerSec = await stakeToken.methods
      .rewardPerBlock()
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          return;
        }
        return res;
      });
    dispatch({
      type: NFT_UPDATEREWARD,
      payload: {
        reward: fromWEI(reward),
        rewardPerSec: fromWEI(rewardPerSec),
      },
    });
  };
}

export function ghosper_harvest() {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }
      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    dispatch(spinner_show(true, "Requesting Harvest..."));

    await stakeToken.methods
      .harvest()
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      })
      .then(() => {
        nft_connect();
      });

    var stakeTokenEvent = stakeToken.events.Harvest();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );
  };
}

export function nftadmin_deposit(amount = 0) {
  return async (dispatch) => {
    console.log(amount);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(amount);

    const wghopserToken = new web3.eth.Contract(ghspABI, GHSP_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);    

    let amountVal = toWEI(amount);
    dispatch(spinner_show(true, "Requesting Approval..."));
    let approve = await wghopserToken.methods
      .approve(NFTSTAKE_ADDRESS_V1, amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Approval..."));
        return res;
      });
    console.log(approve);
    dispatch(spinner_show(true, "Requesting Deposit..."));
    let deposit = await stakeToken.methods
      .adminDepositReward(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminDeposit();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );

    console.log(deposit);
  };
}

export function nftadmin_withdraw(amount = 0) {
  return async (dispatch) => {
    console.log(amount);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(amount);

        const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    let amountVal = toWEI(amount);
    dispatch(spinner_show(true, "Requesting Withdraw..."));
    let withdraw = await stakeToken.methods
      .adminWithdrawReward(amountVal.toString(10))
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminWithdraw();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );

    console.log(withdraw);
  };
}

export function nftsetIsRunning(isRunning = true) {
  return async (dispatch) => {
    console.log(isRunning);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(isRunning);

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    dispatch(spinner_show(true, "Requesting Set Status..."));
    let newIsRunning = await stakeToken.methods
      .adminSetRunning(isRunning)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedRunning();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );

    console.log(newIsRunning);
  };
}

export function nftadmin_updateFeeAddr(feeAddress) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    dispatch(spinner_show(true, "Requesting Update Fee Address..."));
    let newFeeAddress = await stakeToken.methods
      .adminUpdateFeeAddress(feeAddress)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedFeeAddress();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );

    console.log(newFeeAddress);
  };
}

export function nftadmin_updateHarvestFee(amount) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    let amountVal = Number(amount);
    console.log(amountVal);

    dispatch(spinner_show(true, "Requesting Update Harvest Fee..."));
    let newHarvestFee = await stakeToken.methods
      .adminUpdateHarvestFee(amountVal)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedHarvestFee();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );

    console.log(newHarvestFee);
  };
}

export function nftadminUpdateAPY(amount = 0, period = 0) {
  console.log(amount, "----------------------------", period);

  return async (dispatch) => {
    console.log(amount);
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });
    console.log(amount);    

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    let amountVal = toWEI(amount);

    dispatch(spinner_show(true, "Requesting Update APY..."));
    let apy = await stakeToken.methods
      .adminUpdateAPY(amountVal.toString(10), period)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      });

    var stakeTokenEvent = stakeToken.events.AdminUpdatedAPY();

    let event = await stakeTokenEvent.on({}, function (error, result) {
      if (!error) {
        return result;
      } else {
        dispatch(spinner_show());
      }
    });
    new Promise(function (resolve, reject) {
      if (event) {
        resolve("success");
      } else {
        reject("error");
      }
    }).then(
      (success) => {
        dispatch(nft_connect());
      },
      (error) => {}
    );

    console.log(apy);
  };
}

export function nft_stake(amount = 0) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const nftToken = new web3.eth.Contract(ghosperABI, GHOSPER_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);
    
    dispatch(spinner_show(true, "Requesting Approval..."));
    await nftToken.methods
      .setApprovalForAll(NFTSTAKE_ADDRESS_V1, true)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Approval..."));
        return res;
      });

    dispatch(spinner_show(true, "Requesting Stake..."));
    await stakeToken.methods
      .stake(amount)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      })
      .then((res) => {
        let eventData = res.events.Staked;
        if(eventData !== undefined || eventData !== null) {
          dispatch(nft_connect());
        }
        ghsp_connect();
      });
  };
}

export function nft_unstake(amount = []) {
  return async (dispatch) => {
    let web3Provider;
    web3Provider = window.web3.currentProvider;
    const web3 = new Web3(web3Provider);
    let account;
    [account] = await web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        dispatch(spinner_show());
        return false;
      }

      return accounts[0];
    });

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    dispatch(spinner_show(true, "Requesting Unstake..."));
    await stakeToken.methods
      .unstake(amount)
      .send({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);
          dispatch(spinner_show());
          return;
        }
        dispatch(spinner_show(true, "Processing Transaction..."));
        return res;
      })
      .then((res) => {
        let eventData = res.events.UnStaked;
        if(eventData !== undefined || eventData !== null) {
          dispatch(nft_connect());
        }
      });
  };
}

async function get_nftId(account, index) {
  let web3Provider;
  web3Provider = window.web3.currentProvider;
  const web3 = new Web3(web3Provider);   

  const nftToken = new web3.eth.Contract(ghosperABI, GHOSPER_ADDRESS);

  let id = await nftToken.methods
      .tokenOfOwnerByIndex(account, index)
      .call({ from: account }, function (err, res) {
        if (err) {
          console.log("An error occured", err);          
          return;
        }        
        return res;
  });

  let URI = await nftToken.methods
  .tokenURI(id)
  .call({ from: account }, function (err, res) {
    if (err) {
      console.log("An error occured", err);          
      return;
    }        
    return res;
  });

  return {uri: URI, id: id};

}

async function get_nftURI(account, id) {
  let web3Provider;
  web3Provider = window.web3.currentProvider;
  const web3 = new Web3(web3Provider);   

  const nftToken = new web3.eth.Contract(ghosperABI, GHOSPER_ADDRESS);

  let URI = await nftToken.methods
  .tokenURI(id)
  .call({ from: account }, function (err, res) {
    if (err) {
      console.log("An error occured", err);          
      return;
    }        
    return res;
  });

  return URI;
  
}

export function getHistory (web3, account, stakeHistory, harvestHistory, filterTransactions, curCnt) {
  return (async (dispatch) =>{
      const totalCnt = filterTransactions.length;
      if(totalCnt < curCnt) {
          return;
      }
      const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);
      let eventAry = [];
      for(let i = curCnt; i < (curCnt + 3 >= totalCnt ? totalCnt : curCnt + 3); i ++) {
          await stakeToken.getPastEvents('allEvents', {
              filter: {
                  user: account
              },
              fromBlock: filterTransactions[i].block_number,
              toBlock: filterTransactions[i].block_number,
          }, function (error, events) {
          }).then(function(events){
              if(events.length > 0) {
                  for(let j = 0; j < events.length; j ++){
                      if(events[j].returnValues.user === account){
                          let k = 0;
                          for(k = 0; k < eventAry.length; k ++){
                              if(eventAry[k].blockHash === events[j].blockHash){
                                  break;
                              }
                          }
                          if(k === eventAry.length){
                              eventAry.push(events[j]);
                          }
                      }
                  }
              }
          })
      }
      
      for(let i = 0; i < eventAry.length; i++) {
          let el = eventAry[i];
          if(el.event === 'Stake' || el.event === 'UnStake') {
              let timestamp = new Date(filterTransactions[curCnt+i].block_timestamp) / 1000;
              el.timestamp = timestamp;
              stakeHistory = stakeHistory.concat(el);
          }
          else if(el.event === 'Harvest' || el.event === 'ReStake') {
              let timestamp = new Date(filterTransactions[curCnt+i].block_timestamp) / 1000;
              el.timestamp = timestamp;
              harvestHistory = harvestHistory.concat(el);
          }
      }
      
      const curShowCnt = curCnt + 3;
      const moreState =  totalCnt > curShowCnt ? true : false;

      dispatch({
        type: GHSP_HISTORY,
        payload: {
          stakeHistory: stakeHistory,
          harvestHistory: harvestHistory,
          curShowCnt: curShowCnt,
          moreState: moreState
        }
      });
  })
}

export function getNFTHistory (web3, account, stakeHistory, harvestHistory, filterTransactions, curCnt = 0) {
  return (async (dispatch) => {
    const totalCnt = filterTransactions.length;
    if(totalCnt < curCnt) {
        return;
    }
    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);
    let eventAry = [];
    for(let i = curCnt; i < (curCnt + 3 >= totalCnt ? totalCnt : curCnt + 3); i ++) {
        await stakeToken.getPastEvents('allEvents', {
            filter: {
                user: account
            },
            fromBlock: filterTransactions[i].block_number,
            toBlock: filterTransactions[i].block_number,
        }, function (error, events) {
        }).then(function(events){
            if(events.length > 0) {
                for(let j = 0; j < events.length; j ++){
                    if(events[j].returnValues.staker === account){
                        let k = 0;
                        for(k = 0; k < eventAry.length; k ++){
                            if(eventAry[k].blockHash === events[j].blockHash){
                                break;
                            }
                        }
                        if(k === eventAry.length){
                            eventAry.push(events[j]);
                        }
                    }
                }
            }
        })
    }
    
    for(let i = 0; i < eventAry.length; i++) {
        let el = eventAry[i];
        let timestamp = filterTransactions[curCnt + i].block_timestamp;
        el.timestamp = timestamp;
        if(el.event === 'Staked' || el.event === 'UnStaked') {
            stakeHistory = stakeHistory.concat(el);
        }
        else if(el.event === 'Harvest') {
            harvestHistory = harvestHistory.concat(el);
        }
    }

    const curShowCnt = curCnt + 3;
    const moreState =  totalCnt > curShowCnt ? true : false;
    
    dispatch({
      type: NFT_HISTORY,
      payload: {
        stakeHistory: stakeHistory,
        harvestHistory: harvestHistory,
        curShowCnt: curShowCnt,
        moreState: moreState
      }
    });
  });
}

export function getPreviousPoolInfo(web3, account) {
  return async (dispatch) => {
    const stakeTokenV0 = new web3.eth.Contract(stakeV0ABI, STAKING_ADDRESS_V0);

    let balanceOfStakes = await stakeTokenV0.methods
      .balanceOfStakes()
      .call({ from: account }, function (err, res) {
          if (err) {
              console.log("An error occured", err);
              return;
          }
          return res;
      });
    
    balanceOfStakes = fromWEI(balanceOfStakes);
    
    //Rewards
    let balanceOfRewards = await stakeTokenV0.methods
    .balanceOfRewards()
    .call({ from: account }, function (err, res) {
        if (err) {
            console.log("An error occured", err);
            return;
        }
        return res;
    });
    balanceOfRewards = fromWEI(balanceOfRewards);

    dispatch({
      type: GHSP_PREVPOOLINFO,
      payload: {
        prevStakes: balanceOfStakes,
        prevRewards: balanceOfRewards,
      },
    });
  }
}

export function getPreviousPoolInfoNFT(web3, account) {
  return async (dispatch) => {
    const tokenV0 = new web3.eth.Contract(stakeNFTABI, NFTSTAKE_ADDRESS);
    
    let balanceOfStakes = await tokenV0.methods
      .balanceOfStakes()
      .call({ from: account }, function (err, res) {
          if (err) {
              console.log("An error occured", err);
              return;
          }
          return res;
      });
    
    //Rewards
    let balanceOfRewards = await tokenV0.methods
    .balanceOfRewards()
    .call({ from: account }, function (err, res) {
        if (err) {
            console.log("An error occured", err);
            return;
        }
        return res;
    });
    balanceOfRewards = fromWEI(balanceOfRewards);

    dispatch({
      type: NFT_PREVPOOLINFO,
      payload: {
        prevNFTBalanceStake: balanceOfStakes,
        prevNFTRewards: balanceOfRewards,
      },
    });
  }
}