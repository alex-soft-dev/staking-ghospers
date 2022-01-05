import { React, useState, Fragment, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Table,
  Form} from "react-bootstrap";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import ToggleSwitch from "../toggleswitch/toggleswitch";
import NftImgCard from "../nftimgcard/nftimgcard";
// import Moralis from "moralis";
import {
  IS_NFT_CONNECTED,
  NFT_BALANCE,
  NFT_REWARD,
  NFT_HARVESTHISTORY,
  NFT_STAKEHISTORY,
  // STAKE_BALANCE,
  REWARDPERSEC,
  IS_ADMIN,
  ADMIN_INFO,
  ADMIN_HARVEST_HISTORY,
  ADMIN_STAKE_HISTORY,
  ADMIN_IS_RUNNING,
  ALL_STAKES,
  // FEE_ADDRESS,
  // HARVEST_FEE,
  // ADMIN_TOTAL_SUPPLY,
  // ADMIN_STAKING_DAYS,
  fromWEI,
  toWEI,
  WALLET_ADDRESS,
  MAIN_CHAINID,
  TEST_CHAINID,
  PREV_NFT_REWARDS,
  TEST_GHOSPER_ADDRESS,
  MAIN_GHOSPER_ADDRESS,
  // OPENSEA_MAIN,
  // OPENSEA_TEST,
  TEST_GHOSPER_STAKE_ADDRESS_V1,
  MAIN_GHOSPER_STAKE_ADDRESS_V1,
  TEST_GHOSPER_STAKE_ADDRESS,
  MAIN_GHOSPER_STAKE_ADDRESS,
  WEB3,
  PREV_NFT_BALANCE_STAKE,
  // WEB3APIKEY,
} from "../../redux/constants";
import * as actions from "../../redux/actions";
import { useActions } from "../../redux/useActions";
import { useSelector } from "react-redux";
import { PRODUCT_MODE } from "../../config";
import toast, { Toaster } from 'react-hot-toast';
import stakeNFTABI from "../../ABI/stakeNFT.json";
import stakeNFTV1ABI from "../../ABI/stakeNFTV1.json";
import ghosperNFTABI from "../../ABI/ghosperNFT.json";
// import Axios from "axios";
// import { string } from "prop-types";

let CHAINETHID = PRODUCT_MODE ? MAIN_CHAINID : TEST_CHAINID;
let GHOSPER_ADDRESS = PRODUCT_MODE ? MAIN_GHOSPER_ADDRESS : TEST_GHOSPER_ADDRESS;
// let OPENSEA_URL = PRODUCT_MODE ? OPENSEA_MAIN : OPENSEA_TEST;
let NFTSTAKE_ADDRESS_V1 = PRODUCT_MODE ? MAIN_GHOSPER_STAKE_ADDRESS_V1 : TEST_GHOSPER_STAKE_ADDRESS_V1;
let NFTSTAKE_ADDRESS = PRODUCT_MODE ? MAIN_GHOSPER_STAKE_ADDRESS : TEST_GHOSPER_STAKE_ADDRESS;

