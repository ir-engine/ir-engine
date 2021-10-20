import React, { useState } from 'react';
import { useWallet } from '@gimmixorg/use-wallet';
import { StandardCreativeAuction__factory } from '@sdk/factories/StandardCreativeAuction__factory';

const SwitchBid = () => {
  const { provider } = useWallet();

  const [auctionId, setAuctionId] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const switchBid = async () => {
    if (!provider) return;
    if (deploying) return;
    setDeploying(true);

    const contract = await StandardCreativeAuction__factory.connect(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      provider.getSigner()
    );

    const tx = await contract.switchTopBidToOpenEdition(parseInt(auctionId));
    setTxHash(tx.hash);
    await tx.wait(1);

    setDeploying(false);
  };

  return (
    <div className="create-nft-contract">
      Switch Bid
      <input
        type="text"
        placeholder="Auction Id"
        value={auctionId}
        onChange={e => setAuctionId(e.target.value)}
      />
      <button onClick={switchBid}>Switch Bid to Open Edition</button>
      <pre>{JSON.stringify({ txHash }, null, 2)}</pre>
      <style jsx>{`
        .create-nft-contract {
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

export default SwitchBid;
