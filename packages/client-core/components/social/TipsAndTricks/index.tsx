import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import styles from './TipsAndTricks.module.scss';

const TipsAndTricks = () => { 
    const data=[];
    for(let i=0; i<random(10); i++){
        data.push({ 
            previewImg:'https://picsum.photos/375/250',
            videoLink:null,
            title: 'Created Tips & Tricks',
            description: 'I recently understood the words of my friend Jacob West about music.'
        })
    }
    return <section className={styles.tipsandtricksContainer}>
        {data.map(tip=>
            <Card className={styles.tipItem} square={false} elevation={0}>
                <CardMedia   
                    className={styles.previewImage}                  
                    image={tip.previewImg}
                    title={tip.title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">{tip.title}</Typography>
                    <Typography variant="h2" component="p">{tip.description}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default TipsAndTricks;