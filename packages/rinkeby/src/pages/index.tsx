import React, { useState } from 'react';
import { useWallet } from '@gimmixorg/use-wallet';
import CreateAuction from '@app/components/CreateAuction';
import CreateNFTContract from '@app/components/CreateNFTContract';
import CreateBid from '@app/components/CreateBid';
import SwitchBid from '@app/components/SwitchBid';
import FinishAuction from '@app/components/FinishAuction';
import AuctionState from '@app/components/AuctionState';

const IndexPage = () => {
  const { connect, account } = useWallet();
  const [auctions, setAuctions] = useState<number[]>([]);
  const onAuctionCreate = (auctionId: number) => {
    setAuctions([...auctions, auctionId]);
  };
  return (
    <div className="index">
      {!account ? (
        <button onClick={() => connect()}>Connect Wallet</button>
      ) : (
        <>
          <CreateNFTContract />
          <CreateAuction onAuctionCreate={onAuctionCreate} />
          <CreateBid />
          <SwitchBid />
          <FinishAuction />
          {auctions.map(auction => (
            <AuctionState key={auction} auctionId={auction} />
          ))}
        </>
      )}

      <style jsx>{`
        .index {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          padding-top: 100px;
          align-items: flex-start;
          justify-content: center;
          height: 100%;
          width: 100%;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          height: 30px;
          width: 200px;
          font-weight: bold;
          background-color: black;
          color: white;
          border: none;
          border-radius: 5px;
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default IndexPage;
