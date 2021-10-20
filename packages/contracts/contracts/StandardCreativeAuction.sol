// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import "./IStandardCreativeAuction.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IERC165} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./IStandardCreativeNFT.sol";

contract StandardCreativeAuction is
    IStandardCreativeAuction,
    Ownable,
    ReentrancyGuard
{
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    // Data store
    Counters.Counter private _auctionIdCounter;

    mapping(uint256 => IStandardCreativeAuction.Auction) private _auctions;
    mapping(uint256 => mapping(address => uint256)) private _openEditionBids;

    bytes4 constant interfaceId = 0x80ac58cd; // ERC721 interface

    // Modifiers
    modifier auctionStarted(uint256 id) {
        require(_auctions[id].startTime != 0, "Auction not started");
        _;
    }
    modifier auctionExists(uint256 id) {
        require(
            _auctions[id].nftContract != address(0),
            "Auction doesn't exist"
        );
        _;
    }
    modifier auctionEnded(uint256 id) {
        require(_auctions[id].startTime != 0, "Auction not started");
        require(
            block.timestamp >
                _auctions[id].startTime.add(_auctions[id].duration),
            "Auction not finished"
        );
        _;
    }

    // Events
    event AuctionCreated(uint256 indexed id, address indexed nftContract);
    event AuctionBid(
        uint256 indexed id,
        bool oneOfOne,
        uint256 amount,
        address indexed bidder
    );

    // Create Auction
    function createAuction(
        address nftContract,
        address creatorAddress,
        uint256 creatorShare,
        uint256 openEditionPrice,
        uint256 minBidIncrement,
        uint256 duration,
        uint256 durationIncrement
    ) public onlyOwner {
        // Ensure valid nftContract
        require(
            IERC165(nftContract).supportsInterface(interfaceId),
            "Doesn't support NFT interface"
        );

        // Ensure creator share is > 0 & < 100
        require(
            creatorShare > 0 && creatorShare <= 100,
            "Invalid creator share"
        );

        // Register auction
        uint256 auctionId = _auctionIdCounter.current();
        _auctions[auctionId] = Auction(
            nftContract,
            creatorAddress,
            creatorShare,
            openEditionPrice,
            minBidIncrement,
            duration,
            durationIncrement,
            0,
            0,
            address(0),
            0,
            false
        );
        _auctionIdCounter.increment();

        // Emit event
        emit AuctionCreated(auctionId, nftContract);
    }

    // Get end time of auction
    function getAuctionEndTime(uint256 auctionId)
        public
        view
        auctionExists(auctionId)
        returns (uint256)
    {
        // Lookup auction
        Auction memory auction = _auctions[auctionId];
        if (auction.startTime == 0) return 0;
        return auction.startTime + auction.duration;
    }

    // Get current leader
    function getCurrentLeader(uint256 auctionId)
        public
        view
        auctionExists(auctionId)
        returns (bool winnerIsOneOfOne, uint256 topBidAmount)
    {
        // Lookup auction
        Auction memory auction = _auctions[auctionId];
        bool oneOfOneLeading = _checkWinnerIsOneOfOne(auctionId);
        if (oneOfOneLeading) {
            return (true, auction.topBidAmount);
        } else {
            return (false, auction.totalOpenEditionBids);
        }
    }

    function getAuction(uint256 auctionId)
        public
        view
        returns (Auction memory)
    {
        // Lookup auction
        Auction memory auction = _auctions[auctionId];
        return auction;
    }

    // Create Bid
    function createBid(uint256 auctionId, bool oneOfOne)
        public
        payable
        auctionExists(auctionId)
        nonReentrant
    {
        // Lookup auction
        Auction storage auction = _auctions[auctionId];

        // Require auction exist and not ended
        require(
            auction.startTime == 0 ||
                block.timestamp < auction.startTime + auction.duration,
            "Auction ended"
        );

        // Require amount is more than min open edition price
        require(msg.value > auction.openEditionPrice, "Bid is too low");

        if (oneOfOne) {
            require(
                msg.value >=
                    auction.topBidAmount.add(
                        auction.topBidAmount.mul(auction.minBidIncrement).div(
                            100
                        )
                    ),
                "Bid is too low"
            );
            require(
                auction.topBidAddress != _msgSender(),
                "Already top bidder"
            );

            // If another 1/1 bid already exists, pay back the bidder
            if (auction.topBidAddress != address(0)) {
                payable(auction.topBidAddress).transfer(auction.topBidAmount);
            }

            // Save bid info
            auction.topBidAddress = _msgSender();
            auction.topBidAmount = msg.value;

            // Extend auction length
            auction.duration = auction.duration.add(auction.durationIncrement);

            // Emit event
            emit AuctionBid(auctionId, true, msg.value, _msgSender());
        } else {
            require(
                msg.value % auction.openEditionPrice == 0,
                "Bid must be exact multiple"
            );
            _openEditionBids[auctionId][_msgSender()] = _openEditionBids[
                auctionId
            ][_msgSender()].add(msg.value);
            auction.totalOpenEditionBids.add(msg.value);
            emit AuctionBid(auctionId, false, msg.value, _msgSender());
        }

        // Start auction clock if first bid
        if (auction.startTime == 0) auction.startTime = block.timestamp;
    }

    // Switch bid type
    function switchTopBidToOpenEdition(uint256 auctionId) public {
        // Lookup auction
        Auction storage auction = _auctions[auctionId];

        // Ensure caller is top bidder and has enough to switch
        require(_msgSender() == auction.topBidAddress, "Not top bidder");
        require(
            auction.topBidAmount > auction.openEditionPrice,
            "Bid is too low"
        );

        // Calculate amount to refund, if any
        uint256 refund = auction.topBidAmount % auction.openEditionPrice;
        uint256 bidAmount = auction.topBidAmount.sub(refund);

        // Refund if needed
        if (refund != 0) {
            payable(_msgSender()).transfer(refund);
        }

        // Increment total open edition bid amount
        auction.totalOpenEditionBids = auction.totalOpenEditionBids.add(
            bidAmount
        );
        _openEditionBids[auctionId][_msgSender()] = _openEditionBids[auctionId][
            _msgSender()
        ].add(bidAmount);

        // Clear top bid
        auction.topBidAddress = address(0);
        auction.topBidAmount = 0;
    }

    // Finish auction (function only handles actions as needed per user)
    function finishAuction(uint256 auctionId) public auctionEnded(auctionId) {
        // Lookup auction
        Auction storage auction = _auctions[auctionId];

        // Retrieve winner of auction
        bool oneOfOneWinner = _checkWinnerIsOneOfOne(auctionId);

        if (oneOfOneWinner) {
            if (auction.topBidAddress == _msgSender()) {
                // Mint 1/1 to winner
                IStandardCreativeNFT(auction.nftContract).mint(_msgSender());

                // Send payouts when finished
                if (!auction.finished) {
                    uint256 creatorPayout = auction
                        .topBidAmount
                        .mul(auction.creatorShare)
                        .div(100);
                    uint256 ownerPayout = auction
                        .topBidAmount
                        .mul(100 - auction.creatorShare)
                        .div(100);
                    payable(auction.creatorAddress).transfer(creatorPayout);
                    payable(owner()).transfer(ownerPayout);
                    auction.finished = true;
                }
            } else {
                // Refund caller if eligible
                uint256 refund = _openEditionBids[auctionId][_msgSender()];
                if (refund > 0) payable(_msgSender()).transfer(refund);
                _openEditionBids[auctionId][_msgSender()] = 0;
            }
        } else {
            // Mint multiple open editions to calling winner
            uint256 bidAmount = _openEditionBids[auctionId][_msgSender()];
            require(bidAmount > 0, "Not eligible");

            // Mint amounts
            uint256 amountToMint = bidAmount / auction.openEditionPrice;
            for (uint256 i = 0; i < amountToMint; i++) {
                IStandardCreativeNFT(auction.nftContract).mint(_msgSender());
            }

            // Clear bid amount for wallet
            _openEditionBids[auctionId][_msgSender()] = 0;

            // Send payouts when finished if not already done
            if (!auction.finished) {
                uint256 creatorPayout = auction
                    .totalOpenEditionBids
                    .mul(auction.creatorShare)
                    .div(100);
                uint256 ownerPayout = auction
                    .totalOpenEditionBids
                    .mul(100 - auction.creatorShare)
                    .div(100);
                payable(auction.creatorAddress).transfer(creatorPayout);
                payable(owner()).transfer(ownerPayout);
                auction.finished = true;
            }
        }
    }

    function _checkWinnerIsOneOfOne(uint256 auctionId)
        private
        view
        auctionExists(auctionId)
        returns (bool)
    {
        return
            _auctions[auctionId].totalOpenEditionBids >
                _auctions[auctionId].topBidAmount
                ? false
                : true;
    }
}
