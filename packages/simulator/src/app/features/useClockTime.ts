import create from 'zustand';

type StoreState = {
  running?: number;
  time: number;
  startClock: () => void;
  stopClock: () => void;
};

const useClockTime = create<StoreState>((set, get) => ({
  time: 0,
  startClock: () => {
    set({
      running: setInterval(() => {
        set({ time: get().time + 1 });
      }, 1000) as any as number
    });
  },
  stopClock: () => {
    clearInterval(get().running);
    set({ running: undefined });
  }
}));
export default useClockTime;
