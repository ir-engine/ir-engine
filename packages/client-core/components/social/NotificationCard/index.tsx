import React from 'react';
import Router from "next/router";

import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import styles from './NotificationCard.module.scss';

const NotificationCard = ({notification} : any) => { 
    const checkNotificationAction = (type) =>{
        switch (type) {
            case 'feed-fire': return ' fired your feed';
            case 'feed-bookmark': return ' bookmarked your feed';
            case 'comment': return ' commented your feed:';
            case 'comment-fire': return ' fired your comment to feed';
            default: return ' followed you';
        }
    }
    return  <Card className={styles.commentItem} square={false} elevation={0} key={notification.id}>
                <Avatar onClick={()=>Router.push({ pathname: '/creator', query:{ creatorId: notification.creatorAuthorId}})}
                     className={styles.authorAvatar} src={notification.avatar} />                                
                <CardContent className={styles.commentCard}>
                    <Typography variant="h2">
                        {notification.creator_username}
                        {checkNotificationAction(notification.type)}  
                        {notification.comment_text && ' "'+notification.comment_text+'"'}
                    </Typography> 
                </CardContent>
                <section className={styles.fire}>
                    <Avatar variant="rounded" onClick={()=>Router.push({ pathname: '/feed', query:{ feedId: notification.feedId}})}
                        className={styles.authorAvatar} src={notification.previewUrl} />  
                </section>
            </Card>
};

export default (NotificationCard);