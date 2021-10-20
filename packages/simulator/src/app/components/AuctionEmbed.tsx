import useAuctions, {
  AuctionType,
  BidTypeEnum
} from '@app/features/useAuctions';
import useClockTime from '@app/features/useClockTime';
import useWallets from '@app/features/useWallets';
import React, { useState } from 'react';

const AuctionEmbed = ({ auction }: { auction: AuctionType }) => {
  const [bidAmount, setBidAmount] = useState(0);
  const [bidType, setBidType] = useState<BidTypeEnum>(BidTypeEnum['1of1']);

  const [error, setError] = useState<Record<string, string | undefined>>({});
  const activeWallet = useWallets(
    state => state.wallets[state.activeWalletIndex]
  );
  const submitBid = () => {
    setError(error => ({ ...error, submitBid: undefined }));
    try {
      useAuctions
        .getState()
        .createBid(auction.tokenAddress, bidType, bidAmount);
    } catch (error) {
      setError(e => ({ ...e, submitBid: error }));
    }
  };
  const switchBidTypeTx = () => {
    setError(error => ({ ...error, switchBidType: undefined }));
    try {
      useAuctions
        .getState()
        .switchTop1of1BidToOpenEdition(auction.tokenAddress);
    } catch (error) {
      setError(e => ({ ...e, switchBidType: error }));
    }
  };
  const finishAuction = () => {
    setError(error => ({ ...error, finishAuction: undefined }));
    try {
      useAuctions.getState().finishAuction(auction.tokenAddress);
    } catch (error) {
      setError(e => ({ ...e, finishAuction: error }));
    }
  };
  const clockTime = useClockTime(state => state.time);
  const top1of1Bid = auction.top1of1BidAmount;
  const totalOpenEditionBids = auction.totalOpenEditionBidsAmount;
  return (
    <div className="auction">
      <div>
        <div
          className="square"
          style={{ backgroundColor: '#' + auction.tokenAddress.slice(-6) }}
        />
        {auction.tokenAddress.slice(0, 18)}
        <br />
        <br />
        Auction started at {auction.createdAt}s
        <br />
        <br />
        {auction.auctionEndTime > clockTime ? (
          <>
            Auction ends at {auction.auctionEndTime}s (t
            {clockTime - auction.auctionEndTime})
          </>
        ) : (
          <>Auction ended!</>
        )}
        <br />
        <br />
        Fixed Price for Open Edition: {auction.fixedPriceForOpenEdition} ETH
        <br />
        <br />
        Minimum Bid Increment for 1-of-1: {
          auction.minimumBidIncrementFor1of1
        }{' '}
        ETH
        <br />
        <br />1 of 1 Bid Increment Time: {auction.auctionIncrementLength}s
      </div>
      <div className="section">
        <b>
          {auction.auctionEndTime > clockTime ? 'Winning currently' : 'Won'}:{' '}
          {totalOpenEditionBids > top1of1Bid
            ? 'Crowd / Open Edition'
            : totalOpenEditionBids == top1of1Bid
            ? 'Tied'
            : 'Whale / 1of1'}
        </b>
        <br />
        <br />
        Top 1 of 1 Bid: {top1of1Bid} ETH
        <br />
        <br />
        Total in Open Edition Bids: {totalOpenEditionBids} ETH
        <br />
        <br />
        Contract Balance: {auction.balance} ETH
        {clockTime >= auction.auctionEndTime && (
          <>
            <br />
            <br />
            {auction.nftsMinted} NFTs minted
          </>
        )}
      </div>
      <div className="section">
        <b>Contract functions</b>
        <br />
        <br />
        <div className="function">
          <div className="function-name">createBid()</div>
          Bid amount (ETH):{' '}
          <input
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(Number(e.target.value))}
          />
          <br />
          <br />
          <div className="bid-type">
            Bid type:{' '}
            <button
              disabled={bidType == BidTypeEnum['1of1']}
              onClick={() => setBidType(BidTypeEnum['1of1'])}
            >
              1OF1
            </button>{' '}
            <button
              disabled={bidType == BidTypeEnum.OpenEdition}
              onClick={() => setBidType(BidTypeEnum.OpenEdition)}
            >
              OPENEDITION
            </button>
          </div>
          <br />
          <div className="submit-bid">
            <button onClick={submitBid}>
              Submit as {activeWallet.address.slice(0, 10)}
            </button>{' '}
            {error.submitBid && <div className="error">{error.submitBid}</div>}
          </div>
        </div>{' '}
        <div className="function">
          <div className="function-name">switchBidToOpenEdition()</div>
          <div className="submit-bid">
            <button onClick={switchBidTypeTx}>
              Submit as {activeWallet.address.slice(0, 10)}
            </button>{' '}
            {error.switchBidType && (
              <div className="error">{error.switchBidType}</div>
            )}
          </div>
        </div>
        <div className="function">
          <div className="function-name">finishAuction()</div>
          <div className="submit-bid">
            <button onClick={finishAuction}>
              Submit as {activeWallet.address.slice(0, 10)}
            </button>{' '}
            {error.finishAuction && (
              <div className="error">{error.finishAuction}</div>
            )}
          </div>
        </div>
        <div className="function">
          <button
            onClick={() => {
              function download(
                content: string,
                fileName: string,
                contentType: string
              ) {
                var a = document.createElement('a');
                var file = new Blob([content], { type: contentType });
                a.href = URL.createObjectURL(file);
                a.download = fileName;
                a.click();
              }
              download(
                JSON.stringify(auction, null, 4),
                `debug-${auction.tokenAddress}.json`,
                'text/plain'
              );
            }}
          >
            Save JSON
          </button>{' '}
          <button
            onClick={() => {
              useAuctions.setState(state => {
                state.auctions = state.auctions.filter(
                  _auction => _auction.tokenAddress != auction.tokenAddress
                );
                return state;
              });
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {auction.logs.length > 0 && (
        <div className="logs">
          {[...auction.logs].reverse().map((log, i) => (
            <div className="log" key={i}>
              {log.createdAt}s: {log.text}
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .auction {
          background-color: #f1f1f1;
          padding: 10px;
        }
        .square {
          width: 11px;
          height: 11px;
          display: inline-block;
          margin-right: 5px;
          vertical-align: baseline;
        }
        .section {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #ccc;
        }
        button:disabled {
          background-color: gold;
          color: black;
        }
        .error {
          margin-top: 5px;
          color: red;
        }
        .logs {
          margin: 0 -10px;
          padding: 10px;
          max-height: 320px;
          overflow-y: auto;
        }
        .logs::-webkit-scrollbar {
          width: 5px;
          background-color: #ccc;
        }
        .logs::-webkit-scrollbar-thumb {
          background: #888;
        }
        .log {
          padding: 5px 0;
        }
        .function {
          padding: 15px;
          margin: -10px;
          margin-bottom: 10px;
          background-color: #ccc;
          border-top: 1px dashed #888;
        }
        .function-name {
          font-weight: bold;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default AuctionEmbed;
