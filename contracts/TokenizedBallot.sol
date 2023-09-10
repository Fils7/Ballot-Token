// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title DAO COntract

interface IMyToken {
    function transfer(address, uint) external returns (bool);
    function transferFrom( address, address, uint) external returns (bool);
}

contract CrowdFunding  {
    IMyToken public immutable tokenContract;

    struct Campaign {

        address creator; // Creator of that campaign
        uint goal; // Tokens to reach
        uint pledged; // Tokens pledged for the campaingn
        uint startDate;   // When the voting starts
        uint endTime;   // When the voting ends
        bool claimed;  // If the owner of that campaign claims the tokens
        
    }

    // Mapping to connect campaign to their ID
    mapping(uint => Campaign) public campaigns;

    // a mapping to link the user's address and the number of tokens
    // they pledged, and another mapping to link the campaign id. 
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    uint numberOfCampaigns; // Keeps track of Campaigns
    uint256 public endDate; // Specify end of the voting
    bool public hasEnded; // Checks if campaign already ended


    constructor(address _tokenContract) {
        tokenContract = IMyToken(_tokenContract);
        endVoting = _endVoting;
    }

    
    function startVoting(uint _tokensGoal, uint _start, uint _endDate) external {
        require(_start >= block.timestamp,"Start time is less than current Block Timestamp");
        require(_endDate > _startAt,"End time is less than Start time");

        // Number of Campaigns increases by 1
        numberOfCampaigns += 1;
        campaigns[numberOfCampaigns] = Campaign ({
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startDate: _start,
            endTime: _endDate,
            claimed: false

        })

        // TODO: Emit an event
    }

    // Creator can end the campaign if it's not open already
    function cancelCampaign(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "You did not create the Campaign");
        require(block.timestamp < campaign.startDate, "Campaign has already started, cannot cancel it");

        delete campaigns[_id];
        // TODO: Emit an event
    }

    // Fund a campaign
    function fundCampaing(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startDate, "Campaign hasn't started");
        require(block.timestamp <= campaign.endDate, "Campaign is over");
        campaign.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;
        token.transferFrom(msg.sender, address(this), _amount)

    }

    // Delete the pledged amount
    function cancelFundingAmount (uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startDate, "Campaign hasn't started");
        require(block.timestamp <= campaign.endDate, "Campaign is over");
        require(pledgedAmount[_id][msg.sender] >= _amount, "You do not have those tokens to unpledge");
        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        token.transfer(msg.sender, _amount);

        // TODO: Emit an event
    }

    // TODO: Function for the owner to claim the tokens raised
    // after the campaign end

    // TODO: Function to refund users if the campaign does not reach the goal
    // only after campaign ends


    // Function to querry on chain
    function votingEnded() public view returns (bool) {
        return hasEnded;
    }

}
