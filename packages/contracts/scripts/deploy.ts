import fs from 'fs-extra';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import {
  StandardCreativeAuction,
  StandardCreativeAuction__factory
} from '../typechain';

async function start() {
  const args = require('minimist')(process.argv.slice(2));

  if (!args.chainId) {
    throw new Error('--chainId chain ID is required');
  }
  const chainId = args.chainId;

  const path = `${process.cwd()}/.env.${chainId}`;
  const env = require('dotenv').config({ path }).parsed;
  const provider = new JsonRpcProvider(env.RPC_ENDPOINT);
  const wallet = new Wallet(`0x${env.PRIVATE_KEY}`, provider);
  const addressesPath = `${process.cwd()}/addresses/${chainId}.json`;
  const addressBook = JSON.parse(
    await fs.readFileSync(addressesPath).toString()
  );

  if (addressBook.contract)
    throw new Error(
      "This would overwrite the address book. Clear it first if you'd like to deploy new instances."
    );

  if (!addressBook.contract) {
    console.log('Deploying contract...');
    const deployTx = await new StandardCreativeAuction__factory(
      wallet
    ).deploy();
    console.log('Deploy TX: ', deployTx.deployTransaction.hash);
    await deployTx.deployed();
    console.log('Contract deployed at ', deployTx.address);
    addressBook.contract = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));
  }

  console.log('Deployed!');
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
