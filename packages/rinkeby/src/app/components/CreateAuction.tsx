import { useWallet } from '@gimmixorg/use-wallet';
import { StandardCreativeAuction__factory } from '@sdk/factories/StandardCreativeAuction__factory';
import React, { useState } from 'react';
import { utils } from 'ethers';

const CreateAuction = ({
  onAuctionCreate
}: {
  onAuctionCreate: (auctionId: number) => void;
}) => {
  const { provider } = useWallet();

  const [nftContract, setNFTContract] = useState('');
  const [creatorAddress, setCreatorAddress] = useState('');
  const [creatorShare, setCreatorShare] = useState('');
  const [openEditionPrice, setOpenEditionPrice] = useState('');
  const [minBidIncrement, setMinBidIncrement] = useState('');
  const [duration, setDuration] = useState('');
  const [durationIncrement, setDurationIncrement] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const createAuction = async () => {
    if (!provider) return;
    if (deploying) return;
    setDeploying(true);
    const contract = await StandardCreativeAuction__factory.connect(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      provider.getSigner()
    );
    const tx = await contract.createAuction(
      nftContract,
      creatorAddress,
      creatorShare,
      utils.parseEther(openEditionPrice),
      minBidIncrement,
      duration,
      durationIncrement
    );
    setTxHash(tx.hash);
    const receipt = await tx.wait(1);

    //@ts-ignore
    onAuctionCreate(receipt.events[0].args.id.toNumber());
    setDeploying(false);
  };
  return (
    <div className="create-auction">
      Create Auction
      <input
        type="text"
        placeholder="NFT Contract"
        value={nftContract}
        onChange={e => setNFTContract(e.target.value)}
      />
      <input
        type="text"
        placeholder="Creator Address"
        value={creatorAddress}
        onChange={e => setCreatorAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Creator Share (0 - 100)"
        value={creatorShare}
        onChange={e => setCreatorShare(e.target.value)}
      />
      <input
        type="text"
        placeholder="Open Edition Price (in ETH)"
        value={openEditionPrice}
        onChange={e => setOpenEditionPrice(e.target.value)}
      />
      <input
        type="text"
        placeholder="Minimum Bid Increment (as %)"
        value={minBidIncrement}
        onChange={e => setMinBidIncrement(e.target.value)}
      />
      <input
        type="text"
        placeholder="Duration (seconds)"
        value={duration}
        onChange={e => setDuration(e.target.value)}
      />
      <input
        type="text"
        placeholder="Duration Increment (seconds)"
        value={durationIncrement}
        onChange={e => setDurationIncrement(e.target.value)}
      />
      <button onClick={createAuction}>Create Auction</button>
      <pre>{JSON.stringify({ txHash }, null, 2)}</pre>
      <style jsx>{`
        .create-auction {
          padding: 10px;
          border: 1px solid black;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 300px;
          overflow: hidden;
        }
        input {
          font-size: 16px;
          padding: 5px;
        }
      `}</style>
    </div>
  );
};

export default CreateAuction;
