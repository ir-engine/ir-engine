import { Box, CardActionArea, CardActions, CardContent, CardMedia, makeStyles, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { updateShareFormState } from '../../reducers/popupsState/service';
// @ts-ignore
import styles from './ShareForm.module.scss';
import { Plugins } from '@capacitor/core';
import { useTranslation } from 'react-i18next';
import { selectPopupsState } from '../../reducers/popupsState/selector';
const { Share } = Plugins;

const mapStateToProps = (state: any): any => {
  return {
    popupsState: selectPopupsState(state),
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
   updateShareFormState: bindActionCreators(updateShareFormState, dispatch)
});

interface Props{
   updateShareFormState?: typeof updateShareFormState;
   popupsState?: any; 
}

const useStyles = makeStyles({
  root: {
    maxWidth: '375pt',
  },
  media: {
    height: '340pt',
    width : '375pt',
  },
  btn_share: {
   backgroundColor: 'black',
   color: 'white',
   bottom: '0',
   width: '100%',
   borderRadius: '12px',
   '&:hover': {
     backgroundColor: 'black',
     color: 'white',
 },
  },
});

const ShareForm = ({updateShareFormState, popupsState}:Props) => {
   
   const videoUrl = popupsState?.get('videoUrl');
   const classes = useStyles();
   const { t } = useTranslation();

   const shareVia = () => {
    Share.share({
        title: t('social:shareForm.seeCoolStuff'),
        text: t('social:shareForm.videoCreated'),
        url: videoUrl,
        dialogTitle: t('social:shareForm.shareWithBuddies')
      });
   };

   return  (
    <div>
    <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
   minHeight="50vh"
   >
 <CardMedia
   className={classes.media}
   image='https://cdn.zeplin.io/601d63dc422d9dad3473e3ab/assets/14A023CD-2A56-4EDF-9D40-7B86746BF447.png'
   title="Arc"
 />
 </Box>
 <Button size="large" color="primary" onClick={shareVia} className={classes.btn_share}>
   {t('social:shareForm.shareVideo')}
 </Button>
 <Button size="large" color="primary" style={{width: '100%'}} onClick={() => {updateShareFormState(false);}} >
   {t('social:shareForm.save')}
 </Button>
 <Button size="large" color="primary" style={{width: '100%'}} onClick={() => {updateShareFormState(false);}} >
   {t('social:shareForm.cancel')}
 </Button>
 </div>


   );
};

export default connect(mapStateToProps, mapDispatchToProps) (ShareForm);