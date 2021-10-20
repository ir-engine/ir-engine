import { useWallet } from '@gimmixorg/use-wallet';
import { StandardCreativeAuction__factory } from '@sdk/factories/StandardCreativeAuction__factory';
import { ethers } from 'ethers';
import React from 'react';
import useSWR from 'swr';

const fetcher = async (
  auctionId: number,
  provider: ethers.providers.Web3Provider
) => {
  const contract = await StandardCreativeAuction__factory.connect(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
    provider.getSigner()
  );
  return await contract.getAuction(auctionId);
};

const AuctionState = ({ auctionId }: { auctionId: number }) => {
  const { provider } = useWallet();
  const { data } = useSWR([auctionId, provider], fetcher, {
    refreshInterval: 1 * 1000
  });
  if (!data) return null;
  return (
    <div className="auctionstate">
      <div className="item">
        <b>Auction Id:</b> {auctionId}
      </div>
      <div className="item">
        <b>NFT:</b> {data[0]}
      </div>
      <div className="item">
        <b>Creator:</b> {data[1]}
      </div>
      <div className="item">
        <b>Creator share:</b> {data[2].toNumber()}%
      </div>
      <div className="item">
        <b>Start time:</b> {data[6].toNumber()} sec
      </div>
      <div className="item">
        <b>Total duration:</b> {data[5].toNumber()} sec
      </div>
      <div className="item">
        <b>Top Bid Amount:</b> {data[8].toNumber()} ETH
      </div>
      <div className="item">
        <b>Top Bid addr:</b> {data[9]}
      </div>
      <div className="item">
        <b>Open Edition bids:</b> {data[10].toNumber()} ETH
      </div>
      <div className="item">
        <b>Finished:</b> {data[11] ? 'Yes' : 'No'}
      </div>
      <style jsx>{`
        .auctionstate {
        }
      `}</style>
    </div>
  );
};

export default AuctionState;
