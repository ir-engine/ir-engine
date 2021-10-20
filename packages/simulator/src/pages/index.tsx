import React from 'react';
import AuctionEmbed from '@app/components/AuctionEmbed';
import useAuctions from '@app/features/useAuctions';
import useWallets from '@app/features/useWallets';
import useClockTime from '@app/features/useClockTime';
import CreateAuctionForm from '@app/components/CreateAuctionForm';

const IndexPage = () => {
  const wallets = useWallets(state => state.wallets);
  const activeWallet = useWallets(state => state.activeWalletIndex);
  const updateWalletBalance = async (index: number) => {
    const amount = prompt('Set new balance');
    if (!amount || isNaN(parseFloat(amount))) return alert('Invalid amount');
    await useWallets.getState().setWalletBalance(index, parseFloat(amount));
  };
  const auctions = useAuctions(state => state.auctions);
  const clockTime = useClockTime(state => state.time);
  const clockRunning = useClockTime(state => state.running != undefined);
  return (
    <div className="index">
      <div className="sidebar">
        <CreateAuctionForm />
        <div className="clock">
          Clock time: {clockTime.toLocaleString()}s{' '}
          <button
            onClick={
              clockRunning
                ? useClockTime.getState().stopClock
                : useClockTime.getState().startClock
            }
          >
            {clockRunning ? 'Pause' : 'Start'}
          </button>
        </div>

        <div className="spacer" />
        <div className="wallets">
          <table>
            <tbody>
              {wallets.map((wallet, i) => (
                <tr
                  key={wallet.address}
                  className={`wallet ${activeWallet == i ? 'active' : ''}`}
                >
                  <td>{i + 1}</td>
                  <td>{wallet.address.slice(0, 10)}</td>
                  <td />
                  <td>
                    {wallet.balance} ETH{' '}
                    <button onClick={() => updateWalletBalance(i)}>
                      Change
                    </button>
                  </td>
                  <td>
                    {activeWallet == i ? (
                      <button disabled>Active</button>
                    ) : (
                      <button
                        onClick={() => useWallets.getState().setActiveWallet(i)}
                      >
                        Switch
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={useWallets.getState().createWallet}>
          Generate New Wallet
        </button>
      </div>
      <div className="main">
        {auctions.map(auction => (
          <AuctionEmbed key={auction.tokenAddress} auction={auction} />
        ))}
      </div>
      <style jsx>{`
        .index {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          height: 100vh;
          width: 100vw;
        }
        .sidebar {
          background-color: #f1f1f1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .spacer {
          flex: 1 1 auto;
        }
        .wallets {
          max-height: 400px;
          overflow: auto;
          background-color: #dfdfdf;
        }
        .wallets::-webkit-scrollbar {
          width: 5px;
          background-color: #ccc;
        }
        .wallets::-webkit-scrollbar-thumb {
          background: #888;
        }
        .wallets button {
          font-size: 10px;
        }
        tbody {
          width: 100%;
        }
        .wallet.active {
          background-color: gold;
        }
        td {
          padding: 5px;
        }
        .main {
          flex: 1 1 auto;
          align-self: flex-start;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          padding: 10px;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};

export default IndexPage;
