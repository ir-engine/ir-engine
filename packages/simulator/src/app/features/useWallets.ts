import create, { State, StateCreator } from 'zustand';
import produce, { Draft } from 'immer';
import generateRandomAddress from './generateRandomAddress';

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

type Wallet = {
  address: string;
  balance: number;
};

type StoreState = {
  wallets: Wallet[];
  activeWalletIndex: number;
  setActiveWallet: (wallet: number) => void;
  createWallet: () => void;
  increaseWalletBalance: (wallet: number, amount: number) => void;
  decreaseWalletBalance: (wallet: number, amount: number) => void;
  setWalletBalance: (wallet: number, balance: number) => void;
  decreaseActiveWalletBalance: (amount: number) => void;
};

const generateDefaultWallet = () => ({
  address: generateRandomAddress(),
  balance: 100
});

const useWallets = create<StoreState>(
  immer(set => ({
    wallets: new Array(10).fill(null).map(() => generateDefaultWallet()),
    activeWalletIndex: 0,
    setActiveWallet: (wallet: number) => set({ activeWalletIndex: wallet }),
    createWallet: () => {
      const wallet = generateDefaultWallet();
      set(state => {
        state.wallets = [...state.wallets, wallet];
        return state;
      });
    },
    setWalletBalance: (walletIndex: number, amount: number) => {
      set(state => {
        state.wallets[walletIndex].balance = amount;
        return state;
      });
    },
    increaseWalletBalance: (walletIndex: number, amount: number) => {
      set(state => {
        state.wallets[walletIndex].balance += amount;
        return state;
      });
    },
    decreaseWalletBalance: (walletIndex: number, amount: number) => {
      set(state => {
        state.wallets[walletIndex].balance -= amount;
        return state;
      });
    },
    decreaseActiveWalletBalance: (amount: number) => {
      set(state => {
        state.wallets[state.activeWalletIndex].balance -= amount;
        return state;
      });
    }
  }))
);
export default useWallets;
