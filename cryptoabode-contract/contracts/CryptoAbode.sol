//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./RealT.sol";
contract CryptoAbode{
    address _admin;
    RealT realT;
    
    struct UserDetails {  
        uint id;
        uint user_type; // 1: Admin, 2: Auditor, 3: Buyer / Seller
        string name;
        string contact;
        string location;
        uint[] estates;
    }
    struct EstateListing {   
        string estateAddress;
        uint requiredPrice;
        string imgUrl;
        string features;
        bool toBeSold;
		address owner;
        bool isVerified;
        uint estateType; // 1:Buy/sell, 2:Rent
        uint months;
        //address payable highestBidder;
        address highestBidder;
        uint highestBid;
    }

    mapping(address => UserDetails) public users;
    mapping (uint => EstateListing) public listedEstates;
    uint public numEstates=0; //total no of estates via this contract at any time
    uint public numUsers=0; //total no of users via this contract at any time
    address[] public userAddrs;

    event InitUser(address _user,RealT realT); //constructor event

    constructor(address tokenAddress) payable public{
        realT = RealT(tokenAddress); 
        _admin = msg.sender;
        users[msg.sender].user_type = 1;
        emit InitUser(msg.sender,realT);
    }

    event AddUser(address _user, uint _userId); //user addition event
    event AddEstate(address _owner, uint _estateID); //estate addition event
    event TransferEstate(address indexed _seller, address indexed _buyer, uint _estateID); //estate transfer event
    

    
    //modifiers
    modifier onlyAdmin {
        require(msg.sender == _admin);
        _;
    }

    modifier onlyAuditor {
        require(users[msg.sender].user_type == 2);
        _;
    }
 
    modifier onlyBuyerOrSeller{ 
        require(users[msg.sender].user_type == 3);
        _;
    }

    modifier onlyVerifiedProperty (uint estateIndex){ 
        require(listedEstates[estateIndex].isVerified == true);
        _;
    }

    function fetchApprovedMarket() public view returns(address){
        return realT.fetchApprovedMarket();
    }

    function addContractBalance() public payable{}

    function addUser (string memory name, string memory contact, string memory location) public {
        numUsers = numUsers + 1;
        UserDetails memory user = UserDetails(
            {
                id: numUsers,
                name: name,
                contact: contact,
                location: location,
                user_type: 0,
                estates: new uint[](0)
            });
        users[msg.sender] = user;
        userAddrs.push(msg.sender);
        
        emit AddUser(msg.sender, numUsers);

    }
	 
	function registerUser (address userAddr, uint user_type) public onlyAdmin{ 
        require((user_type == 2 || user_type == 3), "User type must be either auditor or buyer or seller");
        users[userAddr].user_type = user_type;
        // realT.transferFrom(_admin, msg.sender, 100*10**18) ;   
        transferRealTToken(userAddr, 100*10**18);      
    }

    function verifyProperty(uint estateIndex) public onlyAuditor{ 
        listedEstates[estateIndex].isVerified = true;        
    }

    function getContractBalance() public view returns(uint){ 
        return address(this).balance; 
    }

    function addEstate(string memory _location, uint _cost,string memory imageURL, string memory feat) public returns(bool)
    {
        numEstates = numEstates + 1;
        //address payable highBidder = address(0);
        address highBidder = address(0);
        EstateListing memory myEstate = EstateListing(
            {
                owner: msg.sender,
                estateAddress: _location,
                requiredPrice: _cost,
                imgUrl: imageURL,
                features: feat,
                toBeSold: true,
                isVerified: false,
                months: 0,
                estateType: 1,
                highestBid: _cost,
                highestBidder: highBidder
            });
        listedEstates[numEstates] = myEstate;
        users[msg.sender].estates.push(numEstates);
        
        return true;
    }

    function getEstateDetails(uint _index) public view returns (string memory, uint,string memory,string memory, bool, address, bool) {
        return ( 
            listedEstates[_index].estateAddress,
            listedEstates[_index].requiredPrice,
            listedEstates[_index].imgUrl,
            listedEstates[_index].features,
            listedEstates[_index].toBeSold,
            listedEstates[_index].owner,
            listedEstates[_index].isVerified
        );         
    }
    function getEstateCount() public view returns (uint){
        return numEstates;
    }

    function getUserAddresses() public view returns (address[] memory){
        return userAddrs;
    }

    function checkIfAdmin() external view returns(bool){
        if(_admin == msg.sender){
            return true;
        }
        return false;
    }

    function checkIfAuditor() external view returns(bool){
        if(users[msg.sender].user_type == 2){
            return true;
        }
        return false;
    }

    function getUser (address userAddr) onlyAdmin public view returns (uint, uint,string memory,string memory, string memory, uint[] memory ) {
        return (
        users[userAddr].id,
        users[userAddr].user_type,
        users[userAddr].name,
        users[userAddr].contact,
        users[userAddr].location,
        users[userAddr].estates
        );         
    }

    function placeBid (uint estateIndex,uint bidValue) onlyVerifiedProperty(estateIndex) onlyBuyerOrSeller public payable{
        //require(bidValue >= listedEstates[estateIndex].requiredPrice,"User does not have enough balance to buy this estate");
        checkRealTAndBid(bidValue); 
        require(bidValue >= listedEstates[estateIndex].highestBid,"User's bid is lower than the highest bid.");
        require(msg.sender != listedEstates[estateIndex].owner ,"Seller itself cannot be the buyer");
        require(listedEstates[estateIndex].toBeSold == true, "Not for sale");
        require(listedEstates[estateIndex].estateType == 1, "Estate type is not sellable");
        
        if(listedEstates[estateIndex].highestBidder == address(0)){
            // HighestBidder is the firstBidder;
            listedEstates[estateIndex].highestBid = bidValue;
            listedEstates[estateIndex].highestBidder = msg.sender;
        }else{ 
            // Revert amount to previous bidder logic.
            address _previousHighestBidder = listedEstates[estateIndex].highestBidder;
            uint _previousHighestBid = listedEstates[estateIndex].highestBid;

            listedEstates[estateIndex].highestBid = bidValue;
            listedEstates[estateIndex].highestBidder = msg.sender;
            //(_previousHighestBidder).transfer(_previousHighestBid);
            //payable(_previousHighestBidder).transfer(_previousHighestBid);
            // transferRealTToken(_previousHighestBidder, _previousHighestBid);
            realT.approve(listedEstates[estateIndex].owner,_previousHighestBid);
            realT.transferFrom(listedEstates[estateIndex].owner, _previousHighestBidder, _previousHighestBid);

        }
        transferRealTToken(listedEstates[estateIndex].owner, bidValue);
        
        // emit Transfer(seller,msg.sender, estateIndex);
    }

    function stopBidding (uint estateIndex) onlyVerifiedProperty(estateIndex) onlyBuyerOrSeller payable public {
        require(listedEstates[estateIndex].owner == msg.sender, "Only owner can stop a bid.");
        require(listedEstates[estateIndex].toBeSold == true, "Cannot stop a bid if estate is not to be sold.");
        require(listedEstates[estateIndex].estateType == 1, "Estate type is not sellable");

        listedEstates[estateIndex].toBeSold = false;
        listedEstates[estateIndex].owner = listedEstates[estateIndex].highestBidder;
        listedEstates[estateIndex].highestBidder = address(0);

        // emit Transfer(seller,msg.sender, estateIndex);
    }

    function getRealTBalance() public view returns(uint){
        return realT.balanceOf(msg.sender);
    }

    function checkRealTAndBid(uint bid) internal view{
        if(bid > realT.balanceOf(msg.sender)){
            revert("Not Enough RealT Tokens");
        }
    }

    function transferRealTToken(address to, uint amount) public{
        realT.approve(msg.sender,amount);
        realT.transferFrom(msg.sender, to, amount);
    }
    
    function transferRealTTokenAirDrop(address to, uint amount) onlyAdmin public{
        realT.approve(msg.sender,amount);
        realT.transferFrom(msg.sender, to, amount);
    }



   
}