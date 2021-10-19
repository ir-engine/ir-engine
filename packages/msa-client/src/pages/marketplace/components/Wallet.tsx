/* global BigInt */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import extjs from '../ic/extjs';
import getNri from '../ic/nftv';
import { useTheme } from '@material-ui/core/styles';
import NFT from './NFT';
import ListingForm from './ListingForm';
import TransferForm from './TransferForm';
const api = extjs.connect("https://boundary.ic0.app/");
const perPage = 60;
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


const canisterMap= {
  "qcg3w-tyaaa-aaaah-qakea-cai" : "bxdf4-baaaa-aaaah-qaruq-cai",
  "d3ttm-qaaaa-aaaai-qam4a-cai" : "3db6u-aiaaa-aaaah-qbjbq-cai",
};
export default function Wallet(props) {
  const [nfts, setNfts] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState('mint_number');
  const [wearableFilter, setWearableFilter] = React.useState('all');
  const [openListingForm, setOpenListingForm] = React.useState(false);
  const [openTransferForm, setOpenTransferForm] = React.useState(false);
  const [tokenNFT, setTokenNFT] = React.useState('');

  const changeWearableFilter = async (event) => {
    setPage(1);
    setWearableFilter(event.target.value);
  };
  const closeListingForm = () => {
    setOpenListingForm(false);
    setTimeout(() => setTokenNFT(''), 300);
  };
  const closeTransferForm = () => {
    setOpenTransferForm(false);
    setTimeout(() => setTokenNFT(''), 300);
  };
  const listNft = (token) => {
    setTokenNFT(token);
    setOpenListingForm(true);
  }
  const cancelNft = (token) => {
    list(token.id, 0);
  }
  const unwrapNft = async (token) => {
    props.loader(true, "Unwrapping NFT...");
    var canister = extjs.decodeTokenId(token.id).canister;
    console.log(canister);
    //hot api, will sign as identity - BE CAREFUL
    var r = await extjs.connect("https://boundary.ic0.app/", props.identity).canister(canister).unwrap(token.id, [extjs.toSubaccount(props.currentAccount ?? 0)]);
    if (!r) {
      props.loader(false);
      return props.error("Couldn't unwrap!");
    }
    props.loader(true, "Loading NFTs...");
    await refresh();
    props.loader(false);
    return props.alert("Success!", "Your NFT has been unwrapped!");
  }
  const transferNft = async (token) => {
    setTokenNFT(token);
    setOpenTransferForm(true);
  };
  const wrapAndlistNft = async (token) => {
    var v = await props.confirm("We need to wrap this", "You are trying to list a non-compatiable NFT for sale. We need to securely wrap this NFT first. Would you like to proceed?")
    if (v) {
      var canister = canisterMap[extjs.decodeTokenId(token.id).canister];
      console.log(canister);
      props.loader(true, "Creating wrapper...this may take a few minutes");
      try{
        var r = await extjs.connect("https://boundary.ic0.app/", props.identity).canister(canister).wrap(token.id);
        if (!r) return error("There was an error wrapping this NFT!");
        props.loader(true, "Sending NFT to wrapper...");
        //var r2 = await extjs.connect("https://boundary.ic0.app/", props.identity).canister("qcg3w-tyaaa-aaaah-qakea-cai").transfer_to(props.identity.getPrincipal(), token.id);
        var r2 = await extjs.connect("https://boundary.ic0.app/", props.identity).token(token.id).transfer(props.identity.getPrincipal().toText(), props.currentAccount, canister, BigInt(1), BigInt(0), "00", false);
        if (!r2) return error("There was an error wrapping this NFT!");
        props.loader(true, "Wrapping NFT...");
        await extjs.connect("https://boundary.ic0.app/", props.identity).canister(canister).mint(token.id);
        if (!r) return error("There was an error wrapping this NFT!");
        props.loader(true, "Loading NFTs...");
        await refresh();
        props.loader(false);
        //New token id
        token.id = extjs.encodeTokenId(canister, token.index);
        token.canister = canister;
        token.wrapped = true;
        console.log(token);
        listNft(token);
      } catch(e) {
        props.loader(false);
        console.log(e);
        return error("Unknown error!");
      };
    }
  }

  const error = (e) => {
    props.loader(false);
    props.error(e);
  }
  const changeSort = (event) => {
    setPage(1);
    setSort(event.target.value);
  };
  const transfer = async (id, address) => {
    props.loader(true, "Transferring NFT...");
    try {
      var r2 = await extjs.connect("https://boundary.ic0.app/", props.identity).token(id).transfer(props.identity.getPrincipal().toText(), props.currentAccount, address, BigInt(1), BigInt(0), "00", false);
      if (!r2) return error("There was an error transferring this NFT!");
      props.loader(true, "Loading NFTs...");
      await refresh();
      props.loader(false);
      return props.alert("Transaction complete", "Your listing has been updated");
    } catch (e) {
      props.loader(false);
      return props.error(e);
    };
  };
  const list = async (id, price) => {
    //Submit to blockchain here
    props.loader(true);
    const api = extjs.connect("https://boundary.ic0.app/", props.identity);
    api.token(id).list(0, price).then(r => {
      if (r) {
        refresh();
        return props.alert("Transaction complete", "Your listing has been updated");
      } else {        
        return props.error("Something went wrong with this transfer");
      }
    }).catch(e => {
      return props.error("There was an error: " + e);
    }).finally(() => {
      props.loader(false);
    });
  };
  const applyFilters = a => {
    if (props.collection.canister === "tde7l-3qaaa-aaaah-qansa-cai" && wearableFilter !== "all") {
      var map = ["accessories","hats","eyewear","pets"];
      a = a.filter(_a => map[_a[2].nonfungible.metadata[0][0]] === wearableFilter);
    };
    return a;
  };
  const _updates = async () => {
    await refresh();
  };

  
  const refresh = async (c) => {
    c = c ?? props.collection.canister;
    var nfts = await api.token(c).getTokens(props.account.address);
    if (c === "bxdf4-baaaa-aaaah-qaruq-cai") {
      nfts = nfts.map(a => {a.wrapped = true; return a});
      nfts = nfts.concat(await api.token("qcg3w-tyaaa-aaaah-qakea-cai").getTokens(props.account.address, props.identity.getPrincipal().toText()));
    }else if (c === "3db6u-aiaaa-aaaah-qbjbq-cai") {
      nfts = nfts.map(a => {a.wrapped = true; return a});
      nfts = nfts.concat(await api.token("d3ttm-qaaaa-aaaai-qam4a-cai").getTokens(props.account.address, props.identity.getPrincipal().toText()));
    };
    setNfts(applyFilters(nfts)); 
  }
  
  const theme = useTheme();
  const styles = {
    empty : {
      maxWidth:800,
      margin : "0 auto",
      textAlign:"center"
    },
    grid: {
      flexGrow: 1,
      padding: theme.spacing(2)
    },
  };
  
  useInterval(_updates, 10 *1000);
  React.useEffect(() => {
    setNfts([]);
    props.loader(true);        
    _updates().then(() => {
      props.loader(false);        
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.collection]);
  
  React.useEffect(() => {
    props.loader(true);
    refresh().finally(() => props.loader(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wearableFilter]);
  return (
    <>
      <div style={styles.empty}>
        <h1>My NFTs: <span style={{color: "#00d092"}}>{props.collection.name}</span></h1>
      </div>
      <>
        <div style={{marginLeft:"20px",marginTop:"10px"}}>
          
          <FormControl style={{marginRight:20}}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sort}
              onChange={changeSort}
            >
              <MenuItem value={"mint_number"}>Minting #</MenuItem>
              {["e3izy-jiaaa-aaaah-qacbq-cai", "nbg4r-saaaa-aaaah-qap7a-cai"].indexOf(props.collection.canister) >= 0 ? <MenuItem value={"type"}>Rare Type</MenuItem> : ""}
              { ["3db6u-aiaaa-aaaah-qbjbq-cai", "bxdf4-baaaa-aaaah-qaruq-cai", "e3izy-jiaaa-aaaah-qacbq-cai", "nbg4r-saaaa-aaaah-qap7a-cai"].indexOf(props.collection.canister) >= 0 ? <MenuItem value={"gri"}>NFT Rarity Index</MenuItem> : "" }
            </Select>
          </FormControl>
          
          {["tde7l-3qaaa-aaaah-qansa-cai"].indexOf(props.collection.canister) >= 0 ? 
          <FormControl style={{minWidth:120}}>
            <InputLabel>Wearable Type</InputLabel>
            <Select
              value={wearableFilter}
              onChange={changeWearableFilter}
            >
              <MenuItem value={"all"}>All Wearables</MenuItem>
              <MenuItem value={"pets"}>Pets</MenuItem>
              <MenuItem value={"accessories"}>Accessories/Flags</MenuItem>
              <MenuItem value={"hats"}>Hats/Hair</MenuItem>
              <MenuItem value={"eyewear"}>Eyewear</MenuItem>
            </Select>
          </FormControl> : "" }
          
          {nfts.length > perPage ?
          (<Pagination style={{float:"right",marginTop:"5px",marginBottom:"20px"}} size="small" count={Math.ceil(nfts.length/perPage)} page={page} onChange={(e, v) => setPage(v)} />) : "" }
        </div>
          <>{nfts === false ?
            <div style={styles.empty}>
              <Typography paragraph style={{paddingTop:20,fontWeight:"bold"}} align="center">Loading...</Typography>
            </div> :
            <>{nfts.length === 0 ?
              <div style={styles.empty}>
                <Typography paragraph style={{paddingTop:20,fontWeight:"bold"}} align="center">There are currently no nfts right now</Typography>
              </div> :
              <>
                <div style={styles.grid}>
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                  >
                    {nfts.slice().sort((a,b) => {
                      switch(sort) {
                        case "gri":
                          return (Number(getNri(props.collection.canister, b.index))*100)-(Number(getNri(props.collection.canister, a.index))*100);
                        case "recent":
                          return 1;
                        case "oldest":
                          return -1;
                        case "mint_number":
                          return a.index-b.index;
                        case "type":
                          var _a, _b, d;
                          if (props.collection.canister === "nbg4r-saaaa-aaaah-qap7a-cai") {
                            _a = a[2].nonfungible.metadata[0][0];
                            _b = b[2].nonfungible.metadata[0][0];
                            d = _b-_a;
                            if (d === 0) {
                              if (Number(a[1].price)>Number(b[1].price)) return 1;
                              if (Number(a[1].price)<Number(b[1].price)) return -1;
                            };
                            return d;
                          } else {
                            _a = a[2].nonfungible.metadata[0][30]%41;
                            _b = b[2].nonfungible.metadata[0][30]%41;
                            if (_a === 2) _a = 1;
                            if (_a > 1) _a = 2;
                            if (_b === 2) _b = 1;
                            if (_b > 1) _b = 2;
                            d = _a-_b;
                            if (d === 0) {
                              if (Number(a[1].price)>Number(b[1].price)) return 1;
                              if (Number(a[1].price)<Number(b[1].price)) return -1;
                            };
                            return d;
                          }
                        default:
                          return 0;
                      };
                    }).filter((token,i) => (i >= ((page-1)*perPage) && i < ((page)*perPage))).map((nft, i) => {
                      return (<NFT gri={getNri(props.collection.canister, nft.index)} loggedIn={props.loggedIn} listNft={listNft} cancelNft={cancelNft} wrapAndlistNft={wrapAndlistNft} unwrapNft={unwrapNft} transferNft={transferNft} collection={props.collection.canister} key={nft.id+"-"+i} nft={nft} />)
                    })}
                  </Grid>
                </div>
              </>
            }</>
          }</>
        {(nfts.length > perPage ?
        (<Pagination style={{float:"right",marginTop:"5px",marginBottom:"20px"}} size="small" count={Math.ceil(nfts.length/perPage)} page={page} onChange={(e, v) => setPage(v)} />) : "" )}
      </>
      <TransferForm transfer={transfer} alert={props.alert} open={openTransferForm} close={closeTransferForm} loader={props.loader} error={props.error} nft={tokenNFT} />
      <ListingForm collection={props.collection.canister} list={list} alert={props.alert} open={openListingForm} close={closeListingForm} loader={props.loader} error={props.error} nft={tokenNFT} />
    </>
  )
}
