import React, { forwardRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { bindActionCreators, Dispatch } from 'redux';
import { updateArMediaState } from '../../reducers/popupsState/service';
import { connect } from 'react-redux';
import { selectCreatorsState } from '../../reducers/creator/selector';
import { selectAuthState } from '../../../user/reducers/auth/selector';
import { selectPopupsState } from '../../reducers/popupsState/selector';

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch)
});

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props{
  updateArMediaState?: typeof updateArMediaState;
}

export const ViewMode = ({updateArMediaState}:Props) => {
  const [open, setOpen] = useState(false);
 
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenNewFeedPage = () => updateArMediaState(true);
  return (
    <div>
       <AddCircleIcon onClick={handleClickOpen} style={{fontSize: '5em'}} />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <Button onClick={handleClose} color="primary">
            Cancel
        </Button>
        <DialogTitle id="alert-dialog-slide-title">{"Remember"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
           You have two different recording 
           modes to choose from
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
         Vertical mode has a 30 sec record time
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
           Horizontal mode has an unlimited record time
          </DialogContentText>
        </DialogContent>
        <Button onClick={()=> {handleOpenNewFeedPage()}} variant="contained" color="primary">
            Start
        </Button>
      </Dialog>
    </div>
  );
}

export default connect (mapStateToProps, mapDispatchToProps)(ViewMode)