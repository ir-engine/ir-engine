import { AbstractConnector } from "@web3-react/abstract-connector/dist";
import { InjectedConnector } from "@web3-react/injected-connector";

export const injected = new InjectedConnector({
  supportedChainIds: [1], // Mainnet only
});

export function isConnected(connector: AbstractConnector | undefined): boolean {
  return injected === connector;
}
