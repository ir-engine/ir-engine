import React, { useState } from 'react';

import { useWallet } from '@gimmixorg/use-wallet';
import { StandardCreativeAuction__factory } from '@sdk/factories/StandardCreativeAuction__factory';
import { parseEther } from 'ethers/lib/utils';

const CreateBid = () => {
  const { provider } = useWallet();

  const [auctionId, setAuctionId] = useState('');
  const [bidType, setBidType] = useState('');
  const [amount, setAmount] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const createBid = async () => {
    if (!provider) return;
    if (deploying) return;
    setDeploying(true);

    const contract = await StandardCreativeAuction__factory.connect(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      provider.getSigner()
    );
    try {
      const tx = await contract.createBid(
        parseInt(auctionId),
        bidType == '0' ? false : true,
        {
          value: parseEther(amount)
        }
      );
      setTxHash(tx.hash);
      await tx.wait(1);
    } catch (err) {
      console.log(err);
    }
    setDeploying(false);
  };

  return (
    <div className="create-nft-contract">
      Create Bid
      <input
        type="text"
        placeholder="Auction Id"
        value={auctionId}
        onChange={e => setAuctionId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Bid Type (0 for open edition, 1 for one of one)"
        value={bidType}
        onChange={e => setBidType(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button onClick={createBid}>Create Bid</button>
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

export default CreateBid;
