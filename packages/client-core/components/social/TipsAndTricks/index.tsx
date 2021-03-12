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
            title: 'Created Tips & Tricks',
            description: 'I recently understood the words of my friend Jacob West about music.'
        })
    }
    return <section className={styles.tipsandtricksContainer}>
        {data.map((item, itemindex)=>
            <Card className={styles.tipItem} square={false} elevation={0} key={itemindex}>
                <CardMedia   
                    className={styles.previewImage}      
                    component='video'            
                    src={'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4'}
                    title={item.title}
                    controls
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