import React from 'react';
import Router from "next/router";

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import TelegramIcon from '@material-ui/icons/Telegram';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';

import styles from './FeedCard.module.scss';
interface CreatorShort{
    id: string,
    avatar :string,
    username: string,
}
interface Feed{
    id: number,
    author:CreatorShort,
    previewImg:string,
    videoLink:string,
    title: string,
    flamesCount: number,
    description: string
}

const FeedCard = ({id, author, previewImg, title,videoLink,flamesCount, description }: Feed) => { 
    return  <Card className={styles.tipItem} square={false} elevation={0} key={id} onClick={()=>Router.push('/feed')}>
                <CardHeader
                    avatar={<img src={author.avatar} />} 
                    title={<Typography variant="h2">
                                {author.username}
                                <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>
                            </Typography>}
                />
                <CardMedia   
                    className={styles.previewImage}                  
                    image={previewImg}
                    title={title}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h2">
                        <span>{title}</span>
                        <section>
                            <WhatshotIcon htmlColor="#FF6201" />
                            <TelegramIcon />
                            <BookmarkBorderIcon />
                        </section>
                    </Typography>
                    <Typography variant="h2"><span className={styles.flamesCount}>{flamesCount}</span>Flames</Typography>
                    <Typography variant="h2">{description}</Typography>
                </CardContent>
            </Card>
};

export default FeedCard;