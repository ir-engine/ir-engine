import { CardActionArea, CardActions, CardContent, CardMedia, makeStyles, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { updateShareFormState } from '../../reducers/popupsState/service';
// @ts-ignore
import styles from './ShareForm.module.scss';
import { Plugins } from '@capacitor/core';
const { Share } = Plugins;

const mapDispatchToProps = (dispatch: Dispatch): any => ({
   updateShareFormState: bindActionCreators(updateShareFormState, dispatch)
});

interface Props{
   updateShareFormState?: typeof updateShareFormState;
}

const useStyles = makeStyles({
   root: {
     maxWidth: 345,
   },
   media: {
     height: 450,
   },
 });

const ShareForm = ({updateShareFormState}:Props) => {

   const classes = useStyles();


   const shareVia = () => {
    Share.share({
        title: 'See cool stuff',
        text: 'I Created This Video',
        url: 'http://arcmedia.us/',
        dialogTitle: 'Share with buddies'
      });
   }

   return  (
      <section className={styles.shareFormContainer}>
         <Card className={classes.root}>
      <CardActionArea>
        <CardMedia
          className={classes.media}
          image='https://i.pinimg.com/originals/ab/b6/a8/abb6a800ab2193fcedd9bda566b7402c.jpg'
          title="Arc"
        />
      </CardActionArea>
         <Card>
        <Button size="large" color="primary" onClick={shareVia}>
          Share Video
        </Button>
        </Card>
        <Card>
        <Button size="large" color="primary">
          Save to Camera Roll
        </Button>
        </Card>
        <Card>
        <Button size="large" color="primary" onClick={() => {updateShareFormState(false)}}>
          Cancel
        </Button>
        </Card>
     
    </Card>
      </section>
   );
};

export default connect(null, mapDispatchToProps) (ShareForm)