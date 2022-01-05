import { React, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Table,  
  Form,  
} from "react-bootstrap";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import ToggleSwitch from "../toggleswitch/toggleswitch";
import toast, { Toaster } from 'react-hot-toast';
import stakeV0ABI from "../../ABI/stakeV0.json";
import stakeABI from "../../ABI/stake.json";
import ghspABI from "../../ABI/ghsp.json";
import { 
  IS_GHSP_CONNECTED,
  GHSP_BALANCE,
  GHSP_REWARD,
  GHSP_HARVESTHISTORY,
  GHSP_STAKEHISTORY,
  STAKE_BALANCE,
  REWARDPERSEC,
  IS_ADMIN,
  ADMIN_INFO,
  ADMIN_HARVEST_HISTORY,
  ADMIN_STAKE_HISTORY,
  ADMIN_IS_RUNNING,
  ALL_STAKES,
  // FEE_ADDRESS,
  // HARVEST_FEE,
  // UNSTAKE_FEE1,
  // UNSTAKE_FEE2,
  // UNSTAKE_FEE3,
  // UNSTAKE_FEE4,
  // UNSTAKE_FEE5,
  // ADMIN_TOTAL_SUPPLY,
  // ADMIN_STAKING_DAYS,  
  fromWEI,
  toWEI,
  TEST_CHAINID,
  MAIN_CHAINID,
  WALLET_ADDRESS,
  WEB3,
  TEST_STAKE_ADDRESS,
  TEST_STAKE_ADDRESS_V0,
  MAIN_STAKE_ADDRESS,
  MAIN_STAKE_ADDRESS_V0,
  MAIN_GHSP_ADDRESS,
  TEST_GHSP_ADDRESS,
  PREV_REWARDS,
  PREV_STAKES
} from "../../redux/constants";
import { useSelector } from "react-redux";
import * as actions from "../../redux/actions";
import { useActions } from "../../redux/useActions";
import { UpdateUnstakeFee } from "../updateunstakefee/updateunstakefee";
import { PRODUCT_MODE } from "../../config";

const STAKING_ADDRESS_V0 = PRODUCT_MODE ? MAIN_STAKE_ADDRESS_V0 : TEST_STAKE_ADDRESS_V0;
let GHSP_ADDRESS = PRODUCT_MODE ? MAIN_GHSP_ADDRESS : TEST_GHSP_ADDRESS;
let STAKE_ADDRESS = PRODUCT_MODE ? MAIN_STAKE_ADDRESS : TEST_STAKE_ADDRESS;

