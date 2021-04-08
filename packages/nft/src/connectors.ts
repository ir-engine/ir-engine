import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { LedgerConnector } from '@web3-react/ledger-connector'

const POLLING_INTERVAL = 12000
const RPC_URLS: { [chainId: number]: string } = {
  1: process.env.RPC_URL_1 as string,
  4: process.env.RPC_URL_4 as string,
}

export const injected = new InjectedConnector({ supportedChainIds: [1337, 4] })

export const network = new NetworkConnector({
  urls: {
    1337: RPC_URLS[1],
    // , 4: RPC_URLS[4]
  },
  defaultChainId: 1337,
})

export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: POLLING_INTERVAL,
})

export const walletlink = new WalletLinkConnector({
  url: RPC_URLS[1],
  appName: 'xr3-nft-storefront',
})

export const ledger = new LedgerConnector({
  chainId: 1,
  url: RPC_URLS[1],
  pollingInterval: POLLING_INTERVAL,
})
