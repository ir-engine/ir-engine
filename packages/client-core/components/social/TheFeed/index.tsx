import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import TelegramIcon from '@material-ui/icons/Telegram';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';


import styles from './TheFeed.module.scss';

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
        {data.map((item, itemIndex)=>
            <Card className={styles.tipItem} square={false} elevation={0} key={itemIndex}>
                <CardHeader
                    avatar={<img src={item.author.avatar} />} 
                    title={<Typography variant="h2">
                                {item.author.username}
                                <VerifiedUserIcon htmlColor="#007AFF" style={{fontSize:'13px', margin: '0 0 0 5px'}}/>
                            </Typography>}
                />
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.previewImg}
                    title={item.title}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h2">
                        <span>{item.title}</span>
                        <section>
                            <WhatshotIcon htmlColor="#FF6201" />
                            <TelegramIcon />
                            <BookmarkBorderIcon />
                        </section>
                    </Typography>
                    <Typography variant="h2"><span className={styles.flamesCount}>{item.flamesCount}</span>Flames</Typography>
                    <Typography variant="h2">{item.description}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default TheFeed;