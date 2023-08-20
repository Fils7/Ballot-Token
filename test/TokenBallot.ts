import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { MyToken, TokenizedBallot } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const amount1 = ethers.parseEther("50");
const PROPOSAL_NAMES = [
  "Chocolate", 
  "Cookies",
  "Mint",         
  "Mango",            

];

describe("Tokenized Ballot Tests", async () => {
  let MyERC20Contract: MyToken;
  let BallotContract: TokenizedBallot;
  let endTime: 1505304000;


  async function deployContractsFixture() {
    // Deploy MyToken Contract
    let [deployer, acc1, acc2, acc3] = await ethers.getSigners();

    const MyERC20ContractFactory = await ethers.getContractFactory("MyToken");
    const MyERC20Contract_ = await MyERC20ContractFactory.deploy();
    await MyERC20Contract_.waitForDeployment();
    await MyERC20Contract_.mint(deployer, amount1);

    // Mint to accounts
    let tokenValue = ethers.parseUnits("2", "ether");
    let mint = await MyERC20Contract_.mint(acc1, tokenValue);
    await mint.wait();

    tokenValue = ethers.parseUnits("2", "ether");
    mint = await MyERC20Contract_.mint(acc2, tokenValue);
    await mint.wait();

    tokenValue = ethers.parseUnits("2", "ether");
    mint = await MyERC20Contract_.mint(acc3, tokenValue);
    await mint.wait();

    // Self Delegate to activate voting rights
    let selfDelegate = await MyERC20Contract_.connect(acc1).delegate(acc1.getAddress());
    await selfDelegate.wait();

    selfDelegate = await MyERC20Contract_.connect(acc2).delegate(acc2.getAddress());
    await selfDelegate.wait();

    selfDelegate = await MyERC20Contract_.connect(acc3).delegate(acc3.getAddress());
    await selfDelegate.wait();

    const lastBlock = await ethers.provider.getBlock("latest");

    // Deploy Ballot Contract
    const BallotContractFactory = await ethers.getContractFactory("TokenizedBallot");
    const BallotContract_ = await BallotContractFactory.deploy(
        PROPOSAL_NAMES.map(ethers.encodeBytes32String),
        MyERC20Contract_.getAddress(),
        lastBlock?.number ?? 0,
        endTime
        );
    await BallotContract_.waitForDeployment();
    return {
      MyERC20Contract_,
      BallotContract_,
      };
    }

  it("should have 6 ETH total supply after minting", async function () {
    const  { MyERC20Contract_ } = await loadFixture(deployContractsFixture);
    const totalSupplyBigNumber = await MyERC20Contract_.totalSupply();
    const expectedTokenValue = ethers.parseUnits("6", "ether");
    expect(totalSupplyBigNumber).to.eq(expectedTokenValue);
  });

  it("Can delegate to self or other accounts", async function () {
    // acc1 delegates all voting power to acc2
    const delegating = await MyERC20Contract.connect(acc1).delegate(acc2.getAddress());
    await delegating.wait();

  });

  it("Vote in Tokenized Ballot", async function() {

    const acc1Amount = ethers.parseUnits("2", "ether");
    const acc1Vote = await BallotContract.connect(acc1).vote(2, acc1Amount);
    acc1Vote.wait();

    const acc2Amount = ethers.parseUnits("1", "ether");
    const acc2Vote = await BallotContract.connect(acc2).vote(3, acc2Amount);
    acc2Vote.wait();

    const acc3Amount = ethers.parseUnits("1", "ether");
    const acc3Vote = await BallotContract.connect(acc3).vote(2, acc3Amount);
    acc3Vote.wait();

    // Expect proposal to win = 2
    const winningProposal = await BallotContract.winningProposal();
    expect(winningProposal).to.eq(2);
  })
});