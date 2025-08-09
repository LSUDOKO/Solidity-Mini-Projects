// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public lender;
    address public inspector;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can perform this action");
        _;
    }


    modifier onlySeller()  {
        require(msg.sender == seller, "Only seller can perform this action");
        _;
    }

    modifier onlyLender() {
        require(msg.sender == lender, "Only lender can perform this action");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspection;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(
        address _nftAddress,
        address _seller,
        address _lender,
        address _inspector
    ) {
        nftAddress = _nftAddress;
        seller = payable(_seller);
        lender = _lender;
        inspector = _inspector;
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller{
        //transfer nft from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);
        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID], "Insufficient deposit amount");
    }

    // Update inspection status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed)  {
        require(msg.sender == inspector, "Only inspector can update inspection status");
        inspection[_nftID] = _passed;
    }

    // Approve sale (buyer, seller, lender)
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    // Finalize sale
    //-> Require inspection status (add more items here .like appraisal)
    // -> Require sale to be authorized 
    // -> Require funds to be correct amount 
    // -> transfer NFT to buyer
    // -> Transfer Funds to seller
    function finalizeSale(uint256 _nftID) public {
        require(inspection[_nftID], "Property must pass inspection");
        require(approval[_nftID][buyer[_nftID]], "Buyer must approve");
        require(approval[_nftID][seller], "Seller must approve");
        require(approval[_nftID][lender], "Lender must approve");
        require(address(this).balance >= purchasePrice[_nftID], "Insufficient funds");
        
        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success, "Transfer failed");

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    // Cancel sale (handle refunds)
    function cancelSale(uint256 _nftID) public {
        if (inspection[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

        //Put Under Contract (only buyer - payable escrow))
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID){
        require(msg.value >=escrowAmount[_nftID]);
    }
    receive() external payable {}
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
