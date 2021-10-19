import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from '@material-ui/lab/Skeleton';
import Button from '@material-ui/core/Button';
import Timestamp from 'react-timestamp';
import extjs from '../ic/extjs';
const _showListingPrice = n => {
  n = Number(n) / 100000000;
  return n.toFixed(8).replace(/0{1,6}$/, '');
};
export default function Listing(props) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const tokenid = extjs.encodeTokenId(props.collection, props.listing[0]);
  const styles = {
    avatarSkeletonContainer: {
      height: 0,
      overflow: "hidden",
      paddingTop: "100%",
      position: "relative"
    },
    avatarLoader: {
      position: "absolute",
      top: "15%",
      left: "15%",
      width: "70%",
      height: "70%",
      margin: "0 auto"
    },
    avatarImg: {
      position: "absolute",
      top: "0%",
      left: "0%",
      width: "100%",
      height: "100%",
      margin: "0 auto"
    },
    avatarImg2: {
      position: "absolute",
      top: "0%",
      left: "16.66%",
      height: "100%",
      margin: "0 auto"
    }
  };
  const _isLocked = listing => {
    if (listing.locked.length === 0) return false;
    if (Date.now() >= Number(listing.locked[0]/1000000n)) return false;
    return true;
  };

  const buy = async () => {
    return props.buy(props.collection, props.listing);
  };
  const mintNumber = () => {
    if (props.collection === "bxdf4-baaaa-aaaah-qaruq-cai") return props.listing[0];
    if (props.collection === "3db6u-aiaaa-aaaah-qbjbq-cai") return props.listing[0];
    else return props.listing[0]+1;
  }
  const nftImg = () => {
    if (props.collection === "bxdf4-baaaa-aaaah-qaruq-cai") return "https://qcg3w-tyaaa-aaaah-qakea-cai.raw.ic0.app/Token/" + props.listing[0];
    if (props.collection === "3db6u-aiaaa-aaaah-qbjbq-cai") return "https://d3ttm-qaaaa-aaaai-qam4a-cai.raw.ic0.app?tokenId=" + props.listing[0];
    return "https://"+props.collection+".raw.ic0.app/?type=thumbnail&tokenid=" + tokenid;
  };
  const nftLink = () => {
    if (props.collection === "bxdf4-baaaa-aaaah-qaruq-cai") return "https://qcg3w-tyaaa-aaaah-qakea-cai.raw.ic0.app/Token/" + props.listing[0];
    if (props.collection === "3db6u-aiaaa-aaaah-qbjbq-cai") return "https://d3ttm-qaaaa-aaaai-qam4a-cai.raw.ic0.app?tokenId=" + props.listing[0];
    return "https://"+props.collection+".raw.ic0.app/?tokenid=" + tokenid;
  };
  const showNri = () => {
    switch(props.collection){
      case "e3izy-jiaaa-aaaah-qacbq-cai":
      return (<Grid item md={6} sm={6} xs={6}>
                <Typography style={{fontSize: 11, textAlign:"right", fontWeight:"bold"}} color={"inherit"} gutterBottom>
                  <Tooltip title="NFT Rarity Index is a 3rd party metric by NFT Village. For this collection, it displays the color and trait rarity of a specific Cronic relative to others. It does not include Mint #, Twin Status or Animation within the index."><a style={{color:"black",textDecoration: 'none' }} href={"https://nntkg-vqaaa-aaaad-qamfa-cai.ic.fleek.co/?tokenid=" + tokenid} rel="noreferrer" target="_blank">NRI: {(props.gri*100).toFixed(1)}% <span style={{color:"red"}}>*</span></a></Tooltip>
                </Typography>
              </Grid>);
      case "nbg4r-saaaa-aaaah-qap7a-cai":
      return (<Grid item md={6} sm={6} xs={6}>
                <Typography style={{fontSize: 11, textAlign:"right", fontWeight:"bold"}} color={"inherit"} gutterBottom>
                  <Tooltip title="NFT Rarity Index is a 3rd party metric by NFT Village. For this collection, it displays the color and trait rarity of a specific Star relative to others. It does not include Mint # or Twin Status as factors in this index."><a style={{color:"black",textDecoration: 'none' }} href={"https://nntkg-vqaaa-aaaad-qamfa-cai.ic.fleek.co/?tokenid=" + tokenid} rel="noreferrer" target="_blank">NRI: {(props.gri*100).toFixed(1)}% <span style={{color:"red"}}>*</span></a></Tooltip>
                </Typography>
              </Grid>);
      case "bxdf4-baaaa-aaaah-qaruq-cai":
      return (<Grid item md={6} sm={6} xs={6}>
                <Typography style={{fontSize: 11, textAlign:"right", fontWeight:"bold"}} color={"inherit"} gutterBottom>
                  <Tooltip title="NFT Rarity Index is a 3rd party metric by NFT Village. For this collection, it displays the color and trait rarity of a specific ICPunk relative to others. It does not include Mint # or Twin Status as factors in this index."><a style={{color:"black",textDecoration: 'none' }} href={"https://nntkg-vqaaa-aaaad-qamfa-cai.ic.fleek.co/?collection=punks&tokenid=" + mintNumber()} rel="noreferrer" target="_blank">NRI: {(props.gri*100).toFixed(1)}% <span style={{color:"red"}}>*</span></a></Tooltip>
                </Typography>
              </Grid>);
      case "3db6u-aiaaa-aaaah-qbjbq-cai":
      return (<Grid item md={6} sm={6} xs={6}>
                <Typography style={{fontSize: 11, textAlign:"right", fontWeight:"bold"}} color={"inherit"} gutterBottom>
                  <Tooltip title="NFT Rarity Index is a 3rd party metric by NFT Village. For this collection, it displays the trait rarity of a specific IC Drip relative to others. It does not include Mint # as a factor in this index."><a style={{color:"black",textDecoration: 'none' }} href={"https://nntkg-vqaaa-aaaad-qamfa-cai.ic.fleek.co/?collection=drips&tokenid=" + mintNumber()} rel="noreferrer" target="_blank">NRI: {(props.gri*100).toFixed(1)}% <span style={{color:"red"}}>*</span></a></Tooltip>
                </Typography>
              </Grid>);
      default:
      return "";
    }
  };
  return (
    <Grid style={{height:'100%'}} item xl={2} lg={3} md={4} sm={6} xs={6}>
        <Card>
          <CardContent>
            <Grid container>
              <Grid item md={6} sm={6} xs={6}>
                <Typography style={{fontSize: 11, textAlign:"left", fontWeight:"bold"}} color={"inherit"} gutterBottom>
                  <Tooltip title="View in browser"><a style={{color:"black",textDecoration: 'none' }} href={"https://"+props.collection+".raw.ic0.app/?tokenid=" + tokenid} rel="noreferrer" target="_blank">{"#"+(mintNumber())}</a></Tooltip>
                </Typography>
              </Grid>
              {showNri()}
            </Grid>

            <a href={nftLink()} target="_blank" rel="noreferrer">
              <div style={{...styles.avatarSkeletonContainer}}>
                {props.collection !== "uzhxd-ziaaa-aaaah-qanaq-cai" ?
                <img alt={tokenid} style={{...styles.avatarImg, display:(imgLoaded ? "block" : "none")}} src={nftImg()} onLoad={() => setImgLoaded(true)} />
                :
                <img alt={tokenid} style={{...styles.avatarImg2, display:(imgLoaded ? "block" : "none")}} src={nftImg()} onLoad={() => setImgLoaded(true)} />
                }
                <Skeleton style={{...styles.avatarLoader, display:(imgLoaded ? "none" : "block")}} variant="rect"  />
              </div>
            </a>
            

              <Typography style={{fontSize: 18, textAlign:"center", fontWeight:"bold"}} color={"inherit"} gutterBottom>
                {_showListingPrice(props.listing[1].price)} ICP
              </Typography>
              {props.loggedIn ? 
              <Typography style={{fontSize: 12, textAlign:"center"}} color={"inherit"} gutterBottom>
                { _isLocked(props.listing[1]) ? 
                  <span style={{display:"block",marginBottom:22}}>Unlocks <Timestamp relative autoUpdate date={Number(props.listing[1].locked[0]/1000000000n)} /></span>
                : 
                  <Button onClick={buy} variant="contained" color="primary" style={{backgroundColor:"#003240", color:"white"}}>Buy Now</Button>
                }
              </Typography>: ""}
          </CardContent>
        </Card>
    </Grid>
  );
}

