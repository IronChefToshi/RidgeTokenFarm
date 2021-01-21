const BVRToken = artifacts.require('BVRToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
	// Deploy Mock DAI Token
	await deployer.deploy(DaiToken)
	const daiToken = await DaiToken.deployed()

	// Deploy BVRToken
	await deployer.deploy(BVRToken)
	const bvrToken = await BVRToken.deployed()

	// Deploy TokenFarm
	await deployer.deploy(TokenFarm, bvrToken.address, daiToken.address)
	const tokenFarm = await TokenFarm.deployed()

	// Trasnfer all tokens to TokenFarm (1 million
	await bvrToken.transfer(tokenFarm.address, '1000000000000000000000000')

	// Transfer 100 Mock DAI tokens to investor
	await daiToken.transfer(accounts[1], '100000000000000000000')
}	