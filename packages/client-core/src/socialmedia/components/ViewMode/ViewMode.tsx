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
import { Box, CardMedia, makeStyles, Typography } from '@material-ui/core';

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch)
});

const useStyles = makeStyles({
  media: {
    height: '55pt',
    width: '30pt',
    alignSelf: 'center',
    
  
  },
  media2: {
    height: '29pt',
    width: '54pt',
    alignSelf: 'center',
    marginTop: '40pt'
  },
  title: {
    alignSelf: 'center',
    letterSpacing: '0.36pt',
    marginTop: '7%',
    fontSize: '20px'
  },
  btn_start: {
    backgroundColor: 'black',
    color: 'white',
    position: 'absolute',
    bottom: '0',
    width: '100%',
    '&:hover': {
      backgroundColor: 'black',
      color: 'white',
  },
  },
  btn_cancel: {
    color: 'grey',
    
  },
});

const Transition = React.forwardRef((
  props: TransitionProps & { children?: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) => {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props{
  updateArMediaState?: typeof updateArMediaState;
}

export const ViewMode = ({updateArMediaState}:Props) => {
  const [open, setOpen] = useState(false);
  const classes = useStyles();
 
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
     PaperProps={{
       style: {
         width: '311pt',
         height: '486pt',
         borderRadius: '12px'
       }
      }}
   >
     <Button onClick={handleClose} color="primary" className={classes.btn_cancel}>
         Cancel
     </Button>
     <Box borderTop={1} />
     <DialogTitle className={classes.title}>{"Remember!"} </DialogTitle>
    <Typography style={{textAlign: 'center',padding: '16pt'}}>
        You have two different recording 
        modes to choose from
     </Typography>
     <CardMedia  
       className={classes.media}
       image='https://cdn.zeplin.io/601d63dc422d9dad3473e3ab/assets/C9623B05-AC7F-4D88-B8EC-2D1951CE2767.svg'
       title="Arc"
     />
      <Typography style={{textAlign: 'center',
                          padding: '16pt'
                         }}>
      Vertical mode has a 30 sec record time
      </Typography>
     <Box borderTop={1} />
     <CardMedia
       className={classes.media2}
       image='https://cdn.zeplin.io/601d63dc422d9dad3473e3ab/assets/802EB928-4227-4940-BA8E-0A8119FE4CDF.svg'
       title="Arc"
     />
       <Typography style={{textAlign: 'center',padding: '16pt',marginTop: '30pt'}}>
        Horizontal mode has an unlimited record time
       </Typography>
     <Button onClick={()=> {handleOpenNewFeedPage();}} color="primary" className={classes.btn_start}>
         Start
     </Button>
   </Dialog>
 </div>
  );
};

export default connect (mapStateToProps, mapDispatchToProps)(ViewMode);