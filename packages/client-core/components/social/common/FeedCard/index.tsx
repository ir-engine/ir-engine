import React from 'react';
import Router from "next/router";

import { Feed } from '@xr3ngine/common/interfaces/Feed';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
// import CardHeader from '@material-ui/core/CardHeader';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import TelegramIcon from '@material-ui/icons/Telegram';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
// import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

import styles from './FeedCard.module.scss';
import { bindActionCreators, Dispatch } from 'redux';
import { selectFeedFiresState } from '../../../../redux/feedFires/selector';
import { useEffect } from 'react';
import { getFeedFires } from '../../../../redux/feedFires/service';
import { connect } from 'react-redux';
import CreatorAsTitle from '../CreatorAsTitle';

const mapStateToProps = (state: any): any => {
    return {
        feedFiresState: selectFeedFiresState(state),
    };
  };

  const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFeedFires: bindActionCreators(getFeedFires, dispatch),
});
interface Props{
    feed : Feed,
    feedFiresState?: any,
    getFeedFires?: typeof getFeedFires;
}
const FeedCard = (props: Props) : any => {
    const {feed, getFeedFires, feedFiresState} = props;
    useEffect(()=>{if(feed){getFeedFires(feed.id);}}, []);
    console.log('feedFiresState.get(\'feedFires\')',feedFiresState.get('feedFires'))
    return  feed ? <Card className={styles.tipItem} square={false} elevation={0} key={feed.id} onClick={()=>Router.push('/feed')}>
                <CreatorAsTitle creator={feed.creator} />                   
                <CardMedia   
                    className={styles.previewImage}                  
                    image={feed.preview}
                    title={feed.title}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h2">
                        <span>{feed.title}</span>
                        <section>
                            <WhatshotIcon htmlColor="#FF6201"  />
                            <TelegramIcon />
                            <BookmarkBorderIcon />
                        </section>
                    </Typography>
                    <Typography variant="h2" onClick={()=>alert('Fires '+feedFiresState.get('feedFires'))}><span className={styles.flamesCount}>{feed.fires}</span>Flames</Typography>
                    <Typography variant="h2">{feed.description}</Typography>
                </CardContent>
            </Card>
        :''
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedCard);