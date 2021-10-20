import create, { State, StateCreator } from 'zustand';
import produce, { Draft } from 'immer';
import generateRandomAddress from './generateRandomAddress';
import useWallets from './useWallets';
import useClockTime from './useClockTime';
import assert from './assert';

const immer =
  <T extends State>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (partial, replace) => {
        const nextState =
          typeof partial === 'function'
            ? produce(partial as (state: Draft<T>) => T)
            : (partial as T);
        return set(nextState, replace);
      },
      get,
      api
    );

export enum BidTypeEnum {
  '1of1',
  'OpenEdition'
}

export type AuctionType = {
  tokenAddress: string;
  balance: number;
  nftsMinted: number;
  fixedPriceForOpenEdition: number;
  minimumBidIncrementFor1of1: number;
  auctionEndTime: number;
  auctionIncrementLength: number;
  top1of1BidAmount: number;
  top1of1BidAddress?: string;
  totalOpenEditionBidsAmount: number;
  openEditionBids: Record<string, number>;
  createdAt: number;
  finished: boolean;

  // simulator only
  logs: { text: string; createdAt: number }[];
};

type AuctionState = {
  auctions: AuctionType[];
  createAuction: (
    fixedPriceForOpenEdition: number,
    minimumBidIncrementFor1of1: number,
    auctionEndTime: number,
    auctionIncrementLength: number
  ) => void;
  createBid: (
    tokenAddress: string,
    bidType: BidTypeEnum,
    ethAmount: number
  ) => void;
  switchTop1of1BidToOpenEdition: (tokenAddress: string) => void;
  finishAuction: (tokenAddress: string) => void;
};

