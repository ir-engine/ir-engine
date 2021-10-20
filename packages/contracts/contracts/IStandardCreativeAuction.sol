// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.2;

interface IStandardCreativeAuction {
    struct Auction {
        address nftContract;
        address creatorAddress;
        uint256 creatorShare;
        uint256 openEditionPrice;
        uint256 minBidIncrement;
        uint256 duration;
        uint256 durationIncrement;
        uint256 startTime;
        uint256 topBidAmount;
        address topBidAddress;
        uint256 totalOpenEditionBids;
        bool finished;
    }
}
