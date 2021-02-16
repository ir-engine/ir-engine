import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import styles from './TheFeed.module.scss';
import CardHeader from '@material-ui/core/CardHeader';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import TelegramIcon from '@material-ui/icons/Telegram';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';

const TheFeed = () => { 
    const data=[];
    for(let i=0; i<random(20, 5); i++){
        data.push({ 
            author:{
                avatar :'https://picsum.photos/40/40',
                username: 'User username'
            },
            previewImg:'https://picsum.photos/375/210',
            videoLink:null,
            title: 'Featured Artist Post',
            flamesCount: random(15000),
            description: 'I recently understood the words of my friend Jacob West about music.'
        })
    }
    return <section className={styles.thefeedContainer}>
        {data.map(tip=>
            <Card className={styles.tipItem} square={false} elevation={0}>
                 <CardHeader
                    avatar={<img src={tip.author.avatar} />} 
                    title={tip.author.username}
                />
                <CardMedia   
                    className={styles.previewImage}                  
                    image={tip.previewImg}
                    title={tip.title}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h5" component="h2">
                        <span>{tip.title}</span>
                        <section>
                            <WhatshotIcon htmlColor="#FF6201" />
                            <TelegramIcon />
                            <BookmarkBorderIcon />
                        </section>
                    </Typography>
                    <Typography variant="h2" component="p">{tip.flamesCount} Flames</Typography>
                    <Typography variant="h2" component="p">{tip.description}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default TheFeed;