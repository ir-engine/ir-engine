import { useWallet } from '@gimmixorg/use-wallet';
import { StandardCreativeAuction__factory } from '@sdk/factories/StandardCreativeAuction__factory';
import React, { useState } from 'react';

const FinishAuction = () => {
  const { provider } = useWallet();

  const [auctionId, setAuctionId] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const finishAuction = async () => {
    if (!provider) return;
    if (deploying) return;
    setDeploying(true);
    const contract = await StandardCreativeAuction__factory.connect(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      provider.getSigner()
    );
    const tx = await contract.finishAuction(parseInt(auctionId));
    setTxHash(tx.hash);
    await tx.wait(1);

    setDeploying(false);
  };
  return (
    <div className="finish-auction">
      Finish Auction
      <input
        type="text"
        placeholder="Auction Id"
        value={auctionId}
        onChange={e => setAuctionId(e.target.value)}
      />
      <button onClick={finishAuction}>Finish Auction</button>
      <pre>{JSON.stringify({ txHash }, null, 2)}</pre>
      <style jsx>{`
        .finish-auction {
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

export default FinishAuction;
