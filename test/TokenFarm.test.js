const BVRToken = artifacts.require('BVRToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n) {
	return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {
	let daiToken, bvrToken, tokenFarm

	before(async () => {
		// Load Contracts
		daiToken = await DaiToken.new()
		bvrToken = await BVRToken.new()
		tokenFarm = await TokenFarm.new(bvrToken.address, daiToken.address)

		// Transfer BVR tokens to farm (1 million)
		await bvrToken.transfer(tokenFarm.address, tokens('1000000'))

		// Send tokens to investor
		await daiToken.transfer(investor, tokens('100'), { from: owner })
	})

	// Write Tests Inside Here..
	describe('Mock DAI deployment', async () => {
		it('has a name', async () => {
			let daiToken = await DaiToken.new()
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('BVR Token deployment', async () => {
		it('has a name', async () => {
			const name = await bvrToken.name()
			assert.equal(name, 'Ridge Token')
		})
	})

	describe('Token Farm deployment', async () => {
		it('has a name', async () => {
			const name = await tokenFarm.name()
			assert.equal(name, 'Ridge Token Farm')
		})

		it('contract has tokens', async () => {
			let balance = await bvrToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Farming tokens', async () => {

		it('rewards investors for staking mDai tokens', async () => {
			let result
			// Check investor balance before staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallett balance correct before staking')

			// Stake Mock DAI Tokens
			await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
			await tokenFarm.stakeTokens(tokens('100'), { from: investor })

			// Check staking result
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

			// Issue Tokens
			await tokenFarm.issueTokens({ from: owner })

			// Check balances after issuance
			result = await bvrToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Ridge Token wallett balance correct after issuance')

			// Only owner can issue tokens
			await tokenFarm.issueTokens({ from: investor }).should.be.rejected; 

			// unstake tokens
			await tokenFarm.unstakeTokens({ from: investor })

			// Check results after staking
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
		})
	})
})