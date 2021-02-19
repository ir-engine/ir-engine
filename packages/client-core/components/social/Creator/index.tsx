import React from 'react';
import { random } from 'lodash';
import Router from "next/router";


import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import VisibilityIcon from '@material-ui/icons/Visibility';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';

import styles from './Creator.module.scss';
import Button from '@material-ui/core/Button';

const Creator = () => { 

    const creatorFeeds=[];
    for(let i=0; i<random(150, 5); i++){
        creatorFeeds.push({ 
            image :'https://picsum.photos/97/139',
            viewsCount: random(150)
        })
    }
    const creator ={ 
            background :'https://picsum.photos/375/290',
            avatar :'https://picsum.photos/110/110',
            name: 'User username',
            username: '@username',  
            tags: 'Art & Design',
            bio: 'I’m glad to share my works and these amazing kit with you!'      
    }

    return <><section className={styles.creatorContainer}>
            <Card className={styles.creatorCard} elevation={0} key={creator.username} square={false} >                 
                <CardMedia   
                    className={styles.bgImage}                  
                    image={creator.background}
                    title={creator.name}
                />
                <Button variant="text" className={styles.backButton} onClick={()=>Router.push('/')}><ArrowBackIosIcon />Back</Button>
                <CardMedia   
                    className={styles.avatarImage}                  
                    image={creator.avatar}
                    title={creator.username}
                />
                <CardContent className={styles.content}>
                    <Typography className={styles.titleContainer} gutterBottom variant="h3" component="h2" align="center">{creator.name}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.username}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.tags}</Typography>
                    <Typography variant="h4" component="p" align="center">{creator.bio}</Typography>
                </CardContent>
            </Card>
        
            <section className={styles.feedContainer}>
                {creatorFeeds.map((item, itemIndex)=>
                    <Card className={styles.creatorItem} elevation={0} key={itemIndex}>                 
                       <CardMedia   
                            className={styles.previewImage}                  
                            image={item.image}
                        />
                        <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
                    </Card>
                )}
            </section>
        </section>
        </>
};

export default Creator;