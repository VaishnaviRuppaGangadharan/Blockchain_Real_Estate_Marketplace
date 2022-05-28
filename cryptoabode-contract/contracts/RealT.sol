//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RealT is ERC20 {
    address _owner;
    address approvedMarket;

    constructor() ERC20("The Real Estate Token", "RealT") {
        _owner = msg.sender;
        _mint(msg.sender, 1000 * 10 ** 18);
    }

    modifier onlyMyMarket(){
        require(msg.sender == approvedMarket);
        _;
    }

    modifier onlyRealTAdmin(){
        require(msg.sender == _owner);
        _;
    }

    function fetchApprovedMarket() public view onlyMyMarket returns(address){
        return approvedMarket;
    }

    function updateApprovedMarket(address _approvedMarket) public onlyRealTAdmin{
        approvedMarket = _approvedMarket;
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool){
        _approve(spender, approvedMarket, amount);
        return true;
    }
}


