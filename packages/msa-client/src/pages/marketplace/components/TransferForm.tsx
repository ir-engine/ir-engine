import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Alert from '@material-ui/lab/Alert';

export default function TransferForm(props) {
  const [address, setAddress] = React.useState("");
        
  const _submit = () => {
    //Validate address
    handleClose();
    props.transfer(props.nft.id, address);
  };
  const handleClose = () => {
    setAddress("");
    props.close()
  };
  return (
    <>
      <Dialog open={props.open} onClose={handleClose} maxWidth={'xs'} fullWidth >
        <DialogTitle id="form-dialog-title" style={{textAlign:'center'}}>Transfer NFT</DialogTitle>
        <DialogContent>
        <DialogContentText style={{textAlign:'center',fontWeight:'bold'}}>Please enter the address or Principal you want to send the NFT to.</DialogContentText>
        <Alert severity="error">Beware, Plug Wallet does not support EXT tokens.</Alert>
          <TextField
            style={{width:'100%'}}
            margin="dense"
            label={"Address or Principal to send to"}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            type="text"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Back
          </Button>
          <Button onClick={_submit} color="primary">Transfer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
