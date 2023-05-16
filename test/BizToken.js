const { expect } = require('chai');
const {
	time,
	loadFixture,
} = require('@nomicfoundation/hardhat-network-helpers');

describe('BizToken', function () {
	async function deployBIZFixture() {
		// Contracts are deployed using the first signer/account by default
		const [owner, user1, user2] = await ethers.getSigners();

		const BizTokenFactory = await ethers.getContractFactory('BizToken');
		BizToken = await BizTokenFactory.deploy(
			100000, // MAX_SUPPLY
			10000, // MIN_SUPPLY
			20, // mintAmount
			100, // burnAmount
			3600, // mintDuration
			86400, // burnDuration
			20000 // mintToOwner
		);
		await BizToken.deployed();

		return { BizToken, owner, user1, user2 };
	}

	it('should initialize the contract with the correct values', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);

		expect(await BizToken.name()).to.equal('BizToken');
		expect(await BizToken.symbol()).to.equal('BIZ');
		expect(await BizToken.decimals()).to.equal(18);
		expect(await BizToken.totalSupply()).to.equal(20000);
		expect(await BizToken.MAX_SUPPLY()).to.equal(100000);
		expect(await BizToken.MIN_SUPPLY()).to.equal(10000);
		expect(await BizToken.mintAmount()).to.equal(20);
		expect(await BizToken.burnAmount()).to.equal(100);
		expect(await BizToken.mintDuration()).to.equal(3600);
		expect(await BizToken.burnDuration()).to.equal(86400);
		expect(await BizToken.owner()).to.equal(owner.address);
	});

	it('should allow the owner to set new mint/burn durations and amounts', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		const newMintDuration = 7200;
		const newBurnDuration = 172800;
		const newMintAmount = 30;
		const newBurnAmount = 200;

		// Set new mint/burn durations and amounts
		await BizToken.setNewMintDuration(newMintDuration);
		await BizToken.setNewBurnDuration(newBurnDuration);
		await BizToken.setNewMintAmount(newMintAmount);
		await BizToken.setNewBurnAmount(newBurnAmount);

		// Check that the new values were set correctly
		expect(await BizToken.mintDuration()).to.equal(newMintDuration);
		expect(await BizToken.burnDuration()).to.equal(newBurnDuration);
		expect(await BizToken.mintAmount()).to.equal(newMintAmount);
		expect(await BizToken.burnAmount()).to.equal(newBurnAmount);
	});

	it('should allow the owner to pause and unpause the contract', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		// Pause the contract
		await BizToken.pauseContract();
		expect(await BizToken.isPaused()).to.be.true;

		// Unpause the contract
		await BizToken.unpauseContract();
		expect(await BizToken.isPaused()).to.be.false;
	});

	it('should allow a user to request tokens', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		// Request tokens as user1
		await BizToken.connect(user1).requestTokens();

		// Check that user1 received the correct number of tokens
		expect(await BizToken.balanceOf(user1.address)).to.equal(20);

		// Wait for the mint duration to pass
		const newTimestamp = await time.latest();
		await time.increaseTo(3600 + newTimestamp);

		// Request tokens again as user1
		await BizToken.connect(user1).requestTokens();

		// Check that user1 received the correct number of tokens
		expect(await BizToken.balanceOf(user1.address)).to.equal(40);
		await BizToken.connect(user2).requestTokens();

		// Check that user2 received the correct number of tokens
		expect(await BizToken.balanceOf(user2.address)).to.equal(20);
	});

	it('should not allow a user to request tokens when paused', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		// Pause the contract
		await BizToken.pauseContract();

		// Try to request tokens as user1
		await expect(BizToken.connect(user1).requestTokens()).to.be.revertedWith(
			'Contract currently paused'
		);

		// Wait for the mint duration to pass
		const newTimestamp = await time.latest();
		await time.increaseTo(3600 + newTimestamp);

		// Try to request tokens as user1
		await expect(BizToken.connect(user1).requestTokens()).to.be.revertedWith(
			'Contract currently paused'
		);

		// Unpause the contract
		await BizToken.unpauseContract();

		// Request tokens as user1
		await BizToken.connect(user1).requestTokens();

		// Check that user1 received the correct number of tokens
		expect(await BizToken.balanceOf(user1.address)).to.equal(20);
	});

	it('should allow the owner to set a new mint duration', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		// Set a new mint duration as the owner
		await BizToken.connect(owner).setNewMintDuration(7200);

		// Request tokens as user1
		await BizToken.connect(user1).requestTokens();

		// Wait for the new mint duration to pass
		const newTimestamp = await time.latest();
		await time.increaseTo(7200 + newTimestamp);

		// Request tokens again as user1
		await BizToken.connect(user1).requestTokens();

		// Check that user1 received the correct number of tokens
		expect(await BizToken.balanceOf(user1.address)).to.equal(40);
	});

	it('should allow the owner to set a new burn duration', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		// Set a new burn duration as the owner
		await BizToken.connect(owner).setNewBurnDuration(172800);

		// Burn tokens as the owner
		await BizToken.burnToken();

		// Wait for the new burn duration to pass
		const newTimestamp = await time.latest();
		await time.increaseTo(172800 + newTimestamp);

		// Burn tokens again as the owner
		await BizToken.burnToken();

		// Check that the total burnt amount is correct
		expect(await BizToken.totalBurntAmount()).to.equal(200);
	});

	it('should allow the owner to set a new mint amount', async function () {
		const { BizToken, owner, user1, user2 } = await loadFixture(
			deployBIZFixture
		);
		// Set a new mint amount as the owner
		await BizToken.connect(owner).setNewMintAmount(30);

		// Request tokens as user1
		await BizToken.connect(user1).requestTokens();

		// Wait for the mint duration to pass
		const newTimestamp = await time.latest();
		await time.increaseTo(3600 + newTimestamp);

		// Request tokens again as user1
		await BizToken.connect(user1).requestTokens();

		// Check that user1 received the correct number of tokens
		expect(await BizToken.balanceOf(user1.address)).to.equal(60);
	});
});
