// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StandardCreativeNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string private _tokenUri;

    constructor(
        string memory name,
        string memory symbol,
        address auctionAddress,
        string memory tokenUri_
    ) ERC721(name, symbol) {
        _tokenUri = tokenUri_;
        transferOwnership(auctionAddress);
    }

    function mint(address to) public onlyOwner {
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function tokenUri(uint256 tokenId) public view returns (string memory) {
        return string(abi.encodePacked(_tokenUri, tokenId));
    }
}