let CHAINID = PRODUCT_MODE ? MAIN_CHAINID : TEST_CHAINID;
const GHSP = (props) => {
  // connect action creator to component
  const actioncreator = useActions(actions);

  // action button
  /*
    .ghsp_harvest : harvest button
    .ghsp_stake : stake button
    .unghsp_stake : unstake button

  */

  function getFlooredFixed(v, d) {
      return (Math.floor(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  }

  // whether the wallet is connected or not-----------!!!temporary!!!=>redux------------
  const isConnected = useSelector((state) => state.wallet[IS_GHSP_CONNECTED]);
  const walletAddress = useSelector((state) => state.wallet[WALLET_ADDRESS]);
  const shortAddress =  walletAddress.slice(0, 10) + "..." + walletAddress.slice(walletAddress.length - 8, walletAddress.length);
  const web3 = useSelector((state) => state.wallet[WEB3]);
  const filterTransactions = useSelector((state) => state.wallet["filterTransactions"]);
  const curShowCnt = useSelector((state) => state.wallet["curShowCnt"]);
  const moreState = useSelector((state) => state.wallet["moreState"]);
  const balance = useSelector((state) =>    
    Number(getFlooredFixed(state.wallet[GHSP_BALANCE], 8))
  );
  const reward = useSelector((state) =>
    Number(getFlooredFixed(state.wallet[GHSP_REWARD], 8))
  );
  const rewardMobile = reward.toFixed(2);
  // const rewardNoRound = useSelector((state) =>
  //   getFlooredFixed(state.wallet[GHSP_REWARD], 8)
  // );
  //console.log("reward_________"+reward, "rewardNoRound_________"+rewardNoRound);
  const harvestHistory = useSelector(
    (state) => state.wallet[GHSP_HARVESTHISTORY]
  );
  const stakeHistory = useSelector((state) => state.wallet[GHSP_STAKEHISTORY]);
  const stakeBalance = useSelector((state) =>    
    Number(state.wallet[STAKE_BALANCE].toFixed(8))
  );
  const rewardPerSec = useSelector((state) =>    
    Number(getFlooredFixed(state.wallet[REWARDPERSEC], 8))
  );

  const is_admin = useSelector((state) => state.wallet[IS_ADMIN]);
  const admin_info = useSelector((state) => state.wallet[ADMIN_INFO]);
  const adminHarvestHistory = useSelector(
    (state) => state.wallet[ADMIN_HARVEST_HISTORY]
  );
  const adminStakeHistory = useSelector(
    (state) => state.wallet[ADMIN_STAKE_HISTORY]
  );
  const adminIsRunning = useSelector((state) => state.wallet[ADMIN_IS_RUNNING]);
  const allStakes = useSelector((state) => Number(state.wallet[ALL_STAKES]));
  // const admin_total_supply = useSelector((state) =>
  //   Number(state.wallet[ADMIN_TOTAL_SUPPLY])
  // );
  // const admin_staking_days = useSelector((state) =>
  //   Number(state.wallet[ADMIN_STAKING_DAYS])
  // );
  // const adminFeeAddress = useSelector((state) => state.wallet[FEE_ADDRESS]);
  // const adminHarvestFee = useSelector((state) =>
  //   Number(state.wallet[HARVEST_FEE])
  // );
  // const adminUnstakeFee1 = useSelector((state) =>
  //   Number(state.wallet[UNSTAKE_FEE1])
  // );
  // const adminUnstakeFee2 = useSelector((state) =>
  //   Number(state.wallet[UNSTAKE_FEE2])
  // );
  // const adminUnstakeFee3 = useSelector((state) =>
  //   Number(state.wallet[UNSTAKE_FEE3])
  // );
  // const adminUnstakeFee4 = useSelector((state) =>
  //   Number(state.wallet[UNSTAKE_FEE4])
  // );
  // const adminUnstakeFee5 = useSelector((state) =>
  //   Number(state.wallet[UNSTAKE_FEE5])
  // );
  
  const prevStakes = useSelector((state) =>    
    Number(getFlooredFixed(state.wallet[PREV_STAKES], 2))
  );

  const prevRewards = useSelector((state) =>    
    Number(getFlooredFixed(state.wallet[PREV_REWARDS], 4))
  );

  useEffect(() => {        
    async function fetchData () {
      await actioncreator.ghsp_connect();

      if(window.ethereum === undefined) {
        actioncreator.ghsp_disconnect();
        return false;
      }    
      
      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          await actioncreator.ghsp_connect();
          // getPreviousPoolInfo();
        }
        else {
          await actioncreator.ghsp_disconnect();
        }
      });
      const interval = setInterval(actioncreator.ghsp_updateReward, 1000);
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if(chainId !== CHAINID) {
        clearInterval(interval);
        actioncreator.ghsp_disconnect();
      }

      window.ethereum.on("chainChanged", async (chainId) => {
        if (chainId !== CHAINID) {
          clearInterval(interval);
          await actioncreator.ghsp_disconnect();
          return false;
        }
        setInterval(interval);
      });
      return async () => {            
        clearInterval(interval);      
        await actioncreator.ghsp_disconnect();      
        window.ethereum.off("chainChanged");
        window.ethereum.off("accountsChanged");
      }
    }
    fetchData();
  }, [actioncreator]);

  // 0:unstackonly, 1:stackonly
  const [stakeonlyShow, setStakeOnlyShow] = useState(1);
  // 0:unstackonly, 1:stackonly
  const [restakeOnlyShow, setRestakeOnlyShow] = useState(1);
  // 0:hide stack, 1:show stack
  const [stakeShow, setStakeShow] = useState(0);
  // 0:hide reward, 1:show reward
  const [rewardShow, setRewardShow] = useState(0);

  // 0:hide admin, 1:show admin
  const [adminShow, setAdminShow] = useState(0);

  // 0:depositOnly, 1:withdrawOnly
  const [depositOnlyShow, setDepositOnlyShow] = useState(1);

  // const [balStakeV0, setBalStakeV0] = useState("");

  // const [balRewardsV0, setBalRewardsV0] = useState("");

  // stake amount input value
  //const ghsp_stake_input = useRef(0);

  const [input_value, setInputValue] = useState({
    harvest:0,
    stake:0,
    unstake:0,
    deposit:0,
    withdraw:0,
    apy:0,
    period:0,
    feeaddress:0,
    harvestfee:0,
    unstakefee1:0,
    unstakefee2:0,
    unstakefee3:0,
    unstakefee4:0,
    unstakefee5:0,
  });

  const [input_error, setInputError] = useState({
    harvest:false,
    stake:false,
    unstake:false,
    deposit:false,
    withdraw:false,    
    apy:false,
    period:false,
    feeaddress:false,
    harvestfee:false,
    unstakefee1:false,
    unstakefee2:false,
    unstakefee3:false,
    unstakefee4:false,
    unstakefee5:false,
  });

  // useEffect(() => {
  //   let temp = input_value;
  //   temp.apy = admin_total_supply;
  //   temp.period = admin_staking_days;
  //   temp.feeaddress = adminFeeAddress;
  //   temp.harvestfee = adminHarvestFee;
  //   temp.unstakefee1 = adminUnstakeFee1;
  //   temp.unstakefee2 = adminUnstakeFee2;
  //   temp.unstakefee3 = adminUnstakeFee3;
  //   temp.unstakefee4 = adminUnstakeFee4;
  //   temp.unstakefee5 = adminUnstakeFee5;   
  //   setInputValue(temp);
  //   // getPreviousPoolInfo();
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
      array_history.sort(function(x, y){
        return x.timestamp - y.timestamp;
    })
    let date = [];
    let headDate = [];
    let length = array_history.length - 1;
    array_history.map((value) => {
      let d = new Date(value.timestamp * 1000);
      date.push(d.toLocaleString());
      headDate.push(d.toLocaleDateString());
      return value;
    });
    
    return array_history.map((value, index, array_history) => {
      if(array_history[length - index].length === 0) {
        return value;
      }
      let amount = fromWEI(array_history[length - index].returnValues.amount).toFixed(2);
      // sort = (sort !== "Harvest" ? (array_history[length-index].event === 'Stake' ? "Stake" : "Unstake") : "Harvest");
      sort = array_history[length-index].event;
      let percentFee = 0;
      let status = sort;
      if(sort === "UnStake") {
          percentFee = Number(Number(array_history[length - index].returnValues.unStakeFee) * 100 / (Number(array_history[length - index].returnValues.unStakeFee) + Number(array_history[length - index].returnValues.amount))).toFixed(0);
      }
      else if(sort === "Harvest") {
          percentFee = Number(Number(array_history[length - index].returnValues.harvestFee) * 100 / (Number(array_history[length - index].returnValues.harvestFee) + Number(array_history[length - index].returnValues.amount))).toFixed(0);
      }
      // return array_history.map((value, index, history_array) => {
      //   let amount = fromWEI(array_history[length - index]);
        return (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{date[length - index]}</td>
            <td>{amount}</td>
            <td>{percentFee}%</td>
            <td>
              {array_history[length - index] ? (
                <Badge pill bg="success text-white">
                  {status}
                  {/* {sort === "Staked" ? "Staked" : "success"} */}
                </Badge>
              ) : (
                <Badge pill bg="warning text-black">
                  {sort === "Stake" ? "Unstaked" : "pending"}
                </Badge>
              )}
            </td>
          </tr>
        );
      });
    }
  }

  //console.log(get_history(harvestHistory));

  function harvest(restake = false) {
    set_error("harvest", false);  

    // if (
    //   !input_value.harvest ||
    //   input_value.harvest <= 0 ||
    //   input_value.harvest > Number(reward)
    // ) {
    if(Number(reward) <= 0) {
      set_error("harvest", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    // actioncreator.ghsp_harvest(input_value.harvest);
    actioncreator.ghsp_harvest(web3, walletAddress, restake);
  }

  function stake() {
    set_error("stake", false);    

    if (
      !input_value.stake ||
      input_value.stake <= 0 ||
      input_value.stake > Number(balance)
    ) {

      set_error("stake", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.ghsp_stake(web3, walletAddress, input_value.stake);
  }

  function unstake() {
    set_error("unstake", false); 

    if (
      !input_value.unstake ||
      input_value.unstake <= 0 ||
      input_value.unstake > Number(stakeBalance)
    ) {
      set_error("unstake", true); 

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.ghsp_unstake(web3, walletAddress, input_value.unstake);
  }

  function deposit() {
    set_error("deposit", false); 

    if (
      !input_value.deposit ||
      input_value.deposit <= 0 ||
      input_value.deposit > balance
    ) {
      set_error("deposit", true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.admin_deposit(input_value.deposit);
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
    actioncreator.admin_withdraw(input_value.withdraw);
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
    actioncreator.adminUpdateAPY(
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
    actioncreator.admin_updateFeeAddr(input_value.feeaddress);
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
    actioncreator.admin_updateHarvestFee(input_value.harvestfee);
  }

  function updateUnstakeFee(id, value) {
    set_error("unstakefee"+id, false);
    console.log("-----------ERROR---------------", value);

    if (value === "" || 0 > value || value >= 100) {
      set_error("unstakefee"+id, true);

      console.log("-----------ERROR---------------");
      return false;
    }
    actioncreator.admin_updateUnstakeFee(id, value);
  }

  const onClickMigrate = async () => {
    //Unstake
    // console.log("setUnStake: ", prevStakes);

    if(Number(prevStakes) + Number(prevRewards) <= 0) {
      // alert("Fail to Migration because there are no Stakes and Rewards.")
      toast.error("Fail to Migration because there are no Stakes and Rewards!");
      return;
    }
    const stakeTokenV0 = new web3.eth.Contract(stakeV0ABI, STAKING_ADDRESS_V0);

    let amountVal = toWEI(prevStakes);
    // amountVal = toWEI("10");
    if(amountVal > 0) {
        actioncreator.spinner_show(true, "Requesting UnStake to Previous Contract...");
        
        await stakeTokenV0.methods
        .unstake(amountVal.toString(10))
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

    amountVal = toWEI(prevRewards);
    // amountVal = toWEI("1");
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
          let eventData = res.events.UnStaked;
          if(eventData === undefined || eventData === null) {
            actioncreator.spinner_show();
            return;
          }
          else {
            actioncreator.spinner_show(true, "Finish Harvest from Previous Contract...");
          }
        });
    }

    //stake
    const ghspToken = new web3.eth.Contract(ghspABI, GHSP_ADDRESS);

    const stakeToken = new web3.eth.Contract(stakeABI, STAKE_ADDRESS);

    amountVal = Number(prevStakes);
    // amountVal = 10;
    if(amountVal > 0) {
        amountVal = toWEI(amountVal + "");
        actioncreator.spinner_show(true, "Requesting Approval...");
        await ghspToken.methods
        .approve(STAKE_ADDRESS, amountVal.toString(10))
        .send({ from: walletAddress }, function (err, res) {
            if (err) {
                console.log("An error occured", err);
                actioncreator.spinner_show();
                return;
            }
            actioncreator.spinner_show(true, "Processing Approval...");
            return res;
        });
        // console.log(approve);

        actioncreator.spinner_show(true, "Requesting Stake...");
        await stakeToken.methods
        .stake(amountVal.toString(10))
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
          let eventData = res.events.Stake;
          if(eventData === undefined || eventData === null) {
              actioncreator.spinner_show(false);
              return;
          }
          actioncreator.ghsp_connect();
        });
    }
    else if(prevRewards > 0){
      actioncreator.ghsp_connect();
    }
  }

  const [loading, setLoading] = useState(false);
  const historyMore = async () => {
    setLoading(true);
    actioncreator.getHistory(web3, walletAddress, stakeHistory, harvestHistory, filterTransactions, curShowCnt);
  }

  useEffect(()=>{
    setLoading(false);
  }, [curShowCnt])

  return (
    <Container fluid className="farming-container">
      <div><Toaster toastOptions={{className : 'm-toaster', duration : 3000, style : { fontSize: '12px' }}}/></div>
      <Row>
        <Container
          className="harvest-container"
          style={{ display: isConnected ? "block" : "none" }}
        >
          <Row className="migrate-toggle-row">
            <Col md={7} className="score-col prev-info">
              <span className="prev-text">Previous Pool Info:</span>
              <br /><br />
              <span className="value-panel">Stakes:</span><span className="balance-span"> {prevStakes} GHSP</span>
              <span className="value-panel">Rewards:</span><span className="balance-span"> {prevRewards} GHSP</span>
            </Col>
            <Col md={1}></Col>
            <Col md={3} className="migrate-col">
              <Button
                className="harvest_addbtn ghsp_harvest buy"
                onClick={() => {
                  onClickMigrate();
                }}
              >
                Migrate
              </Button>
            </Col>
          </Row>
          <Row className="migrate-toggle-row-mobile">
            <Col md={7} className="score-col prev-info">
              <p className="prev-text">Previous Pool Info:</p>
              <span className="value-panel">Stakes:</span><span className="balance-span"> {prevStakes} GHSP</span>
              <br />
              <span className="value-panel">Rewards:</span><span className="balance-span"> {prevRewards} GHSP</span>
            </Col>
            <Col md={1}></Col>
            <Col md={3} className="migrate-col d-flex">
              <Button
                className="harvest_addbtn ghsp_harvest buy m-auto"
                onClick={() => {
                  onClickMigrate();
                }}
              >
                Migrate
              </Button>
            </Col>
          </Row>
          <Row className="farming-toggle-row">
            <Col md={8} className="score-col">
              Your Account:
              <div>
                <span className="address-span">{walletAddress}</span>
                <span className="address-span-mobile">{shortAddress}</span>
              </div>
              <br />
              Balance:<span className="balance-span"> {balance} GHSP</span>
            </Col>
            <Col md={3} className="d-flex">
              <Button
                target="_blank"
                href="https://pancakeswap.finance/swap?outputCurrency=0x4a0cc0876ec16428a4fa4a7c4c300de2db73b75b"
                className="harvest_addbtn ghsp_harvest buy m-auto"
              >
                Buy GHSP$
              </Button>
            </Col>
          </Row>
          <Row className="harvest-row">
            <Row
              onClick={() => {
                setRewardShow(!rewardShow);
              }}
            >
              <Col md={10} className="harvest-header">
                Rewards:
                <span className="harvest-value">
                  {reward} &nbsp;GHSP &nbsp; (+{Number(reward) === 0 || Number(allStakes) === 0 ? 0 : (Number(rewardPerSec) * Number(stakeBalance / allStakes)).toFixed(10)} GHSP / Block)
                </span>
                <span className="harvest-value-mobile">
                  {rewardMobile} GHSP &nbsp;(+{Number(reward) === 0 || Number(allStakes) === 0 ? 0 : (Number(rewardPerSec) * Number(stakeBalance / allStakes)).toFixed(4)} GHSP / Block)
                </span>
              </Col>
              <Col md={2} className="harvest-header">
                {rewardShow ? (
                  <FaAngleUp></FaAngleUp>
                ) : (
                  <FaAngleDown></FaAngleDown>
                )}
              </Col>
            </Row>
            <Row
              className="harvest-addrow"
              style={{ display: rewardShow ? "flex" : "none" }}
            >
              <Row className="px-0 mx-0 harvest-switch">
                <Col md={2}>
                  <span className="toggle-stake">Harvest / Restake:</span>
                </Col>
                <Col md={1}>
                  <ToggleSwitch
                    click={setRestakeOnlyShow}
                    onlyShow={restakeOnlyShow}
                  />
                </Col>
              </Row>
              <div className="px-0 mx-0 harvest-switch-mobile">
                  <div className="d-flex m-auto">
                    <span className="toggle-stake">Harvest / Restake:</span>
                    <ToggleSwitch
                      click={setRestakeOnlyShow}
                      onlyShow={restakeOnlyShow}
                    />
                  </div>
              </div>
              <Row className="px-0 mx-0"
                style={{ display: restakeOnlyShow ? "flex" : "none" }}>
                <Col md={10}>
                </Col>
                <Col md={2} className="d-flex">
                  <Button
                    className="harvest_addbtn ghsp_harvest m-auto"
                    onClick={() => {
                      harvest(true);
                    }}
                  >
                    ReStake
                  </Button>
                </Col>
              </Row>
              <Row
                className="px-0 mx-0"
                style={{ display: !restakeOnlyShow ? "flex" : "none" }}
              >
                <Col md={10}>
                </Col>
                <Col md={2} className="d-flex">
                  <Button
                    className="harvest_addbtn unghsp_stake_btn m-auto"
                    onClick={() => {
                      harvest(false);
                    }}
                  >
                    Harvest
                  </Button>
                </Col>
              </Row>
              {/* <hr /> */}
              <Row hidden className="history-row mt-3 mb-0">Harvest History</Row>
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
            <Row
              onClick={() => {
                setStakeShow(!stakeShow);
              }}
            >
              <Col md={10} className="harvest-header">
                Stakes:
                <span className="mr-4 stake-value">
                  {stakeBalance} &nbsp;GHSP (
                  {allStakes !== 0
                    ? Number(((stakeBalance / allStakes) * 100).toFixed(2))
                    : 0}
                  % in the pool)
                </span>
                <span className="mr-4 stake-value-mobile">
                  {stakeBalance} &nbsp;GHSP <br/>
                  (
                  {allStakes !== 0
                    ? Number(((stakeBalance / allStakes) * 100).toFixed(2))
                    : 0}
                  % in the pool)
                </span>
              </Col>
              <Col md={2} className="harvest-header">
                {stakeShow ? (
                  <FaAngleUp></FaAngleUp>
                ) : (
                  <FaAngleDown></FaAngleDown>
                )}
              </Col>
            </Row>
            <Row
              className="harvest-addrow"
              style={{ display: stakeShow ? "flex" : "none" }}
            >
              <Row className="px-0 mx-0 harvest-switch">
                <Col md={2}>
                  <span className="toggle-stake">Unstake / Stake:</span>
                </Col>
                <Col md={1}>
                  <ToggleSwitch
                    click={setStakeOnlyShow}
                    onlyShow={stakeonlyShow}
                  />
                </Col>
              </Row>
              <div className="px-0 mx-0 harvest-switch-mobile">
                  <div className="d-flex m-auto">
                    <span className="toggle-stake">Unstake / Stake:</span>
                    <ToggleSwitch
                      click={setStakeOnlyShow}
                      onlyShow={stakeonlyShow}
                    />
                  </div>
              </div>
              <hr />
              <Row
                className="px-0 mx-0"
                style={{ display: stakeonlyShow ? "flex" : "none" }}
              >
                <Col md={10}>
                  Amount:
                  <span
                    onClick={() => {
                      set_max('stake', balance);
                    }}
                  >
                    MAX
                  </span>
                  <Form.Group className="mb-3 col-md-4 d-inline-block ms-3 amount-input">
                    <Form.Control
                      type="number"                      
                      id="stake" name="stake"
                      value={input_value.stake}
                      min={0}
                      onChange={(e) => {
                        set_value(e);
                        set_error("stake", false);
                        
                        // console.log(input_error.stake);
                        if (e.target.value < 0) {
                          e.target.value = e.target.value * -1;
                        }
                      }}
                    />
                  </Form.Group>                  

                  { input_error.stake ? <span
                    className="text-danger px-5 d-block"                    
                    style={{marginLeft: "8rem" }}
                  >
                    Please insert a valid number
                  </span> : null}
                </Col>
                <Col md={2} className="d-flex">
                  <Button
                    className="harvest_addbtn ghsp_stake_btn m-auto"
                    onClick={() => {
                      stake();
                    }}
                  >
                    Stake
                  </Button>
                </Col>
              </Row>
              <Row
                className="px-0 mx-0"
                style={{ display: !stakeonlyShow ? "flex" : "none" }}
              >
                <Col md={10}>
                  Amount:
                  <span
                    onClick={() => {
                      set_max('unstake', stakeBalance);
                    }}
                  >
                    MAX
                  </span>
                  <Form.Group className="mb-3 col-md-4 d-inline-block ms-3 amount-input">
                    <Form.Control
                      type="number"
                      name = "unstake"
                      id="unstake"
                      value={input_value.unstake}
                      min={0}
                      onChange={(e) => {
                        set_value(e);
                        set_error("unstake", false);
                        if (e.target.value < 0) {
                          e.target.value = e.target.value * -1;
                        }
                      }}
                    />
                  </Form.Group>
                  { input_error.unstake ? <span
                    className="text-danger px-5 d-block"                    
                    style={{marginLeft: "8rem" }}
                  >
                    Please insert a valid number
                  </span> : null}
                </Col>
                <Col md={2} className="d-flex">
                  <Button
                    className="harvest_addbtn unghsp_stake_btn m-auto"
                    onClick={() => {
                      unstake();
                    }}
                  >
                    Unstake
                  </Button>
                </Col>
              </Row>
              <Row hidden className="history-row mt-3 mb-0">Stake History</Row>
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
                    {get_history(stakeHistory, "stake")}                    
                  </tbody>
                </Table>
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
          </Row>
          <Row
            className="harvest-row"
            style={{ display: is_admin ? "flex" : "none" }}
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
                      set_max('deposit', balance);
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
                  { input_error.deposit ? <span
                    className="text-danger px-5 d-block"                    
                    style={{marginLeft: "8rem" }}
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
                      name = "withdraw"
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
                  { input_error.withdraw ? <span
                    className="text-danger px-5 d-block"                    
                    style={{marginLeft: "8rem" }}
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
                      <th>Amount</th>
                      <th>Fee</th>
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
                      <th>Amount</th>
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
                    click={actioncreator.setIsRunning}
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
                      name = "apy"
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
                { input_error.apy ? <span
                    className="text-danger px-5 d-block mx-xs-0"
                    style={{marginLeft: "13rem" }}
                  >
                    Please insert a valid number - must be bigger than 10K.
                  </span> : null}
                </Col>
                <Col md={2}>Period:</Col>
                <Col md={8}>
                  <Form.Group className="mb-3 col-md-5 d-inline-block mx-5 amount-input">
                    <Form.Control
                      type="number"
                      name = "period"
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
                  { input_error.period ? <span
                    className="text-danger px-5 d-block"                    
                    style={{display: "none",
                    marginLeft: "13rem",}}
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
                      id="feeadress"
                      name = "feeadress"
                      value={input_value.feeaddress}
                      min={0}
                      onChange={(e) => {
                        set_value(e);
                        set_error("feeaddress", false);
                      }}
                    />
                  </Form.Group>
                  { input_error.feeaddress ? <span
                    className="text-danger px-5 d-block"                    
                    style={{marginLeft: "8rem" }}
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
                      name = "harvestfee"
                      onChange={(e) => {
                        set_value(e);
                        set_error("harvestfee", false);
                        if (e.target.value < 0) {
                          e.target.value = e.target.value * -1;
                        }
                      }}
                      value = {input_value.harvestfee}
                    />
                  </Form.Group>
                  <Col md={10}>                    
                    { input_error.harvestfee ? <span
                    className="text-danger px-5 d-block"                    
                    style={{width: "30vw" }}
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
                <UpdateUnstakeFee title="Unstake Fee1" period={` > 30 days`} name="unstakefee1" set_value={set_value}  set_error={set_error} input_error={input_error} input_value={input_value} idNum = {1} updateUnstakeFee={updateUnstakeFee}></UpdateUnstakeFee>
                <UpdateUnstakeFee title="Unstake Fee2" period={` <= 30 days`} name="unstakefee2" set_value={set_value}  set_error={set_error} input_error={input_error} input_value={input_value} idNum = {2} updateUnstakeFee={updateUnstakeFee}></UpdateUnstakeFee>
                <UpdateUnstakeFee title="Unstake Fee3" period={` <= 21 days`} name="unstakefee3" set_value={set_value}  set_error={set_error} input_error={input_error} input_value={input_value} idNum = {3} updateUnstakeFee={updateUnstakeFee}></UpdateUnstakeFee>
                <UpdateUnstakeFee title="Unstake Fee4" period={` <= 14 days)`} name="unstakefee4" set_value={set_value}  set_error={set_error} input_error={input_error} input_value={input_value} idNum = {4} updateUnstakeFee={updateUnstakeFee}></UpdateUnstakeFee>
                <UpdateUnstakeFee title="Unstake Fee5" period={` <= 7 days`} name="unstakefee5" set_value={set_value}  set_error={set_error} input_error={input_error} input_value={input_value} idNum = {5} updateUnstakeFee={updateUnstakeFee}></UpdateUnstakeFee>
                {/* <Col md={3}>Unstake Fee1 ({` > 30 days`}):</Col>
                <Col md={7}>
                  <Form.Group className="mb-3 col-md-5 d-inline-block mx-5 amount-input">
                    <Form.Control
                      type="text"
                      id="unstakeFee_input1"
                      name = "unstakefee1"
                      value={input_value.unstakefee1}
                      onChange={(e) => {
                        set_value(e);
                        set_error("unstakefee1", false);
                        if (e.target.value < 0) {
                          e.target.value = e.target.value * -1;
                        }
                      }}
                    />
                  </Form.Group>
                  { input_error.unstakefee1 ? <span
                    className="text-danger px-5 d-block"                    
                  >
                    Please insert a valid number
                  </span> : null}

                </Col>
                <Col md={2}>
                  <Button
                    className="harvest_addbtn"
                    onClick={() => {
                      updateUnstakeFee(
                        1,
                        input_value.unstakefee1
                      );
                    }}
                  >
                    Update
                  </Button>
                </Col> */}              
              </Row>
            </Row>
          </Row>
        </Container>
        <Container
          style={{ display: !isConnected ? "block" : "none", height: "50vh" }}
        >
          {/* <Account button_click={props.button_click} route={1} /> */}
          <Button
            className="harvest_addbtn"
            variant="danger m-5"
            onClick={() => {
              actioncreator.ghsp_connect();
            }}
          >
            Connect Your Wallet
          </Button>
        </Container>
      </Row>
    </Container>
  );
};

export default GHSP;
