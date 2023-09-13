// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;
/** 
 * @title   DAOsigs - A DAO / CrowdFunding contract integrated with a multi-signature wallet when deployed
 * @author  
 * @dev     Supports ERC-20 interface.
 * @notice  This is a basic crowd funding / DAO contract with a multi-signature 
 * feature. This requires the need for owners to sign function calls to submit an action. 
*/

interface IMyToken {
    function transfer(address, uint) external returns (bool);
    function transferFrom( address, address, uint) external returns (bool);
    function mint(address to, uint256 amount) external;

}

contract CrowdFunding  {

    IMyToken public immutable tokenContract;

event Start(
        uint id,
        address indexed creator,
        uint goal,
        uint256 end
    );

    event FundedCampaign (uint indexed id, address indexed caller, uint amount);
    event Cancel (uint indexed id);
    event CancelFunding (uint indexed id, address indexed caller, uint amount);
    event ClaimTokens (uint id);
    event RefundCampaign (uint id, address indexed caller, uint amount);

    struct Campaign {

        address creator; // Creator of that campaign.
        uint goal; // Tokens to reach
        uint pledged; // Tokens pledged for the campaingn.
        bool start;   // If the campaign has started.
        uint endTime;   // When the voting ends.
        uint signatures; // Stores the number of signatures.
        bool claimed;  // If the owner of that campaign claimed the tokens.
    }

    // Array of owners for each campaign.
    address [] public contractOwners;
    mapping(address => bool) public OwnersCheck;

    // Stores the required Signatures passed in the constructor().
    uint public requiredSignatures;
    
    // This maping of owners will return who signed for withdrawal of funds,
    // starting from: Index of the campaign => address of owner => bool if signed or not.
    mapping(uint => mapping(address => bool)) public whoSigned;

    // Mapping to connect campaign to their ID.
    mapping(uint => Campaign) public campaigns;

    // a mapping to link the user's address and the number of tokens.
    // they pledged, and another mapping to link the campaign id. 
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    // Check who voted in that campaign.
    mapping (uint => mapping (address => bool)) public whoPledged;

    uint numberOfCampaigns; // Keeps track of Campaigns.
    uint256 public endTime; // Specify end of the voting.


    // @dev Checks if one of the addresses in array contractOwners is msg.sender.
    
    modifier ownerOnly() {
        require(OwnersCheck[msg.sender], "You're not an owner of this DAO");
        _;
    }

    // @dev Checks who funded a campaign when calling refund function.

    modifier pledgedAddress(uint _id) {
        require(whoPledged[_id][msg.sender] == true, "You did not participate in this campaign");
        _;
    }


    constructor(address[] memory _owners, uint _signaturesRequired, address _tokenContract) {
        require(_owners.length > 0, "Not enough owners");
        require(_signaturesRequired > 0 && _signaturesRequired <= _owners.length, "Signatures required must be greater than 0 and less than the owners defined ");

        for (uint i; i < contractOwners.length; i++) {
            address owner = _owners[i];
            require(! OwnersCheck[owner], "Owner not unique");
            OwnersCheck[owner] = true;
            contractOwners.push(owner);
        }

        _signaturesRequired = requiredSignatures;
        tokenContract = IMyToken(_tokenContract);
        
    }

    
    function startVoting(uint _tokensGoal, uint256 _endDate) public ownerOnly {
        require(_endDate > block.timestamp,"End time is less than current block");
    

        // Number of Campaigns increases by 1
        numberOfCampaigns += 1;
        campaigns[numberOfCampaigns] = Campaign ({
            creator: msg.sender,
            goal: _tokensGoal,
            pledged: 0,
            start: false,
            endTime: _endDate,
            signatures: 1,
            claimed: false
        });


        whoSigned[numberOfCampaigns][msg.sender] = true;
        
        emit Start(numberOfCampaigns, msg.sender, _tokensGoal, _endDate);

    }


    // Fund a campaign
    function fundCampaing(uint _id, uint _amount) public payable  {
        Campaign storage campaign = campaigns[_id];
        require(campaign.start == true, "Campaign hasn't started");
        require(block.timestamp <= campaign.endTime, "Campaign is over");

        campaign.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;
        tokenContract.transferFrom(msg.sender, address(this), _amount);
        whoPledged[_id][msg.sender] = true;

        emit FundedCampaign(_id, msg.sender, _amount);

    }

    // Creator can end the campaign if it's not open already
    function cancelCampaign(uint _id) public ownerOnly {
        Campaign memory campaign = campaigns[_id];

        require(campaign.creator == msg.sender, "You did not create the Campaign");
        require(campaign.start == true);
        require(requiredSignatures == campaign.signatures, "Not enough signatures to cancel this campaign");
            

        delete campaigns[_id];
       
        emit Cancel(_id);
    }

    // Delete the pledged amount
    function cancelFundingAmount (uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp <= campaign.endTime, "Campaign is over");
        require(campaign.start == true, "Campaign hasn't started yet");
        require(pledgedAmount[_id][msg.sender] >= _amount, "You do not have those tokens to unpledge");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;
        tokenContract.transfer(msg.sender, _amount);

        emit CancelFunding(_id, msg.sender, _amount);

    }

    function withdrawTokens(uint _id) public ownerOnly {
        Campaign storage campaign = campaigns[_id];

        require(block.timestamp > campaign.endTime, "Campaign didn't end yet");
        require(campaign.pledged >= campaign.goal, "Campaign didn't reach the goal");
        require(!campaign.claimed, "Already claimed");
        require(campaign.signatures == requiredSignatures);


        campaign.claimed = true;
        tokenContract.transfer(campaign.creator, campaign.pledged);

        emit ClaimTokens(_id);

    }

    function refund(uint _id) public pledgedAddress(_id) {
        Campaign memory campaign = campaigns[_id];

        require(block.timestamp > campaign.endTime, "Campaign didn't end yet");
        require(campaign.pledged < campaign.goal, "Campaign has ended with success");

        uint balance = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;
        tokenContract.transfer(msg.sender, balance);

        emit RefundCampaign(_id, msg.sender, balance);

    }


    function viewBlock () public view returns (uint) {
        return block.timestamp;
    }


    receive() external payable {}
    

    // TODO: Function for the owner to claim the tokens raised
    // after the campaign ends

    // TODO: Function to refund users if the campaign does not reach the goal or its canceled
    // only after campaign ends

    // TODO: Function to view if the campaign has ended

}