import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';

export default function BuyForm(props) {
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const handleClick = (t) => {
    setImgLoaded(false);
    if (typeof props.handler != 'undefined') props.handler(t);
  };
  return (
    <Dialog
      fullWidth={true}
      maxWidth={"xs"}
      open={props.open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      style={{textAlign:"center"}}
    >
      <DialogTitle id="alert-dialog-title">You are about to make a purchase!</DialogTitle>
      <DialogContent>
        <img alt="NFT" src={props.img} style={{maxHeight:"200px", margin:"0px auto 20px", display:(imgLoaded ? "block" : "none")}} onLoad={() => setImgLoaded(true)}/>
        <Skeleton style={{width: "200px", height:"200px", margin:"0px auto 20px", display:(imgLoaded ? "none" : "block")}} variant="rect"  />
        <DialogContentText id="alert-dialog-description">
          You are about to purchase this NFT from your connected wallet for: <br />
          <strong><span style={{fontSize:"1.5em",color:"red"}}>{props.price} ICP</span></strong><br />
          This process may take a minute to process.<br /><br /><strong>Are you sure you want to continue?</strong>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
      <Button onClick={() => handleClick(false)} color="primary">
        Cancel
      </Button>
      <Button onClick={() => handleClick(true)} color="primary">
        Confirm
      </Button>
      </DialogActions>
    </Dialog>
  );
}
