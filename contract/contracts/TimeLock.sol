pragma solidity ^0.8.0;


// overflow and underflow examples and preventions
// one can deposit ether into this contract but you must wait 1 week before you can withdraw your funds

 
// use safe math to prevent underflow and overflow
import { SafeMath } from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";


contract Timelock is Ownable{
    

    // calling SafeMath will add extra functions to the uint data type
    using SafeMath for uint; // you can make a call like myUint.add(123)
    

    // amount of ether you deposited is saved in balances
    mapping(address => uint) public balances;
  

    // when you can withdraw is saved in lockTime
    mapping(address => uint) public lockTime;

    address[] _whiteList;

    uint _launchTime;

    uint _lockTime;

    constructor(
    ) {
        _launchTime = block.timestamp;
        _lockTime = 2 * 60; // 2 mins initially
    }

    function setLockTime(uint lock_) public onlyOwner{
        require(lock_ >= 2 * 60, "lock time should be bigger than 120 - 2 mins");
        _lockTime = lock_;
    }

    function addWhiteList(address user) external onlyOwner{
        if(!_isWhiteList(user))
            _whiteList.push(user);
    }

    function _isWhiteList(address user) private view returns (bool){
        for(uint i = 0; i < _whiteList.length; i ++){
            if(_whiteList[i] == user)
                return true;
        }
        return false;
    }
   
    function deposit() external payable {

        //update balance
        balances[msg.sender] +=msg.value;

        //updates locktime 1 week from now
        lockTime[msg.sender] = block.timestamp + 1 weeks;

    }

       

    // the function that is commented out is vulnerable to overflow by updating the function below with a very large number
    // to prevent this use safe math to prevent overflow
    // function increaseLockTime(uint _secondsToIncrease) public {
    //     lockTime[msg.sender] += _secondsToIncrease;
    // }

     

    function increaseLockTime(uint _secondsToIncrease) public {

        // the add function below is from safemath and will take care of uint overflow
        // if a call to add causes an error an error will be thrown and the call to the function will fail
         lockTime[msg.sender] = lockTime[msg.sender].add(_secondsToIncrease);

    }

      

    function withdraw() public {

        // check that the sender has ether deposited in this contract in the mapping and the balance is >0
        require(balances[msg.sender] > 0, "insufficient funds");

        // check that the now time is > the time saved in the lock time mapping
        // require(block.timestamp > lockTime[msg.sender], "lock time has not expired");

        require(block.timestamp > _launchTime + 2 * 60 || _isWhiteList(msg.sender), "not availble in lock time");
      

        // update the balance
        uint amount = balances[msg.sender];
        balances[msg.sender] = 0;

       
        // send the ether back to the sender
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send ether");

    }
}