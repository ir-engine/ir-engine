import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import styles from './Creators.module.scss';


const Creators = () => { 
    const data=[];
    for(let i=0; i<random(50, 5); i++){
        data.push({ 
            avatar :'https://picsum.photos/158/210',
            name: 'User username',
            username: '@username',
        })
    }
    return <section className={styles.creatorContainer}>
        {data.map(tip=>
            <Card className={styles.creatorItem} elevation={0}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    image={tip.avatar}
                    title={tip.name}
                />
                <CardContent>
                    <Typography className={styles.titleContainer} gutterBottom variant="h3" component="h2" align="center">{tip.name}</Typography>
                    <Typography variant="h4" component="p" align="center">{tip.username}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default Creators;