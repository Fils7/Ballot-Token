import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';
import { expect } from 'chai';

describe('CrowdFunding Contract', function () {
  let contract: Contract;
  let owner: Signer;
  let addr1: Signer;
  let tokenContract: Contract;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    const CrowdFunding = await ethers.getContractFactory('CrowdFunding');
    tokenContract = await CrowdFunding.deploy([await owner.getAddress()], 1, 'TokenContractAddress'); // specify required
    await contract.deployed();
  });

  it('Should start a campaign', async function () {
    const tokensGoal = 1000;
    const endDate = Math.floor(new Date().getTime() / 1000) + 3600; // One hour from now
    await contract.connect(owner).startVoting(tokensGoal, endDate);
    
    const campaign = await contract.campaigns(1);
    
    // Assert that the campaign details match the expected values
    expect(campaign.creator).to.equal(await owner.getAddress());
    expect(campaign.goal).to.equal(tokensGoal);
    expect(campaign.start).to.be.false;
    expect(campaign.endTime).to.equal(endDate);
    expect(campaign.signatures).to.equal(1);
    expect(campaign.claimed).to.be.false;
  });

  it('Should allow owner to claim tokens after campaign ends', async function () {
    const tokensGoal = 1000;
    const endDate = Math.floor(new Date().getTime() / 1000) + 3600; // One hour from now
    await contract.connect(owner).startVoting(tokensGoal, endDate);
    
    // Fund the campaign
    const campaignId = 1;
    const amountToFund = 100;
    await contract.connect(addr1).fundCampaing(campaignId, amountToFund);
  
    // Fast-forward time to after campaign end
    await ethers.provider.send('evm_increaseTime', [3601]); // Move time forward by 3601 seconds (1 hour and 1 second)
  
    // Claim tokens
    await contract.connect(owner).withdrawTokens(campaignId);
  
    const campaign = await contract.campaigns(campaignId);
    
    // Assert that tokens have been claimed
    expect(campaign.claimed).to.be.true;
  });
  it('Should allow users to refund if campaign fails or is canceled', async function () {
    const tokensGoal = 1000;
    const endDate = Math.floor(new Date().getTime() / 1000) + 3600; // One hour from now
    await contract.connect(owner).startVoting(tokensGoal, endDate);
    
    // Fund the campaign
    const campaignId = 1;
    const amountToFund = 100;
    await contract.connect(addr1).fundCampaing(campaignId, amountToFund);
  
    // Cancel the campaign
    await contract.connect(owner).cancelCampaign(campaignId);
  
    // Refund the user
    await contract.connect(addr1).refund(campaignId);
  
    const userBalance = await tokenContract.balanceOf(await addr1.getAddress());
    
    // Assert that the user has been refunded
    expect(userBalance).to.equal(amountToFund);
  });
  it('Should check if the campaign has ended', async function () {
    const tokensGoal = 1000;
    const endDate = Math.floor(new Date().getTime() / 1000) + 3600; // One hour from now
    await contract.connect(owner).startVoting(tokensGoal, endDate);
  
    const campaignId = 1;
    const campaign = await contract.campaigns(campaignId);
    
    // Check if the campaign has ended
    const hasEnded = await contract.viewBlock();
    
    // Assert that the campaign end time matches the expected end time
    expect(hasEnded).to.equal(campaign.endTime);
  });
  
  
});
