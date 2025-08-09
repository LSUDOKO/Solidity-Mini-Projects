// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("RealEstate", "REAL") {}

    function mint(string memory tokenURL) public returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newItemId = _tokenIdCounter.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURL);
        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}
