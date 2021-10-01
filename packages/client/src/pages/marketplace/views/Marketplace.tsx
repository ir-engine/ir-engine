/* global BigInt */
import React from 'react';
import extjs from '../ic/extjs';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Listings from '../components/Listings';
import Wallet from '../components/Wallet';
import Button from '@material-ui/core/Button';
import {StoicIdentity} from "ic-stoic-identity";
import Sidebar from '../components/Sidebar';
const api = extjs.connect("https://boundary.ic0.app/");
const txfee = 10000;
const txmin = 100000;
const collections = [
  {
    canister : "e3izy-jiaaa-aaaah-qacbq-cai",
    name : "Cronic Critters",
    mature : false,
    commission : 0.015,
    comaddress : "c7e461041c0c5800a56b64bb7cefc247abc0bbbb99bd46ff71c64e92d9f5c2f9",
    blurb : (<>Cronics is a Play-to-earn NFT game being developed by ToniqLabs for the Internet Computer. Cronics  incorporates breeding mechanics, wearable NFTs and a p2e minigame ecosystem and more. Join the <a href="https://t.me/cronic_fun" target="_blank" rel="noreferrer">Telegram group</a> or read more on <a href="https://toniqlabs.medium.com/cronics-breeding-and-supply-604fa374776d" target="_blank" rel="noreferrer">Medium</a></>)
  },
  {
    canister : "nbg4r-saaaa-aaaah-qap7a-cai",
    name : "Starverse",
    mature : false,
    commission : 0.015,
    comaddress : "c7e461041c0c5800a56b64bb7cefc247abc0bbbb99bd46ff71c64e92d9f5c2f9",
    blurb:false,
  },
  {
    canister : "bxdf4-baaaa-aaaah-qaruq-cai",
    name : "ICPunks",
    mature : false,
    commission : 0.03,
    comaddress : "c47942416fa8e7151f679d57a6b2d2e01a92fecd5e6f9ac99f6db548ea4f37aa",
    blurb : (<>Are you down with the clown? Get your hands on the latest NFT to hit the Internet Computer! You can wrap and trade them on the Marketplace! <strong>Wrapped ICPunks are 1:1 wrapped versions of actual ICPunks</strong> - you can read more about how to wrap, unwrap, and how safe it is <a href="https://medium.com/@toniqlabs/wrapped-nfts-8c91fd3a4c1" target="_blank" rel="noreferrer">here</a></>)
  },
  {
    canister : "3db6u-aiaaa-aaaah-qbjbq-cai",
    name : "IC Drip",
    mature : false,
    commission : 0.015,
    comaddress : "c7e461041c0c5800a56b64bb7cefc247abc0bbbb99bd46ff71c64e92d9f5c2f9",
    blurb:(<>IC Drip are randomly generated meta-commerce shopping carts for outfits and personas stored on chain. Stats, images, and other functionality are intentionally omitted for others to interpret. Feel free to use IC Drip in any way you want. <a href="https://dvr6e-lqaaa-aaaai-qam5a-cai.raw.ic0.app/" target="_blank" rel="noreferrer">IC Drip Website</a></>),
  },
  {
    canister : "73xld-saaaa-aaaah-qbjya-cai",
    name : "Wing",
    mature : true,
    commission : 0.02,
    comaddress : "1d978f4f38d19dca4218832e856c956678de0aa470cd492f5d8ac4377db6f2a2",
    blurb:(<>To escape from containment and restriction, releasing the stressors held so long in the body, Wings’s ego is jettisoned as she explores a more fundamental form of existence, expressing her humanity in this elemental piece.<br />She is framed within the themes of air, water, to take flight on chalky cliff tops overlooking distant horizons, to express the existential freedom that lives within. No borders.<br />And so through this series I invite the viewer to celebrate their own sovereignty of consciousness; to be bold as we emerge from our cocoons and open ourselves up to the world and each other again.</>),
  },
  {
    canister : "uzhxd-ziaaa-aaaah-qanaq-cai",
    name : "ICP News",
    mature : false,
    commission : 0.015,
    comaddress : "c7e461041c0c5800a56b64bb7cefc247abc0bbbb99bd46ff71c64e92d9f5c2f9",
    blurb:false,
  },
  {
    canister : "tde7l-3qaaa-aaaah-qansa-cai",
    name : "Cronic Wearables",
    mature : false,
    commission : 0.015,
    comaddress : "c7e461041c0c5800a56b64bb7cefc247abc0bbbb99bd46ff71c64e92d9f5c2f9",
    blurb:false,
  },
  {
    canister : "gevsk-tqaaa-aaaah-qaoca-cai",
    name : "ICmojis",
    mature : false,
    commission : 0.015,
    comaddress : "df13f7ef228d7213c452edc3e52854bc17dd4189dfc0468d8cb77403e52b5a69",
    blurb:false,
  },
  {
    canister : "owuqd-dyaaa-aaaah-qapxq-cai",
    name : "ICPuzzle",
    mature : true,
    commission : 0.015,
    comaddress : "c7e461041c0c5800a56b64bb7cefc247abc0bbbb99bd46ff71c64e92d9f5c2f9",
    blurb:false,
  },
];
function useInterval(callback, delay) {
  const savedCallback = React.useRef();
  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
const useStyles = makeStyles((theme) => ({
  walletBtn : {
    [theme.breakpoints.up('sm')]: {
      display: "none",
    },
  },
  content : {
    flexGrow: 1,
    marginTop: 73,
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginLeft: 300,
    },
  },
}));
var processingPayments = false, processingRefunds = false;
export default function Marketplace(props) {
  const [identity, setIdentity] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [address, setAddress] = React.useState(false);
  const [balance, setBalance] = React.useState(0);
  const [accounts, setAccounts] = React.useState(false);
  const [currentAccount, setCurrentAccount] = React.useState(0);
  const [view, setView] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const _updates = async () => {
    await processPayments();
    await processRefunds();
  };
  const processPayments = async () => {
    if (processingPayments) return;
    processingPayments = true;
    const _api = extjs.connect("https://boundary.ic0.app/", identity);
    for(var j = 0; j < collections.length; j++){
      var payments = await _api.canister(collections[j].canister).payments();
      if (payments.length === 0) continue;
      if (payments[0].length === 0) continue;
      console.log("Payments found: " + payments[0].length);
      var a, b, c, payment;
      for(var i = 0; i < payments[0].length; i++) {
        payment = payments[0][i];
        a = extjs.toAddress(identity.getPrincipal().toText(), payment);
        b = Number(await api.token().getBalance(a));
        c = Math.round(b * collections[j].commission);
        try {
          var txs = [];
          if (b > txmin) {
            txs.push(_api.token().transfer(identity.getPrincipal().toText(), payment, address, BigInt(b-(txfee + c)), BigInt(txfee)));
            txs.push(_api.token().transfer(identity.getPrincipal().toText(), payment, collections[j].comaddress, BigInt(c-txfee), BigInt(txfee)));
          }
          await Promise.all(txs);
          console.log("Payment extracted successfully");
        } catch (e) {
          console.log(e);
        };
      };
    };
    processingPayments = false;
  };
  const processRefunds = async () => {
    if (processingRefunds) return;
    processingRefunds = true;
    const _api = extjs.connect("https://boundary.ic0.app/", identity);
    for(var j = 0; j < collections.length; j++){
      var refunds = await _api.canister(collections[j].canister).refunds();
      if (refunds.length === 0) continue;
      if (refunds[0].length === 0) continue;
      console.log("Refunds found: " + refunds[0].length);
      var a, b, refund;
      for(var i = 0; i < refunds[0].length; i++) {
        refund = refunds[0][i];
        a = extjs.toAddress(identity.getPrincipal().toText(), refund);
        b = Number(await api.token().getBalance(a));
        try {
          if (b > txfee) {
            //Process refunds
            await _api.token().transfer(identity.getPrincipal().toText(), refund, "07ce335b2451bec20426497d97afb0352d89dc3f1286bf26909ecb90cf370c76", BigInt(b-txfee), txfee);
          }
          await _api.canister(collections[j].canister).removeRefunds([refund]);
          console.log("Refund removed successfully");
        } catch (e) {};
      };
    };
    processingRefunds = false;
  };
  const theme = useTheme();
  const classes = useStyles();
  const styles = {
    root : {
      flexGrow: 1,
      padding: theme.spacing(3),
    },

    empty : {
      maxWidth:800,
      margin : "0 auto",
      textAlign:"center"
    },
    grid: {
      flexGrow: 1,
      padding: theme.spacing(2)
    },

    largeIcon: {
      width: 60,
      height: 60,
    },
  };
  
  const logout = async () => {
    localStorage.removeItem("_loginType");
    StoicIdentity.disconnect();
    setIdentity(false);
    setAccounts([]);
  };
  const login = async (t) => {
    props.loader(true, "Connecting your wallet...");
    try {
      var id;
      switch(t) {
        case "stoic":
            id = await StoicIdentity.connect();
            if (id) {
              setIdentity(id);
              id.accounts().then(accs => {
                setAccounts(JSON.parse(accs));
              });
              setCurrentAccount(0);
              localStorage.setItem("_loginType", t);
            } else {
              throw new Error("Failed to connect to your wallet");
            }
        break;
        case "plug":
          const result = await window.ic.plug.requestConnect({
            whitelist : [...collections.map(a => a.canister), "d3ttm-qaaaa-aaaai-qam4a-cai", "qcg3w-tyaaa-aaaah-qakea-cai", "ryjl3-tyaaa-aaaaa-aaaba-cai", "qgsqp-byaaa-aaaah-qbi4q-cai"]
          });
          if (result) {
            id = await window.ic.plug.agent._identity;
            setIdentity(id);
            setAccounts([{
              name : "PlugWallet",
              address : extjs.toAddress(id.getPrincipal().toText(), 0)
            }]);
            setCurrentAccount(0);
            localStorage.setItem("_loginType", t);
          } else {
            throw new Error("Failed to connect to your wallet");
          }
        break;
        default:
        break;
      };
    } catch (e) {
      props.error(e);
    };
    props.loader(false);
  };
  
  useInterval(_updates, 60 *1000);
  React.useEffect(() => {
    var t = localStorage.getItem("_loginType");
    if (t) {
      switch(t){
        case "stoic":
          StoicIdentity.load().then(async identity => {
            if (identity !== false) {
              //ID is a already connected wallet!
              setIdentity(identity);
              identity.accounts().then(accs => {
                setAccounts(JSON.parse(accs));
              });
            }
          })
        break;
        case "plug":
          (async () => {
            const connected = await window.ic.plug.isConnected();
            if (connected){
              if (!window.ic.plug.agent) {
                await window.ic.plug.createAgent({
                  whitelist : [...collections.map(a => a.canister), "d3ttm-qaaaa-aaaai-qam4a-cai", "qcg3w-tyaaa-aaaah-qakea-cai", "ryjl3-tyaaa-aaaaa-aaaba-cai", "qgsqp-byaaa-aaaah-qbi4q-cai"]
                })
              }
              var id = await window.ic.plug.agent._identity;
              setIdentity(id);
              setAccounts([{
                name : "PlugWallet",
                address : extjs.toAddress(id.getPrincipal().toText(), 0)
              }]);
              
            }
          })();
        break;
        default:
        break;
      }
    }
    _updates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (identity) {
      extjs.connect("https://boundary.ic0.app/", identity).canister("qgsqp-byaaa-aaaah-qbi4q-cai").log();
      setLoggedIn(true);
      setAddress(extjs.toAddress(identity.getPrincipal().toText(), 0));
    } else {
      setLoggedIn(false);
      setAddress(false);
      setAccounts(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);
  
  return (
    <>
      <Sidebar setBalance={setBalance} identity={identity} view={view} setView={setView} account={accounts.length > 0 ? accounts[currentAccount] : false} loader={props.loader} logout={logout} login={login} collections={collections} currentAccount={currentAccount} accounts={accounts} onClose={handleDrawerToggle} open={mobileOpen} />
      <main className={classes.content}>      
        <div style={styles.root}>
          <Button className={classes.walletBtn} fullWidth variant={"contained"} onClick={handleDrawerToggle} color={"primary"} style={{fontWeight:"bold", margin:"0 auto"}}>View Wallet</Button>
          {view === false ?
          <Listings balance={balance} identity={identity} confirm={props.confirm} account={accounts.length > 0 ? accounts[currentAccount] : false} loggedIn={loggedIn} collections={collections} loader={props.loader} alert={props.alert} error={props.error}  />: "" }
          {view !== false ?
          <Wallet identity={identity} confirm={props.confirm} currentAccount={currentAccount} account={accounts.length > 0 ? accounts[currentAccount] : false} loggedIn={loggedIn} collections={collections} collection={view} loader={props.loader} alert={props.alert} error={props.error}  />: "" }
        </div>
      </main>
    </>
  );
}