const useAuctions = create<AuctionState>(
  immer(set => ({
    auctions: [],
    // createAuction()

    createAuction: (
      fixedPriceForOpenEdition: number,
      minimumBidIncrementFor1of1: number,
      auctionEndTime: number,
      auctionIncrementLength: number
    ) => {
      set(state => {
        state.auctions.push({
          tokenAddress: generateRandomAddress(),
          balance: 0,
          nftsMinted: 0,
          fixedPriceForOpenEdition,
          minimumBidIncrementFor1of1,
          auctionEndTime,
          auctionIncrementLength,
          top1of1BidAmount: 0,
          top1of1BidAddress: undefined,
          totalOpenEditionBidsAmount: 0,
          openEditionBids: {},
          finished: false,
          logs: [],
          createdAt: useClockTime.getState().time
        });
        return state;
      });
    },

    // createBid()
    createBid: (
      tokenAddress: string,
      bidType: BidTypeEnum,
      ethAmount: number
    ) => {
      set(state => {
        const auctionIndex = state.auctions.findIndex(
          auction => auction.tokenAddress == tokenAddress
        );
        assert(auctionIndex !== -1, 'auction not found');
        const auction = state.auctions[auctionIndex];
        assert(
          auction.auctionEndTime > useClockTime.getState().time,
          'auction ended'
        );
        assert(
          useWallets.getState().wallets[useWallets.getState().activeWalletIndex]
            .balance >= ethAmount,
          'not enough ETH'
        );

        if (bidType == BidTypeEnum['1of1']) {
          assert(
            ethAmount >=
              auction.top1of1BidAmount +
                (auction.minimumBidIncrementFor1of1 *
                  auction.top1of1BidAmount) /
                  100,
            `bid needs to be higher than previous amount plus minimum bid increment (${
              auction.top1of1BidAmount +
              (auction.minimumBidIncrementFor1of1 * auction.top1of1BidAmount) /
                100
            } ETH)`
          );

          // Refund user's ETH from previous top bid
          _refundPreviousTop1of1Bidder(auction);

          auction.auctionEndTime += auction.auctionIncrementLength;
          auction.logs.push({
            text: `++ auction time extended by ${auction.auctionIncrementLength}s`,
            createdAt: useClockTime.getState().time
          });
        } else if (bidType == BidTypeEnum.OpenEdition) {
          assert(
            ethAmount > auction.fixedPriceForOpenEdition,
            'bid needs to be higher than open edition price'
          );
          assert(
            ethAmount % auction.fixedPriceForOpenEdition == 0,
            'eth amount needs to be a multiple of open edition price'
          );
        }

        useWallets
          .getState()
          .decreaseWalletBalance(
            useWallets.getState().activeWalletIndex,
            ethAmount
          );
        const activeWallet =
          useWallets.getState().wallets[
            useWallets.getState().activeWalletIndex
          ];
        auction.balance += ethAmount;
        auction.logs.push({
          text: `${activeWallet.address.slice(
            0,
            10
          )} bid ${ethAmount} ETH for the ${
            bidType == BidTypeEnum['1of1'] ? '1 of 1' : 'open edition'
          }`,
          createdAt: useClockTime.getState().time
        });
        if (bidType == BidTypeEnum['1of1']) {
          auction.top1of1BidAmount = ethAmount;
          auction.top1of1BidAddress = activeWallet.address;
        } else if (bidType == BidTypeEnum.OpenEdition) {
          if (!auction.openEditionBids[activeWallet.address])
            auction.openEditionBids[activeWallet.address] = 0;
          auction.openEditionBids[activeWallet.address] += ethAmount;
          auction.totalOpenEditionBidsAmount += ethAmount;
        }
        return state;
      });
    },

    switchTop1of1BidToOpenEdition: (tokenAddress: string) => {
      set(state => {
        const auctionIndex = state.auctions.findIndex(
          auction => auction.tokenAddress == tokenAddress
        );
        assert(auctionIndex !== -1, 'auction not found');
        const auction = state.auctions[auctionIndex];
        const activeWallet =
          useWallets.getState().wallets[
            useWallets.getState().activeWalletIndex
          ];

        assert(
          auction.top1of1BidAddress == activeWallet.address,
          'this wallet isnt the top bidder, so it cant switch bids from 1of1 to OpenEdition'
        );
        assert(
          auction.top1of1BidAmount >= auction.fixedPriceForOpenEdition,
          'bid needs to be higher than open edition price'
        );

        auction.top1of1BidAmount = 0;
        auction.top1of1BidAddress = undefined;

        if (!auction.openEditionBids[activeWallet.address])
          auction.openEditionBids[activeWallet.address] = 0;
        const amountToRefund =
          auction.top1of1BidAmount % auction.fixedPriceForOpenEdition;
        const amountToTransfer = auction.top1of1BidAmount - amountToRefund;
        useWallets
          .getState()
          .increaseWalletBalance(
            useWallets.getState().activeWalletIndex,
            amountToRefund
          );
        auction.balance -= amountToRefund;

        auction.logs.push({
          text: `${activeWallet.address.slice(
            0,
            10
          )} was refunded ${amountToRefund} ETH`,
          createdAt: useClockTime.getState().time
        });
        auction.openEditionBids[activeWallet.address] += amountToTransfer;
        auction.totalOpenEditionBidsAmount += amountToTransfer;
        auction.logs.push({
          text: `${activeWallet.address.slice(
            0,
            10
          )} moved ${amountToTransfer} ETH from a 1of1 bid to open edition bids`,
          createdAt: useClockTime.getState().time
        });
        return state;
      });
    },

    // finishAuction()
    finishAuction: (tokenAddress: string) => {
      set(state => {
        const auctionIndex = state.auctions.findIndex(
          auction => auction.tokenAddress == tokenAddress
        );
        assert(auctionIndex !== -1, 'auction not found');
        const auction = state.auctions[auctionIndex];
        assert(
          useClockTime.getState().time > auction.auctionEndTime,
          'auction still in progress'
        );
        assert(!auction.finished, 'auction finish method has already been run');
        const winner = _checkWinner(auction);
        if (winner == BidTypeEnum['1of1']) {
          auction.nftsMinted += 1;
          auction.finished = true;
          for (const address of Object.keys(auction.openEditionBids)) {
            const amount = auction.openEditionBids[address];
            const walletIndex = useWallets
              .getState()
              .wallets.findIndex(wallet => wallet.address == address);
            if (walletIndex == -1) continue;
            useWallets.getState().increaseWalletBalance(walletIndex, amount);
            auction.balance -= amount;
            auction.logs.push({
              text: `${address?.slice(
                0,
                10
              )} was refunded ${amount} ETH for losing OpenEdition bids`,
              createdAt: useClockTime.getState().time
            });
          }
        } else if (winner == BidTypeEnum.OpenEdition) {
          auction.nftsMinted +=
            auction.totalOpenEditionBidsAmount /
            auction.fixedPriceForOpenEdition;
          auction.finished = true;
          _refundPreviousTop1of1Bidder(auction);
        }
        return state;
      });
    }
  }))
);

const _checkWinner = (auction: AuctionType): BidTypeEnum | undefined => {
  if (auction.top1of1BidAmount > auction.totalOpenEditionBidsAmount)
    return BidTypeEnum['1of1'];
  else if (auction.totalOpenEditionBidsAmount > 0)
    return BidTypeEnum.OpenEdition;
  else return;
};

const _refundPreviousTop1of1Bidder = (auction: AuctionType) => {
  const walletIndex = useWallets
    .getState()
    .wallets.findIndex(wallet => wallet.address == auction.top1of1BidAddress);
  if (walletIndex == -1) return;

  useWallets
    .getState()
    .increaseWalletBalance(walletIndex, auction.top1of1BidAmount);
  auction.balance -= auction.top1of1BidAmount;
  auction.logs.push({
    text: `${auction.top1of1BidAddress?.slice(0, 10)} was refunded ${
      auction.top1of1BidAmount
    } ETH for previous top 1 of 1 bid`,
    createdAt: useClockTime.getState().time
  });
};

export default useAuctions;
