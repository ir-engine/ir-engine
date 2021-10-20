import useAuctions from '@app/features/useAuctions';
import useClockTime from '@app/features/useClockTime';
import React, { useState } from 'react';

const CreateAuctionForm = () => {
  const [fixedPriceForOpenEdition, setFixedPriceForOpenEdition] =
    useState(0.25); // ETH
  const [minimumBidIncrementFor1of1, setMinimumBidIncrementFor1of1] =
    useState(10); // as percent
  const [auctionLength, setAuctionLength] = useState(120); // seconds
  const [auctionIncrementLength, setAuctionIncrementLength] = useState(15); // seconds
  const createAuction = () => {
    useAuctions
      .getState()
      .createAuction(
        fixedPriceForOpenEdition,
        minimumBidIncrementFor1of1,
        auctionLength + useClockTime.getState().time,
        auctionIncrementLength
      );
  };
  return (
    <div className="createauctionform">
      <div className="form-item">
        <label>Price for Open Edition (ETH)</label>
        <input
          type="number"
          onChange={e => setFixedPriceForOpenEdition(Number(e.target.value))}
          value={fixedPriceForOpenEdition}
        />
      </div>
      <div className="form-item">
        <label>Minimum Bid Increment for 1 of 1 (Percentage)</label>
        <input
          type="number"
          onChange={e => setMinimumBidIncrementFor1of1(Number(e.target.value))}
          value={minimumBidIncrementFor1of1}
        />
      </div>
      <div className="form-item">
        <label>Initial Auction Length (Seconds)</label>
        <input
          type="number"
          onChange={e => setAuctionLength(Number(e.target.value))}
          value={auctionLength}
        />
      </div>
      <div className="form-item">
        <label>Auction Increment Length (Seconds)</label>
        <input
          type="number"
          onChange={e => setAuctionIncrementLength(Number(e.target.value))}
          value={auctionIncrementLength}
        />
      </div>
      <button onClick={createAuction}>Create Auction</button>
      <style jsx>{`
        .createauctionform {
        }
        .form-item {
          width: 400px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        button {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default CreateAuctionForm;
