import React from 'react';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import Pagination from '@material-ui/lab/Pagination';
import extjs from '../ic/extjs';
import getNri from '../ic/nftv';
import { useTheme } from '@material-ui/core/styles';
import Listing from './Listing';
import Sold from './Sold';
import BuyForm from './BuyForm';
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
      (savedCallback.current as any)();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


const _getRandomBytes = () => {
  var bs = [];
  for(var i = 0; i < 32; i++) {
    bs.push(Math.floor(Math.random() * 256))
  }
  return bs;
};
const _showListingPrice = n => {
  n = Number(n) / 100000000;
  return n.toFixed(8).replace(/0{1,6}$/, '');
};

const emptyListing = {
  pricing : "",
  img : "",
};
export default function Listings(props) {
  const [listings, setListings] = React.useState(false);
  const [transactions, setTransactions] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState('price_asc');
  const [showing, setShowing] = React.useState('all');
  const [wearableFilter, setWearableFilter] = React.useState('all');
  //const [collection, setCollection] = React.useState('nbg4r-saaaa-aaaah-qap7a-cai');
  const [collection, setCollection] = React.useState('e3izy-jiaaa-aaaah-qacbq-cai');
  const [buyFormData, setBuyFormData] = React.useState(emptyListing); 
  const [showBuyForm, setShowBuyForm] = React.useState(false);

  const changeWearableFilter = async (event) => {
    setPage(1);
    setWearableFilter(event.target.value);
  };
  const changeCollection = async (event) => {
    setWearableFilter('all');
    setSort('price_asc');
    setShowing('all');
    setCollection(event.target.value);
    setListings(false);
    setTransactions(false);
    setPage(1);
    props.loader(true);     
    await refresh('all', event.target.value);
    props.loader(false);  
  }
  const changeSort = (event) => {
    setPage(1);
    setSort(event.target.value);
  };
  const buyForm = (price, img) => {
    return new Promise(async (resolve, reject) => {
      setBuyFormData({
        price : price,
        img : img,
        handler : (v) => {
          setShowBuyForm(false);
          resolve(v);
          setTimeout(() => setBuyFormData(emptyListing), 100);
        },
      });
      setShowBuyForm(true);
    })
  };
  const changeShowing = (event) => {
    setWearableFilter('all');
    setPage(1);
    setShowing(event.target.value);
    if (event.target.value === "all") {
      setSort('price_asc');
    } else {
      setSort('recent');
    }
    refresh(event.target.value);
  };
  const buy = async (collection, listing) => {
    if (props.balance < (listing[1].price + 10000n)) return props.alert("There was an error", "Your balance is insufficient to complete this transaction");
    var tokenid = extjs.encodeTokenId(collection, listing[0])
    try {
      var img = (collection === "bxdf4-baaaa-aaaah-qaruq-cai" ? "https://qcg3w-tyaaa-aaaah-qakea-cai.raw.ic0.app/Token/"+listing[0] : "https://" + collection + ".raw.ic0.app/?tokenid="+tokenid);
      var answer = await buyForm(_showListingPrice(listing[1].price), img);
      if (!answer) {
        return props.loader(false);
      };
      props.loader(true, "Locking NFT...");
      const api = extjs.connect("https://boundary.ic0.app/", props.identity);
      var r = await api.canister(collection).lock(tokenid, listing[1].price, props.account.address, _getRandomBytes());
      if (r.hasOwnProperty("err")) throw r.err;
      var paytoaddress = r.ok;
      props.loader(true, "Transferring ICP...");
      await api.token().transfer(props.identity.getPrincipal(), 0, paytoaddress, listing[1].price, 10000);
      var r3;
      while(true){
        try {
          props.loader(true, "Settling purchase...");
          r3 = await api.canister(collection).settle(tokenid);
          if (r3.hasOwnProperty("ok")) break;
        } catch (e) {}
      }
      props.loader(false);
      props.alert("Transaction complete", "Your purchase was made successfully - your NFT will be sent to your address shortly");
      refresh();
    } catch (e) {
      props.loader(false);
      console.log(e);
      props.alert("There was an error", e.Other ?? "You may need to enable cookies or try a different browser");
    };
  };
  const applyFilters = a => {
    if (collection === "tde7l-3qaaa-aaaah-qansa-cai" && wearableFilter !== "all") {
      var map = ["accessories","hats","eyewear","pets"];
      a = a.filter(_a => map[_a[2].nonfungible.metadata[0][0]] === wearableFilter);
    };
    return a;
  };
  const _updates = async () => {
    await refresh();
  };

  
  const refresh = async (s, c?) => {
    s = s ?? showing;
    c = c ?? collection;
    if (s === "all") {      
      var listings = await api.canister(c).listings();
      setListings(applyFilters(listings));
    } else {
      var txs = await api.canister(c).transactions()
      var nt = txs;
      if (c === "e3izy-jiaaa-aaaah-qacbq-cai") {
        nt = txs.slice(82);
      }
      setTransactions(applyFilters(nt));
    }    
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
    props.loader(true);        
    _updates().then(() => {
      props.loader(false);        
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  React.useEffect(() => {
    props.loader(true);
    refresh().finally(() => props.loader(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wearableFilter]);
  return (
    <>
      <div style={styles.empty}>
        <h1>
          Browse Collections:
          <FormControl >
            <Select
              style={{marginLeft:10,fontSize: "0.95em", fontWeight:"bold",paddingBottom:0,color:"#00d092"}}
              value={collection}
              onChange={changeCollection}
            > 
            {props.collections.map(collection => {
              return (<MenuItem key={collection.canister} value={collection.canister}>{collection.name}{collection.mature ? <Chip style={{marginLeft:"10px"}} variant="outlined" size="small" label="Mature" /> : ""}</MenuItem>)
            })}
              <MenuItem disabled value={""}>More coming soon!</MenuItem>
            </Select>
          </FormControl>
        </h1>
        {props.collections.find(c => c.canister === collection).blurb ?
        <p style={{fontSize:"1.2em"}}>{props.collections.find(c => c.canister === collection).blurb}</p> : ""}
      </div>
      <>
        <div style={{marginLeft:"20px",marginTop:"10px"}}>
          <FormControl style={{marginRight:20}}>
            <InputLabel>Showing</InputLabel>
            <Select
              value={showing}
              onChange={changeShowing}
            >
              <MenuItem value={"all"}>Current Listings</MenuItem>
              <MenuItem value={"sold"}>Sold Listings</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl style={{marginRight:20}}>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sort}
              onChange={changeSort}
            >
              {/*showing === "all" ? <MenuItem value={"recent"}>Recently Listed</MenuItem> : ""*/}
              {showing === "sold" ? <MenuItem value={"recent"}>Recently Sold</MenuItem> : ""}
              <MenuItem value={"price_asc"}>Price: Low to High</MenuItem>
              <MenuItem value={"price_desc"}>Price: High to Low</MenuItem>
              <MenuItem value={"mint_number"}>Minting #</MenuItem>
              {showing === "all" && ["e3izy-jiaaa-aaaah-qacbq-cai", "nbg4r-saaaa-aaaah-qap7a-cai"].indexOf(collection) >= 0 ? <MenuItem value={"type"}>Rare Type</MenuItem> : ""}
              { ["3db6u-aiaaa-aaaah-qbjbq-cai", "bxdf4-baaaa-aaaah-qaruq-cai", "e3izy-jiaaa-aaaah-qacbq-cai", "nbg4r-saaaa-aaaah-qap7a-cai"].indexOf(collection) >= 0 ? <MenuItem value={"gri"}>NFT Rarity Index</MenuItem> : "" }
              {/*showing === "all" ? <MenuItem value={"oldest"}>Oldest</MenuItem> : ""*/}
              {showing === "sold" ? <MenuItem value={"oldest"}>Oldest</MenuItem> : ""}
            </Select>
          </FormControl>
          
          {showing === "all" && ["tde7l-3qaaa-aaaah-qansa-cai"].indexOf(collection) >= 0 ? 
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
          
          {showing === "all" ? 
            (listings.length > perPage ?
              (<Pagination style={{float:"right",marginTop:"5px",marginBottom:"20px"}} size="small" count={Math.ceil(listings.length/perPage)} page={page} onChange={(e, v) => setPage(v)} />) : "" )
            :
            (transactions.length > perPage ?
            (<Pagination style={{float:"right",marginTop:"5px",marginBottom:"20px"}} size="small" count={Math.ceil(transactions.length/perPage)} page={page} onChange={(e, v) => setPage(v)} />) : "")
          }
        </div>
        {showing === "all" ? 
          <>{listings === false ?
            <div style={styles.empty}>
              <Typography paragraph style={{paddingTop:20,fontWeight:"bold"}} align="center">Loading...</Typography>
            </div> :
            <>{listings.length === 0 ?
              <div style={styles.empty}>
                <Typography paragraph style={{paddingTop:20,fontWeight:"bold"}} align="center">There are currently no listings right now</Typography>
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
                    {listings.slice().sort((a,b) => {
                      switch(sort) {
                        case "price_asc":
                          return Number(a[1].price)-Number(b[1].price);
                        case "price_desc":
                          return Number(b[1].price)-Number(a[1].price);
                        case "gri":
                          return (Number(getNri(collection,b[0]))*100)-(Number(getNri(collection, a[0]))*100);
                        case "recent":
                          return 1;
                        case "oldest":
                          return -1;
                        case "mint_number":
                          return a[0]-b[0];
                        case "type":
                          var _a, _b, d;
                          if (collection === "nbg4r-saaaa-aaaah-qap7a-cai") {
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
                    }).filter((token,i) => (i >= ((page-1)*perPage) && i < ((page)*perPage))).map((listing, i) => {
                      return (<Listing gri={getNri(collection, listing[0])} loggedIn={props.loggedIn} collection={collection} buy={buy} key={listing[0]+"-"+i} listing={listing} />)
                    })}
                  </Grid>
                </div>
              </>
            }</>
          }</> : 
          <>{transactions === false ?
            <div style={styles.empty}>
              <Typography paragraph style={{paddingTop:20,fontWeight:"bold"}} align="center">Loading...</Typography>
            </div> :
            <>{transactions.length === 0 ?
              <div style={styles.empty}>
                <Typography paragraph style={{paddingTop:20,fontWeight:"bold"}} align="center">There are currently no sold transactions for this collection</Typography>
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
                    {transactions.slice().sort((a,b) => {
                      switch(sort) {
                        case "price_asc":
                          return Number(a.price)-Number(b.price);
                        case "price_desc":
                          return Number(b.price)-Number(a.price);
                        case "gri":
                          return (Number(getNri(collection, extjs.decodeTokenId(b.token).index))*100)-(Number(getNri(collection, extjs.decodeTokenId(a.token).index))*100);
                        case "recent":
                          return -1;
                        case "oldest":
                          return 1;
                        case "mint_number":
                          return extjs.decodeTokenId(a.token).index-extjs.decodeTokenId(b.token).index;
                        default:
                          return 0;
                      };
                    }).filter((token,i) => (i >= ((page-1)*perPage) && i < ((page)*perPage))).map((transaction, i) => {
                      return (<Sold gri={getNri(collection, extjs.decodeTokenId(transaction.token).index)} key={transaction.token + i} collection={collection} transaction={transaction} />)
                    })}
                  </Grid>
                </div>
              </>
            }</>
          }</>
        }
        {showing === "all" ? 
          (listings.length > perPage ?
            (<Pagination style={{float:"right",marginTop:"5px",marginBottom:"20px"}} size="small" count={Math.ceil(listings.length/perPage)} page={page} onChange={(e, v) => setPage(v)} />) : "" )
          :
          (transactions.length > perPage ?
          (<Pagination style={{float:"right",marginTop:"5px",marginBottom:"20px"}} size="small" count={Math.ceil(transactions.length/perPage)} page={page} onChange={(e, v) => setPage(v)} />) : "")
        }
      </>
<BuyForm open={showBuyForm} {...buyFormData} />
    </>
  )
}
