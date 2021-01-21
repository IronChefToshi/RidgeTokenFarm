pragma solidity ^0.5.0;

import "./BVRToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
	string public name = "Ridge Token Farm";
	address public owner;	
	BVRToken public bvrToken;
	DaiToken public daiToken;


	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;

	constructor(BVRToken _bvrToken, DaiToken _daiToken) public {
		bvrToken = _bvrToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	// 1. Stake Tokens (deposit)
	function stakeTokens(uint _amount) public {
		// Require amount greater than 0
		require(_amount > 0, "amount cannot be 0");

		// Transfer Mock Dai tokens here for staking
		daiToken.transferFrom(msg.sender, address(this), _amount);

		// Update Staking Balance
		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		// Add user to stakers array *only* if they havent already staked
		if(!hasStaked[msg.sender]) {
			stakers.push(msg.sender);
		}

		// Update Staking status
		isStaking[msg.sender] = true;
		hasStaked[msg.sender] = true;
	}

	//  Unstaking Tokens (Withdraw)
	function unstakeTokens() public {
		// Fetch staking balance
		uint balance = stakingBalance[msg.sender];

		// Require amount greater than zero
		require(balance > 0, "staking balance cannot be 0");

		// Transfer Mock Dai tokens to this contract for staking
		daiToken.transfer(msg.sender, balance);

		// Reset Staking balance
		stakingBalance[msg.sender] = 0;

		// Update staking balance
		isStaking[msg.sender] = false;
	}

	//  Issuing Tokens (Basically Interest) (Solidity 'Loop' from stakers mapping)
	function issueTokens() public {
		// Only owner can call this function
		require(msg.sender == owner, "caller must be the owner");

		// Issue tokens to all stakers
		for (uint i=0; i<stakers.length; i++) {
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			if(balance > 0) {
				bvrToken.transfer(recipient, balance);
			}
			
		}

	}
}