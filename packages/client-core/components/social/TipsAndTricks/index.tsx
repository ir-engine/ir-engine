import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import styles from './TipsAndTricks.module.scss';

export const TipsAndTricks = () => { 
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
        {data.map((item, itemindex)=>
            <Card className={styles.tipItem} square={false} elevation={0} key={itemindex}>
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.previewImg}
                    title={item.title}
                />
                <CardContent>
                    <Typography className={styles.tipsTitle} variant="h2">{item.title}</Typography>
                    <Typography variant="h2">{item.description}</Typography>
                </CardContent>
            </Card>
        )}
        </section>
};

export default TipsAndTricks;