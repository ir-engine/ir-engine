import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 345,
  },
  footer: {
    textAlign: "center",
    position: "absolute",
    bottom: 0,
    width: "100% !important",
    height: "100px !important",
    background: "#091216",
    color: "white",
    paddingTop:30,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
}));
export default function Contact(props) {
  const classes = useStyles();
  return (
  <div style={{width:"100%", display:"block", position:"relative"}}>
    <div style={{maxWidth:1200, margin:"120px auto 0px", paddingBottom:200}}>
      <h1 style={{textAlign:"center"}}>Contact Us</h1>
      <p style={{textAlign:"center",fontSize:"1.3em"}}>Entrepot.app is developed by ToniqLabs. If you need to talk to us about anything, you can email us at <a href="mailto:toniqlabs@gmail.com">toniqlabs@gmail.com</a> or contact us on <a href="https://twitter.com/toniqlabs" target="_blank" rel="noreferrer">Twitter</a> and <a href="https://medium.com/@toniqlabs" target="_blank" rel="noreferrer">Medium</a>.</p>

      
      <h1 style={{textAlign:"center", marginTop:50}}>FAQ</h1>
      <Grid style={{textAlign:"center", marginTop:50,marginBottom:50}} container spacing={5}>
        <Grid item md={3}>
          <h3>Do I need a wallet?</h3>
          <p style={{fontSize:"1.1em"}}>You will need to connect your ICP wallet to buy through Entrepot.app - currently we only support <a href="https://www.stoicwallet.com" target="_blank" rel="noreferrer">StoicWallet</a>, but we will aim to add more in future.</p>
        </Grid>
        <Grid item md={3}>
          <h3>How do I buy?</h3>
          <p style={{fontSize:"1.1em"}}>Simply find a listing you like, hit the Buy button and follow the prompts. You will need to connect you wallet and ensure it is funded first.</p>
        </Grid>
        <Grid item md={3}>
          <h3>Where is my NFT?</h3>
          <p style={{fontSize:"1.1em"}}>This is sent directly to your wallet. Within StoicWallet, you can easily import NFTs by clicking the "+" button, then selecting "Search Collections"</p>
        </Grid>
        <Grid item md={3}>
          <h3>How do I sell an NFT?</h3>
          <p style={{fontSize:"1.1em"}}>Currently, all selling has to be done through StoicWallet. We will look to add support for listing NFTs directly on Entrepot soon.</p>
        </Grid>
        <Grid item md={3}>
          <h3>How does the transaction work?</h3>
          <p style={{fontSize:"1.1em"}}>ICP is currently restricted so canisters can't hold ICP - we've developed a method that creates an atomic swap on the Internet Computer</p>
        </Grid>
        <Grid item md={3}>
          <h3>I haven't received my ICP?</h3>
          <p style={{fontSize:"1.1em"}}>Please log in and wait a few minutes - payments have to be extracted from escrow accounts once a sale is completed.</p>
        </Grid>
        <Grid item md={3}>
          <h3>Where can I store my NFTs?</h3>
          <p style={{fontSize:"1.1em"}}>Entrepot currently only supports NFTs using the EXT standard by ToniqLabs. Currently this is just StoicWallet</p>
        </Grid>
        <Grid item md={3}>
          <h3>What does a locked listing mean?</h3>
          <p style={{fontSize:"1.1em"}}>This means someone is currently in the process of purchasing the listing</p>
        </Grid>
        
      </Grid>
    </div>
    <div className={classes.footer}>
      <Typography variant="body1" >Developed by ToniqLabs &copy; All rights reserved 2021</Typography>
    </div>
  </div>
  );
}