function Ghosper(props) {

  // action button 
  /*

    .ghosper_harvest : harvest button
    .ghosperstake_btn : stake button  

  */


  // whether the wallet is connected or not-----------!!!temporary!!!=>redux------------

  const actioncreator = useActions(actions);

  function getFlooredFixed(v, d) {
    if(v === undefined) {
      return 0;
    }
    return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }



  // whether the wallet is connected or not-----------!!!temporary!!!=>redux------------
  const nft_isConnected = useSelector((state) => state.nft[IS_NFT_CONNECTED]);
  const nft_stakeUris = useSelector((state) => state.nft['nft_stakeUris']);  
  const walletAddress = useSelector((state) => state.nft[WALLET_ADDRESS]);
  const shortAddress =  walletAddress.slice(0, 10) + "..." + walletAddress.slice(walletAddress.length - 8, walletAddress.length);
  const web3 = useSelector((state) => state.wallet[WEB3]);
  const nft_balance = useSelector((state) => state.nft[NFT_BALANCE]);
  const nft_balanceURIs = useSelector((state) => state.nft['nft_balanceURIs']);
  const nft_balanceIds = useSelector((state) => state.nft['nft_balanceIds']);  
  const reward = useSelector((state) =>
    Number(getFlooredFixed(state.nft[NFT_REWARD], 8))
  );

  // console.log("stake_balance--====",nft_stakeUris);

  // const rewardNoRound = useSelector((state) =>
  //   getFlooredFixed(state.nft[NFT_REWARD], 8)
  // );

  const harvestHistory = useSelector(
    (state) => state.nft[NFT_HARVESTHISTORY]
  );
  const balanceofstakes = useSelector(
    (state) => state.nft.balanceofstakes
  );

  const is_admin = useSelector((state) => state.nft[IS_ADMIN]);

  const admin_info = useSelector((state) => state.nft[ADMIN_INFO]);
  const adminHarvestHistory = useSelector(
    (state) => state.nft[ADMIN_HARVEST_HISTORY]
  );

  const stakeHistory = useSelector((state) => state.nft[NFT_STAKEHISTORY]);
  
  const filterTransactions = useSelector((state) => state.nft["filterTransactions"]);
  const curShowCnt = useSelector((state) => state.nft["curShowCnt"]);
  const moreState = useSelector((state) => state.nft["moreState"]);

  const Wbalance = useSelector((state) => state.nft.Wbalance);

  const adminStakeHistory = useSelector(
    (state) => state.nft[ADMIN_STAKE_HISTORY]
  );
  const adminIsRunning = useSelector((state) => state.nft[ADMIN_IS_RUNNING]);
  const allStakes = useSelector((state) => Number(state.nft[ALL_STAKES]));
  // const admin_total_supply = useSelector((state) =>
  //   Number(state.nft[ADMIN_TOTAL_SUPPLY])
  // );
  // const admin_staking_days = useSelector((state) =>
  //   Number(state.nft[ADMIN_STAKING_DAYS])
  // );

  // const adminFeeAddress = useSelector((state) => state.nft[FEE_ADDRESS]);
  // const adminHarvestFee = useSelector((state) =>
  //   Number(state.nft[HARVEST_FEE])
  // );

  const rewardPerSec = useSelector((state) =>
    Number(getFlooredFixed(state.nft[REWARDPERSEC], 8))
  );

  const prevNFTRewards = useSelector((state) =>    
    Number(getFlooredFixed(state.nft[PREV_NFT_REWARDS], 4))
  );

  const prevNFTBalanceStake = useSelector((state) =>    
    state.nft[PREV_NFT_BALANCE_STAKE]
  );

  // const stakeBalance = useSelector((state) =>    
  //   Number(state.nft[STAKE_BALANCE])
  // );  

  const get_balanceUrls = async () => {    
    //nft_balanceURIs
    let assetURIs = [];
    nft_balanceURIs.map(async (value, index) => {
      let assetURI = await ImageUrlFromIPFS(value);
      assetURIs.push(assetURI);
    });
    setBalanceImageUrl(assetURIs);
  }

  const ImageUrlFromIPFS = async (asset) => {
    // https://ipfs.io/ipfs/QmfKMQmYGPTdDYgUcXMGU7uXTmZ4Ed3ahMdL5vNjXR2Koj/3144  //ipfs id for ghosper nft
    let assetURI = "https://ipfs.io/ipfs/QmfKMQmYGPTdDYgUcXMGU7uXTmZ4Ed3ahMdL5vNjXR2Koj" + asset.substr(asset.lastIndexOf("/"));
    var requestOptions = {
      method: 'GET',
      redirect: 'follow'
    };
    let meta;
    await fetch(assetURI, requestOptions)
    .then(response => response.text())
    .then(result => meta = {id : JSON.parse(result).name, uri: JSON.parse(result).image.replace('ipfs://', 'https://ipfs.io/ipfs/')})
    .catch(error => console.log('error', error));
    // console.log(meta);
    return meta;
  }
  // const get_balanceUrls = async () => {
    
  //   await Moralis.Web3API.initialize({ apiKey: WEB3APIKEY });
  //   const options = { chain: CHAINETHID, address: walletAddress, token_address: GHOSPER_ADDRESS, };
  //   let ownedNFTs = await Moralis.Web3API.account.getNFTsForContract(options);
  //   console.log("owning NFTS", ownedNFTs.result);
  //   let stakedNFTs = Object.values(balanceofstakes);
    
  //   if(ownedNFTs.result.length == 0 && nft_unstakeBalance.length == 0) {
  //     setBalanceImageUrl([]);
  //     return;
  //   }
  //   let token_ids = "";

  //   ownedNFTs.result.map((value, index) => {
  //     if(stakedNFTs.indexOf(value.token_id) < 0) {
  //       token_ids += 'token_ids=' + value.token_id + "&";        
  //     }
  //   })  

  //   nft_unstakeBalance.map((value, index) => {
  //     token_ids += 'token_ids=' + value + "&";
  //   });

  //   if(token_ids == "") {
  //     setBalanceImageUrl([]);
  //     return;
  //   }
    
     
  //   console.log("token_ids", token_ids)

  //   let assets = await Axios.get(`${OPENSEA_URL}assets?order_direction=desc&offset=0&limit=20&${token_ids}asset_contract_address=${GHOSPER_ADDRESS}`)
  //     .then(res => {
  //       console.log("balanceurl", res);
  //       return res.data.assets;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       return [];
  //   });

  //   setBalanceImageUrl(assets);
  // }

  const get_stakeUrls = async () => {    

    let assetURIs = [];
    nft_stakeUris.map(async (value, index) => {
      let assetURI = await ImageUrlFromIPFS(value);
      assetURIs.push(assetURI);
    });
    setStakeImageUrl(assetURIs);
  }

  useEffect(() => {   
    async function fetchData() {
      await get_stakeUrls();    
      await get_balanceUrls();
      setStakeIds(0);
      setUnstakeIds(0);
      setStakeIdArray([]);
      setUnstakeIdArray([]);
    }
    fetchData();
  }, [balanceofstakes, nft_balance])

  useEffect(() => {
    async function initFetch() {
      if(window.ethereum === undefined) {
        await actioncreator.nft_disconnect();
        return false;
      }
      await actioncreator.nft_connect();
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) await actioncreator.nft_connect();
        else {
          clearInterval(interval);
          await actioncreator.nft_disconnect();
        }
      });

      const interval = setInterval(actioncreator.nft_updateReward, 1000);

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if(chainId !== CHAINETHID) {
        clearInterval(interval);
        actioncreator.nft_disconnect();
      }

      window.ethereum.on("chainChanged", async (chainId) => {

        // console.log(chainId);

        if (chainId !== CHAINETHID) {
          clearInterval(interval);
          await actioncreator.nft_disconnect();
          return false;
        }
        setInterval(interval);
      });
      // console.log("adminStakeHistory",adminStakeHistory);

      // await get_stakeUrls();
      // await get_balanceUrls();

      // setUnstakeIds(0);
      // setStakeIds(0);
      // setStakeIdArray([]);
      // setUnstakeIdArray([]);

      return async () => {
        clearInterval(interval);

        await actioncreator.nft_disconnect();
        window.ethereum.off("chainChanged");
        window.ethereum.off("accountsChanged");
      }
    }
    initFetch();
  }, [actioncreator]);  

  // 0:unstackonly, 1:stackonly
  const [stakeonlyShow, setStakeOnlyShow] = useState(true);
  // 0:hide stack, 1:show stack(toggle)
  const [stakeShow, setStakeShow] = useState(0);
  // 0:hide reward, 1:show reward(toggle)
  const [rewardShow, setRewardShow] = useState(0);

  // 0:hide admin, 1:show admin
  const [adminShow, setAdminShow] = useState(0);

  // 0:depositOnly, 1:withdrawOnly
  const [depositOnlyShow, setDepositOnlyShow] = useState(1);

  const [balanceImageUrl, setBalanceImageUrl] = useState([]);

  const [stakeImageUrl, setStakeImageUrl] = useState([]);
  
  const [stakeIdArray, setStakeIdArray] = useState({});

  const [unstakeIdArray, setUnstakeIdArray] = useState({});

  const [unstakeIds, setUnstakeIds] = useState(0);
  const [stakeIds, setStakeIds] = useState(0);

  // stake amount input value
  //const ghsp_stake_input = useRef(0);

  const [input_value, setInputValue] = useState({
    harvest: 0,
    stake: 0,
    unstake: 0,
    deposit: 0,
    withdraw: 0,
    apy: 0,
    period: 0,
    feeaddress: "",
    harvestfee: 0,
  });

  const [input_error, setInputError] = useState({
    harvest: false,

    stake: false,
    unstake: false,
    deposit: false,
    withdraw: false,
    apy: false,
    period: false,
    feeaddress: false,
    harvestfee: false,
  });

  // useEffect(() => {
  //   let temp = input_value;
  //   temp.apy = admin_total_supply;
  //   temp.period = admin_staking_days;
  //   temp.feeaddress = adminFeeAddress;
  //   temp.harvestfee = adminHarvestFee;
  //   setInputValue(temp);
  // }, [admin_total_supply]);

  function set_value(e) {
    let temp = JSON.parse(JSON.stringify(input_value));
    temp[e.target.name] = e.target.value;
    setInputValue(temp);
  }

  function set_max(name, max) {
    let temp = JSON.parse(JSON.stringify(input_value));
    temp[name] = max;
    setInputValue(temp);
  }

  function set_error(name, value) {

    let temp = JSON.parse(JSON.stringify(input_error));
    temp[name] = value;
    setInputError(temp);

  }

  function get_history(history, sort = "stake") {
    const array_history = Object.values(history);
    //console.log(array_history);
    if (array_history.length === 0) {
      return (
        <tr>
          <td colSpan="5">There's no history</td>
        </tr>
      );
    } else {
      let date = [];
      // let length = array_history.length - 1;
      array_history.map((value) => {
        if(value.length !== 0) {
          let d = value.timestamp;
          d = d.slice(0, 10) + ", " + d.slice(11, 19);
          date.push(d.toLocaleString());
        }
        return value;
      });
      return array_history.map((value, index) => {
        if(value.length === 0) return value;
        let amount = "";
        sort = value.event;
        let percentFee = 0;
        let status = "";
        let returnVal = value.returnValues;
        if(sort === "UnStaked" || sort === "Staked") {
          let cnt = returnVal.tokenId.length;
          for(let i = 0; i < cnt; i++) {
            let addVal = ""
            if(i === cnt - 1) {
              addVal = "#" + returnVal.tokenId[i];
            }
            else {
              addVal = "#" + returnVal.tokenId[i] + ", ";
            }
            amount += addVal;
          }
          status = sort.slice(0, sort.length-1);
        }
        else if(sort === "Harvest") {
          amount = fromWEI(returnVal.amount).toFixed(4);
          status = "Harvest";
          let val1 = (Number(returnVal.harvestFee) + Number(returnVal.amount));
          let val2 = Number(returnVal.harvestFee);
          percentFee = Number(val1 !== 0 ? (val2 * 100 / val1) : 0).toFixed(0);
        }
        return (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{date[index]}</td>
            <td>{amount}</td>
            <td>{percentFee}%</td>
            <td>
              {value ? (
                <Badge pill bg="success text-white">
                  {status}
                </Badge>
              ) : (
                <Badge pill bg="warning text-black">
                  {sort === "Staked" ? "Unstaked" : "pending"}
                </Badge>
              )}
            </td>
          </tr>
        );
      });
    }
  }

  function stake() {
    set_error("stake", false);     
    let idArray  = [];
    for(var id in stakeIdArray) {
        if(stakeIdArray[id]) {
          idArray.push(id);
        }
    }
  

    if (      
      idArray.length <= 0
    ) {

      set_error("stake", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nft_stake(idArray);
  }

  function unstake() {
    set_error("unstake", false);     
    let idArray  = [];
    for(var id in unstakeIdArray) {
        if(unstakeIdArray[id]) {
          idArray.push(id);
        }
    }

    if (      
      idArray.length <= 0
    ) {

      set_error("unstake", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nft_unstake(idArray);
  }

  function harvest() {
    set_error("harvest", false);

    if (
      // !input_value.harvest ||
      // input_value.harvest <= 0 ||
      // input_value.harvest > Number(reward)
      Number(reward) <= 0
    ) {
      set_error("harvest", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.ghosper_harvest();
  }

  function deposit() {
    set_error("deposit", false);

    if (
      !input_value.deposit ||
      input_value.deposit <= 0 ||
      input_value.deposit > Wbalance
    ) {
      set_error("deposit", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nftadmin_deposit(input_value.deposit);
  }

  function withdraw() {
    set_error("withdraw", false);

    if (
      !input_value.withdraw ||
      input_value.withdraw <= 0 ||
      input_value.withdraw >
      Number(
        fromWEI(Object.values(admin_info)[0]) -
        fromWEI(Object.values(admin_info)[1]) +
        fromWEI(Object.values(admin_info)[2])
      ).toFixed(8)
      // input_value.withdraw > admin_total_supply
    ) {
      set_error("withdraw", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nftadmin_withdraw(input_value.withdraw);
  }

  function updateAPY() {

    set_error("apy", false);
    set_error("period", false);

    if (
      !input_value.apy ||
      input_value.apy < 10000
    ) {
      set_error("apy", true);

      console.log("-----------ERROR---------------");
      return false;
    } else if (
      !input_value.period ||
      input_value.period <= 0
    ) {
      set_error("period", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nftadminUpdateAPY(
      input_value.apy,
      input_value.period
    );
  }

  function updateFeeAddr() {
    set_error("feeaddress", false);

    if (!input_value.feeaddress) {
      set_error("feeaddress", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nftadmin_updateFeeAddr(input_value.feeaddress);
  }

  function updateHarvestFee() {
    set_error("harvestfee", false);

    if (
      input_value.harvestfee === "" ||
      0 > input_value.harvestfee ||
      input_value.harvestfee > 100
    ) {
      set_error("harvestfee", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.nftadmin_updateHarvestFee(input_value.harvestfee);
  }

  function setStakeId(status, id) {
    let temp = stakeIdArray;
    if (status === true) {
      temp[id] = true;
    }
    else {
      
      temp[id] = false;
    }
    setStakeIdArray(temp);
    let ids = 0
    for(let key in temp) {
      if(temp[key] === true) ids++;      
    }
    setStakeIds(ids);
    // console.log(temp);
    return false;
  }

  function setUnstakeId(status, id) {
    let temp = unstakeIdArray;
    if (status === true) {
      temp[id] = true;
    }
    else {
      
      temp[id] = false;
    }
    setUnstakeIdArray(temp);
    let ids = 0
    for(let key in temp) {
      if(temp[key] === true) ids++;      
    }
    setUnstakeIds(ids);
    // console.log(temp);
    return false;
  }

  const [migrateCnt, setMigrateCnt] = useState(0);
  const onClickStakeMigrate = async () => {
    if(prevNFTBalanceStake.length <= 0) {
      toast.error("Fail to Migration because there are no Stakes!");
      return;
    }
    if(migrateCnt === 0) {
      toast.error("Please input valid number!");
      return;
    }

    if(migrateCnt > prevNFTBalanceStake.length) {
      toast.error("Please input number less than migrate Stakes!");
      return;
    }

    const stakeTokenV0 = new web3.eth.Contract(stakeNFTABI, NFTSTAKE_ADDRESS);

    let idArray = [];
    for(let index = 0; index < migrateCnt; index ++) {
      idArray.push(prevNFTBalanceStake[index]);
    }
    if(idArray.length > 0) {
        actioncreator.spinner_show(true, "Requesting UnStake to Previous Contract...");
        
        await stakeTokenV0.methods
        .unstake(idArray)
        .send({ from: walletAddress }, function (err, res) {
            if (err) {
                console.log("An error occured", err);
                actioncreator.spinner_show();
                return;
            }
            actioncreator.spinner_show(true, "Processing Transaction from Previous Contract...");
            return res;
        })
        .then((res)=>{
          let eventData = res.events.UnStaked;
          if(eventData === undefined || eventData === null) {
            actioncreator.spinner_show();
            return;
          }
          else {
            actioncreator.spinner_show(true, "Finish UnStake from Previous Contract...");
          }
        });
    }

    //stake
    const ghsperToken = new web3.eth.Contract(ghosperNFTABI, GHOSPER_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeNFTV1ABI, NFTSTAKE_ADDRESS_V1);

    if(idArray.length > 0) {
        actioncreator.spinner_show(true, "Requesting Approval...");
        await ghsperToken.methods
        .setApprovalForAll(NFTSTAKE_ADDRESS_V1, true)
        .send({ from: walletAddress }, function (err, res) {
            if (err) {
                console.log("An error occured", err);
                actioncreator.spinner_show();
                return;
            }
            actioncreator.spinner_show(true, "Processing Approval...");
            return res;
        });

        actioncreator.spinner_show(true, "Requesting Stake...");
        await stakeToken.methods
        .stake(idArray)
        .send({ from: walletAddress }, function (err, res) {
            if (err) {
                console.log("An error occured", err);
                actioncreator.spinner_show();
                return;
            }
            
            actioncreator.spinner_show(true, "Processing Transaction...");
            return res;
        })
        .then((res)=>{
          let eventData = res.events.Staked;
          if(eventData === undefined || eventData === null) {
              actioncreator.spinner_show(false);
              return;
          }
        });
    }

    if(prevNFTBalanceStake.length > 0) {
      actioncreator.nft_connect();
    }
  }

  const onClickRewardMigrate = async () => {
    //Unstake
    // console.log("setReward: ", prevNFTRewards);

    if(Number(prevNFTRewards) <= 0) {
      toast.error("Fail to Migration because there are no Stakes and Rewards!");
      return;
    }
    const stakeTokenV0 = new web3.eth.Contract(stakeNFTABI, NFTSTAKE_ADDRESS);

    let amountVal = toWEI(prevNFTRewards);
    if(amountVal > 0) {
        actioncreator.spinner_show(true, "Requesting Harvest to Previous Contract...");
        
        await stakeTokenV0.methods
        .harvest(amountVal.toString(10))
        .send({ from: walletAddress }, function (err, res) {
            if (err) {
                console.log("An error occured", err);
                actioncreator.spinner_show();
                return;
            }
            actioncreator.spinner_show(true, "Processing Transaction from Previous Contract...");
            return res;
        })
        .then((res)=>{
          let eventData = res.events.Harvest;
          if(eventData === undefined || eventData === null) {
            actioncreator.spinner_show();
            return;
          }
          actioncreator.nft_connect();
          actioncreator.spinner_show(true, "Finish Harvest from Previous Contract...");
        });
    }
  }

  const [loading, setLoading] = useState(false);
  const historyMore = async () => {
    setLoading(true);
    actioncreator.getNFTHistory(web3, walletAddress, stakeHistory, harvestHistory, filterTransactions, curShowCnt);
  }

  useEffect(()=>{
    setLoading(false);
  }, [curShowCnt])

  return (
    <Fragment>
      <Container fluid className="farming-container">
        <div><Toaster toastOptions={{className : 'm-toaster', duration : 3000, style : { fontSize: '12px' }}}/></div>
        <Row className="migrate-toggle-row">
          <Col md={7} className="score-col prev-info">
            <span className="prev-text">Previous Pool Info:</span>
            <br />
            <span>Please input value less than 10.</span>
            <br />
            <div className="migrate-stake">
              <div className="migrate-inner">
                <span className="value-panel">Stakes:</span> <span className="balance-span"> {prevNFTBalanceStake.length} Ghopser</span>
                <Form.Group className="col-md-2 d-inline-block ms-3 amount-input">
                  <Form.Control
                    type="number"
                    value={migrateCnt}
                    min={0}
                    onChange={(e) => {
                      if (e.target.value < 0) {
                        e.target.value = e.target.value * -1;
                      }
                      setMigrateCnt(Number(e.target.value));
                    }}
                  />
                </Form.Group>
              </div>
              <Button
                className="harvest_addbtn ghsp_harvest buy"
                onClick={() => {
                  onClickStakeMigrate();
                }}
              >
                Migrate
              </Button>
            </div>
            <br />
            <div className="migrate-stake">
              <div className="migrate-inner">
                <span className="value-panel">Rewards:</span><span className="balance-span"> {prevNFTRewards} GHSP</span>
              </div>
              <Button
                className="harvest_addbtn ghsp_harvest buy"
                onClick={() => {
                  onClickRewardMigrate();
                }}
              >
                Harvest
              </Button>
            </div>
          </Col>
          <Col md={1}></Col>
        </Row>
        <Row className="migrate-toggle-row-mobile">
          <Col md={7} className="score-col prev-info">
            <p className="prev-text">Previous Pool Info:</p>
            <span className="value-panel">Stakes:</span> <span className="balance-span"> {prevNFTBalanceStake.length} Ghopser</span>
            <p>Please input value less than 10.</p>
            <Form.Group className="mb-3 col-md-2 d-inline-block mx-3 amount-input">
                <Form.Control
                  type="number"
                  id="stake" name="stake"
                  value={migrateCnt}
                  min={0}
                  onChange={(e) => {
                    if (e.target.value < 0) {
                      e.target.value = e.target.value * -1;
                    }
                    setMigrateCnt(Number(e.target.value));
                  }}
                />
              </Form.Group>
            <div className="d-flex">
              <Button
                className="harvest_addbtn ghsp_harvest buy m-auto"
                onClick={() => {
                  onClickStakeMigrate();
                }}
              >
                Migrate
              </Button>
            </div>
            <br />
            <span className="value-panel">Rewards:</span><span className="balance-span"> {prevNFTRewards} GHSP</span>
            <div className="d-flex">
              <Button
                className="harvest_addbtn ghsp_harvest buy m-auto"
                onClick={() => {
                  onClickRewardMigrate();
                }}
              >
                Harvest
              </Button>
            </div>
          </Col>
          <Col md={1}></Col>
        </Row>
        <Row>
          <Container
            className="harvest-container" style={{ display: nft_isConnected ? "block" : "none" }}
          >
            <Row className="farming-toggle-row">
              <Col md={8} className="score-col">
                Your Account:
                <div>
                  <span className="address-span">{walletAddress}</span>
                  <span className="address-span-mobile">{shortAddress}</span>
                </div>
                Balance:<span className="balance-span"> {nft_balance} Ghosper Tokens</span>
              </Col>
              <Col md={3} className="d-flex">
                <Button
                  target="_blank"
                  href="https://opensea.io/collection/ghospers"
                  className="harvest_addbtn ghsp_harvest buy m-auto"
                >
                  Buy Ghospers$
                </Button>
              </Col>
            </Row>
            <Row className="harvest-row">
              <Row onClick={() => { setRewardShow(!rewardShow); }}>
                <Col md={10} className="harvest-header">
                  Rewards:
                  <span className="harvest-value">
                    {reward} &nbsp; (+{ Number(reward) === 0 || Number(allStakes) === 0 ? 0 : (Number(rewardPerSec) * Number(nft_stakeUris.length/allStakes)).toFixed(10) } GHSP / Block)
                  </span>
                  <span className="harvest-value-mobile">
                    {reward} &nbsp; <br/>
                    (+{ Number(reward) === 0 || Number(allStakes) === 0 ? 0 : (Number(rewardPerSec) * Number(nft_stakeUris.length/allStakes)).toFixed(4) } GHSP / Block)
                  </span>
                </Col>
                <Col md={2} className="harvest-header">
                  {
                    rewardShow ? <FaAngleUp></FaAngleUp> : <FaAngleDown></FaAngleDown>
                  }
                </Col>
              </Row>
              <Row className="harvest-addrow" style={{ display: rewardShow ? "flex" : "none" }}>
                <Row className="px-0 mx-0">
                  <Col md={10}>
                    {input_error.harvest ? <span
                      className="text-danger px-5 d-block"
                      style={{ marginLeft: "8rem" }}
                    >
                      There is no reward to harvest.
                    </span> : null}
                  </Col>
                  <Col md={2} className="d-flex">
                    <Button
                      className="harvest_addbtn ghsp_harvest m-auto"
                      onClick={() => {
                        harvest();
                      }}
                    >
                      Harvest
                    </Button>
                  </Col>
                </Row>
                {/* <hr /> */}
                <Row hidden className="history-row mt-3 mb-0">
                  Harvest History
                </Row>
                <Row hidden className="px-0 mx-0 mt-0 pt-1">
                  <Table responsive="sm" className="history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Time</th>
                        <th>Amount</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {get_history(harvestHistory, "harvest")}
                    </tbody>
                  </Table>
                </Row>
              </Row>
            </Row>
            <Row className="harvest-row">
              <Row onClick={() => { setStakeShow(!stakeShow); }}>
                <Col md={10} className="harvest-header">
                  Stakes:
                  <span className="stake-value">
                    {Object.values(balanceofstakes).length} tokens ({allStakes === 0 || nft_stakeUris.length === 0 ? "0" : Number(nft_stakeUris.length/allStakes * 100).toFixed(2) }% in the pool)
                  </span>
                  <span className="stake-value-mobile">
                    {Object.values(balanceofstakes).length} tokens <br/>
                    ({allStakes === 0 || nft_stakeUris.length === 0 ? "0" : Number(nft_stakeUris.length/allStakes * 100).toFixed(2) }
                    % in the pool)
                  </span>
                </Col>
                <Col md={2} className="harvest-header">
                  {
                    stakeShow ? <FaAngleUp></FaAngleUp> : <FaAngleDown></FaAngleDown>
                  }

                </Col>
              </Row>
              <Row className="harvest-addrow" style={{ display: stakeShow ? "flex" : "none" }}>
                <Row className="px-0 mx-0 harvest-switch">
                  <Col md={3}>
                    <span className="toggle-stake">Unstake / Stake:</span>
                  </Col>
                  <Col md={3}>
                    <ToggleSwitch click={setStakeOnlyShow} onlyShow={stakeonlyShow} />                    
                  </Col>
                  <Col md={5} className="d-flex justify-content-end">
                  <div style={{marginRight:"5rem"}}><span>{stakeonlyShow ? stakeIds+' / '+nft_balance : unstakeIds+' / '+Object.values(balanceofstakes).length}</span> Selected</div>
                    {stakeonlyShow ? <Button className="harvest_addbtn ghsp_stake_btn" onClick={() => {
                      stake();
                    }}>Stake</Button> : <Button className="harvest_addbtn ghsp_stake_btn float-right" onClick={() => {
                      unstake();
                    }}>Unstake</Button>}
                  </Col>
                </Row>
                <Row className="px-0 mx-0 harvest-switch-mobile">
                  <div className="d-flex m-auto justify-content-center mb-3">
                    <span className="toggle-stake">Unstake / Stake:</span>
                    <ToggleSwitch click={setStakeOnlyShow} onlyShow={stakeonlyShow} />                    
                  </div>
                  <div className="d-flex m-auto justify-content-center">
                    <div style={{marginRight:"5rem"}}><span>{stakeonlyShow ? stakeIds+' / '+nft_balance : unstakeIds+' / '+Object.values(balanceofstakes).length}</span> Selected</div>
                    {stakeonlyShow ? <Button className="harvest_addbtn ghsp_stake_btn" onClick={() => {
                      stake();
                    }}>Stake</Button> : <Button className="harvest_addbtn ghsp_stake_btn float-right" onClick={() => {
                      unstake();
                    }}>Unstake</Button>}
                  </div>
                </Row>
                {/* <hr /> */}
                <Row className="px-0 mx-0 d-flex nft-container">      
                {                    
                    stakeonlyShow ? balanceImageUrl.map((value, index)=> {
                      return <NftImgCard key = {index} title={value.id} img={value.uri} set={setStakeId}></NftImgCard>
                    }) : stakeImageUrl.map((value, index)=> {
                      return <NftImgCard key = {index} title={value.id} img={value.uri} set={setUnstakeId}></NftImgCard>
                    })
                  }
                  
                </Row>
                <Row hidden className="history-row mt-3 mb-0">
                  Stake History
                </Row>
                <Row hidden className="px-0 mx-0 mt-0 pt-1">
                  <Table responsive="sm" className="history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Time</th>
                        <th>Token</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                    {stakeHistory != null
                        ? get_history(stakeHistory, "stake")
                        : null}
                    </tbody>
                  </Table>
                </Row>
                {
                  moreState ? 
                  <Row className="px-0 mx-0 mt-0 pt-1">
                    {loading ?
                      <Button
                        className="harvest_addbtn nft-more-btn"
                      >
                        ---
                      </Button>
                    : 
                    <Button
                      className="harvest_addbtn nft-more-btn"
                      onClick={() => {
                        historyMore();
                      }}
                    >
                      More
                    </Button>}
                  </Row>
                  :
                  <></>
                }
              </Row>
            </Row>
            <Row
              className="harvest-row"
              style={{ display: is_admin ? "none" : "none" }}
            >
              <Row
                onClick={() => {
                  setAdminShow(!adminShow);
                }}
              >
                <Col md={10} className="harvest-header">
                  Admin Pannel
                </Col>
                <Col md={2} className="harvest-header">
                  {adminShow ? (
                    <FaAngleUp></FaAngleUp>
                  ) : (
                    <FaAngleDown></FaAngleDown>
                  )}
                </Col>
              </Row>
              <Row
                className="harvest-addrow"
                style={{ display: adminShow ? "flex" : "none" }}
              >
                <Row className="px-0 mx-0">
                  {/* <Col md={9}>
                  Amount:
                  
                </Col>
                <Col md={3}>
                  <Button className="harvest_addbtn">Harvest</Button>
                </Col> */}
                  <Col md={2}>
                    <span className="toggle-stake">Deposit/Withdraw:</span>
                  </Col>
                  <Col md={1}>
                    <ToggleSwitch
                      click={setDepositOnlyShow}
                      onlyShow={depositOnlyShow}
                    />
                  </Col>
                  <Col md={8}>
                    <span>
                      Capacity: &nbsp;
                      {admin_info != null
                        ? fromWEI(Object.values(admin_info)[0])
                        : 0}{" "}
                      &nbsp;GHSP
                    </span>
                  </Col>
                </Row>
                <hr />
                <Row
                  className="px-0 mx-0"
                  style={{ display: depositOnlyShow ? "flex" : "none" }}
                >
                  <Col md={10}>
                    Amount:
                    <span
                      onClick={() => {
                        set_max('deposit', Wbalance);
                      }}
                    >
                      MAX
                    </span>
                    <Form.Group className="mb-3 col-md-4 d-inline-block mx-5 amount-input">
                      <Form.Control
                        type="number"
                        id="deposit"
                        name="deposit"
                        value={input_value.deposit}
                        min={0}
                        onChange={(e) => {
                          set_value(e);
                          set_error("deposit", false);
                          if (e.target.value < 0) {
                            e.target.value = e.target.value * -1;
                          }
                        }}
                      />
                    </Form.Group>
                    {input_error.deposit ? <span
                      className="text-danger px-5 d-block"
                      style={{ marginLeft: "8rem" }}
                    >
                      Please insert a valid number
                    </span> : null}
                  </Col>
                  <Col md={2}>
                    <Button
                      className="harvest_addbtn ghsp_stake_btn"
                      onClick={() => {
                        deposit();
                      }}
                    >
                      Deposit
                    </Button>
                  </Col>
                </Row>
                <Row
                  className="px-0 mx-0"
                  style={{ display: !depositOnlyShow ? "flex" : "none" }}
                >
                  <Col md={10}>
                    Amount:
                    <span
                      onClick={() => {
                        let value =
                          admin_info != null
                            ? (fromWEI(
                              Object.values(admin_info)[0] -
                              Object.values(admin_info)[1]
                            ) +
                              fromWEI(Object.values(admin_info)[2])).toFixed(8, 1)
                            : 0;
                        set_max('withdraw', value);
                      }}
                    >
                      MAX
                    </span>
                    <Form.Group className="mb-3 col-md-4 d-inline-block mx-5 amount-input">
                      <Form.Control
                        type="number"
                        name="withdraw"
                        id="withdraw"
                        value={input_value.withdraw}
                        min={0}
                        onChange={(e) => {
                          set_value(e);
                          set_error("withdraw", false);
                          if (e.target.value < 0) {
                            e.target.value = e.target.value * -1;
                          }
                        }}
                      />
                    </Form.Group>
                    {input_error.withdraw ? <span
                      className="text-danger px-5 d-block"
                      style={{ marginLeft: "8rem" }}
                    >
                      Please insert a valid number
                    </span> : null}

                  </Col>
                  <Col md={2}>
                    <Button
                      className="harvest_addbtn unghsp_stake_btn"
                      onClick={() => {
                        withdraw();
                      }}
                    >
                      Withdraw
                    </Button>
                  </Col>
                </Row>
                <hr />
                <Row className="history-row mt-3 mb-0">
                  <Col md={3}>Stake History</Col>
                  <Col md={3}>
                    <span>
                      Total: &nbsp;
                      {admin_info != null ? Number(allStakes.toFixed(8)) : 0}{" "}
                      &nbsp;tokens
                    </span>
                  </Col>
                </Row>
                <Row className="px-0 mx-0 mt-0 pt-1">
                  <Table responsive="sm" className="history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Time</th>
                        <th>Token</th>                        
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminStakeHistory != null
                        ? get_history(adminStakeHistory, "stake")
                        : null}
                    </tbody>
                  </Table>
                </Row>
                <hr />
                <Row className="history-row mt-3 mb-0">
                  <Col md={3}>Harvest History</Col>
                  <Col md={9}>
                    <span>
                      Total Rewards: &nbsp;
                      {admin_info != null
                        ? Number(
                          fromWEI(Object.values(admin_info)[1]).toFixed(8, 1)
                        )
                        : 0}
                      , Total Harvest:{" "}
                      {admin_info != null
                        ? Number(
                          fromWEI(Object.values(admin_info)[2]).toFixed(8, 1)
                        )
                        : 0}{" "}
                      &nbsp;GHSP
                    </span>
                  </Col>
                </Row>
                <Row className="px-0 mx-0 mt-0 pt-1">
                  <Table responsive="sm" className="history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Time</th>
                        <th>Token</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminHarvestHistory != null
                        ? get_history(adminHarvestHistory, "harvest")
                        : null}
                    </tbody>
                  </Table>
                </Row>
                <hr />
                <Row className="px-0 mx-0 mt-0 pt-1">
                  <Col md={4}>
                    <span className="toggle-stake">Staking Status on/off:</span>
                  </Col>
                  <Col md={1}>
                    <ToggleSwitch
                      key="status-toggle"
                      click={actioncreator.nftsetIsRunning}
                      onlyShow={adminIsRunning}
                    />
                  </Col>
                </Row>
                <hr />
                <Row className="history-row mt-3 mb-0">
                  <Col md={3}>Update APY</Col>
                </Row>
                <Row className="px-0 mx-0">
                  <Col md={2}>Amount:</Col>
                  <Col md={10}>
                    <Form.Group className="mb-3 col-md-4 d-inline-block mx-5 amount-input">
                      <Form.Control
                        type="number"
                        name="apy"
                        value={input_value.apy}
                        min={0}
                        onChange={(e) => {
                          set_value(e);
                          set_error("apy", false);
                          if (e.target.value < 0) {
                            e.target.value = e.target.value * -1;
                          }
                        }}
                      />
                    </Form.Group>
                    GHSP
                  </Col>
                  <Col md={11} className="row py-1">
                    {input_error.apy ? <span
                      className="text-danger px-5 d-block mx-xs-0"
                      style={{ marginLeft: "13rem" }}
                    >
                      Please insert a valid number - must be bigger than 10K.
                    </span> : null}
                  </Col>
                  <Col md={2}>Period:</Col>
                  <Col md={8}>
                    <Form.Group className="mb-3 col-md-5 d-inline-block mx-5 amount-input">
                      <Form.Control
                        type="number"
                        name="period"
                        value={input_value.period}
                        min={0}
                        onChange={(e) => {
                          set_value(e);
                          set_error("period", false);
                          if (e.target.value < 0) {
                            e.target.value = e.target.value * -1;
                          }
                        }}
                      />
                    </Form.Group>
                    DAYS
                  </Col>
                  <Col md={2}>
                    <Button
                      className="harvest_addbtn ghsp_stake_btn"
                      onClick={() => {
                        updateAPY();
                      }}
                    >
                      Update
                    </Button>
                  </Col>
                  <Col md={10} className="row pt-1">
                    {input_error.period ? <span
                      className="text-danger px-5 d-block"
                      style={{
                        display: "none",
                        marginLeft: "13rem",
                      }}
                    >
                      Please insert a valid number
                    </span> : null}

                  </Col>
                </Row>
                <Row className="history-row mt-3 mb-0 d-block">
                  <Col md={3}>Update Fees</Col>
                </Row>
                <Row className="px-0 mx-0">
                  <Col md={3}>Fee Account Address:</Col>
                  <Col md={7}>
                    <Form.Group className="mb-3 col-md-5 d-inline-block mx-5 amount-input">
                      <Form.Control
                        type="text"
                        name="feeaddress"
                        value={input_value.feeaddress}                        
                        onChange={(e) => {
                          set_value(e);
                          set_error("feeaddress", false);
                        }}
                      />
                    </Form.Group>
                    {input_error.feeaddress ? <span
                      className="text-danger px-5 d-block"
                      style={{ marginLeft: "8rem" }}
                    >
                      Please insert a valid address.
                    </span> : null}

                  </Col>
                  <Col md={2}>
                    <Button
                      className="harvest_addbtn"
                      onClick={() => {
                        updateFeeAddr();
                      }}
                    >
                      Update
                    </Button>
                  </Col>
                  <hr />
                  <Col md={3}>Harvest Fee:</Col>
                  <Col md={7}>
                    <Form.Group className="mb-3 col-md-5 d-inline-block mx-5 amount-input">
                      <Form.Control
                        type="text"
                        id="harvestfee"
                        name="harvestfee"
                        onChange={(e) => {
                          set_value(e);
                          set_error("harvestfee", false);
                          if (e.target.value < 0) {
                            e.target.value = e.target.value * -1;
                          }
                        }}
                        value={input_value.harvestfee}
                      />
                    </Form.Group>
                    <Col md={10}>
                      {input_error.harvestfee ? <span
                        className="text-danger px-5 d-block"
                        style={{ width: "30vw" }}
                      >
                        Please insert a valid number
                      </span> : null}

                    </Col>
                  </Col>
                  <Col md={2}>
                    <Button
                      className="harvest_addbtn"
                      onClick={() => {
                        updateHarvestFee();
                      }}
                    >
                      Update
                    </Button>
                  </Col>
                  <hr />
                </Row>
              </Row>
            </Row>
          </Container>
          <Container
            style={{ display: !nft_isConnected ? "block" : "none", height: "50vh" }}
          >
            {/* <Account button_click={props.button_click} route={1} /> */}
            <Button
              className="harvest_addbtn"
              variant="danger m-5"
              onClick={() => {
                actioncreator.nft_connect();
              }}
            >
              Connect Your Wallet
            </Button>
          </Container>
        </Row>
      </Container>

    </Fragment>
  );
}

export default Ghosper;
