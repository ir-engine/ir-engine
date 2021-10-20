import React, { useState } from 'react';

import { StandardCreativeNFT__factory } from '@sdk/factories/StandardCreativeNFT__factory';
import { useWallet } from '@gimmixorg/use-wallet';

const CreateNFTContract = () => {
  const { provider } = useWallet();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [tokenURI, setTokenURI] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [deployTx, setDeployTx] = useState('');
  const [deployedContractAddress, setDeployedContractAddress] = useState('');

  const createNFTContract = async () => {
    if (!provider) return;
    if (deploying) return;
    setDeploying(true);
    const deployTx = await new StandardCreativeNFT__factory(
      provider.getSigner()
    ).deploy(
      name,
      symbol,
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
      tokenURI
    );
    const contract = await deployTx.deployed();
    setDeployTx(deployTx.deployTransaction.hash);
    setDeployedContractAddress(contract.address);

    setDeploying(false);
  };

  return (
    <div className="create-nft-contract">
      Create NFT contract
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Symbol ($ABCD)"
        value={symbol}
        onChange={e => setSymbol(e.target.value)}
      />
      <input
        type="text"
        placeholder="Token URI (https://yoursite.com/token/)"
        value={tokenURI}
        onChange={e => setTokenURI(e.target.value)}
      />
      <button disabled={deploying} onClick={createNFTContract}>
        Create NFT Contract
      </button>
      <pre>
        {JSON.stringify({ deployTx, deployedContractAddress }, null, 2)}
      </pre>
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

export default CreateNFTContract;
