import React from 'react';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
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
export default function Create(props) {
  const classes = useStyles();

  return (
  <div style={{width:"100%", display:"block", position:"relative"}}>
    <div style={{maxWidth:1200, margin:"120px auto 0px", paddingBottom:200}}>
      <h1 style={{textAlign:"center"}}>Create, mint, release!</h1>
      <p style={{textAlign:"center",fontSize:"1.3em"}}>If you would like to release your own collection of NFTs on the Entrepot.app marketplace then please complete <a href="https://docs.google.com/forms/d/e/1FAIpQLSfijChkKNI8SESLIavMspahNeE5Mio84TjDwspmlV7EEd4iCA/viewform" rel="noreferrer" target="_blank">this form</a> and we will be in touch!</p>
      <Grid style={{textAlign:"center", marginTop:50,marginBottom:50}} container spacing={5}>
        <Grid item md={3}>
          <img style={{width:100}} alt="Low Fees" src="/icon/fee.png" />
          <h2>Low Fees</h2>
          <p style={{fontSize:"1.1em"}}>We charge a <strong>0.5%</strong> Marketplace fee, and collection creators can charge a Royalty fee of up to <strong>2.5%</strong></p>
        </Grid>
        <Grid item md={3}>
          <img style={{width:100}} alt="Low Fees" src="/icon/wallet.png" />
          <h2>Non-custodial</h2>
          <p style={{fontSize:"1.1em"}}>All assets remain in your full control - we never take custody any of your digital assets</p>
        </Grid>
        <Grid item md={3}>
          <img style={{width:100}} alt="Low Fees" src="/icon/artist.png" />
          <h2>Custom Collections</h2>
          <p style={{fontSize:"1.1em"}}>We plan to work with a wide range of talented curators, artists and developers</p>
        </Grid>
        <Grid item md={3}>
          <img style={{width:100}} alt="Low Fees" src="/icon/infinity.png" />
          <h2>First on the IC</h2>
          <p style={{fontSize:"1.1em"}}>Entrepot.app is the first NFT marketplace and DEFI solution on the Internet Computer</p>
        </Grid>
      </Grid>
      
      <h1 style={{textAlign:"center"}}>Upcoming Collections</h1>
      <Grid container spacing={1}>
        {/*<Grid item md={4}>
          <Card className={classes.root}>
            <CardMedia
              className={classes.media}
              image="/collections/cronic-wearables.jpg"
              title="Cronic Wearables"
            />
            <CardContent>
              <h3>Cronic Wearables</h3>
              <Typography variant="body1" color="textSecondary" component="p">
                We will be releasing the next set of Cronic NFTs - Cronic Wearables! These are a seperate collection of NFTs that you can send to your Cronic, and it will wear it!
              </Typography>
            </CardContent>
          </Card>
        </Grid>*/}
        <Grid item md={4}>
          <Card className={classes.root}>
            <CardMedia
              className={classes.media}
              image="/collections/starverse.jpg"
              title="Starverse"
            />
            <CardContent>
              <h3>Starverse</h3>
              <Typography variant="body1" color="textSecondary" component="p">
                Starverse is the result of collaborative efforts between Mac and Mir, the ToniqLabs team, and theam team from DSCVR.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={4}>
          <Card className={classes.root}>
            <CardMedia
              className={classes.media}
              image="/collections/rotm.jpg"
              title="Rise of the Magni"
            />
            <CardContent>
              <h3>Rise of the Magni</h3>
              <Typography variant="body1" color="textSecondary" component="p">
                Another blockchain game by ToniqLabs, the first set of Magni NFTs will be available for sale exclusively on <strong>Entrepot.app</strong>. Coming September 2021!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={4}>
          <Card className={classes.root}>
            <CardMedia
              className={classes.media}
              image="/collections/icpnews.jpg"
              title="Digital Artists"
            />
            <CardContent>
              <h3>Curated Artwork</h3>
              <Typography variant="body1" color="textSecondary" component="p">
                We are working with a number of digital artists and developers to curate an  collections of digital media, including some amazing work by ICP News.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
    <div className={classes.footer}>
      <Typography variant="body1" >Developed by ToniqLabs &copy; All rights reserved 2021</Typography>
    </div>
  </div>
  );
}