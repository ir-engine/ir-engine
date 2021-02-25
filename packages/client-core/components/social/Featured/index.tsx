import React from 'react';
import { random } from 'lodash';

import CardMedia from '@material-ui/core/CardMedia';
import Card from '@material-ui/core/Card';
import VisibilityIcon from '@material-ui/icons/Visibility';

import styles from './Featured.module.scss';

const Featured = () => { 
    const data=[];
    for(let i=0; i<random(150, 5); i++){
        data.push({ 
            image :'https://picsum.photos/97/139',
            viewsCount: random(150)
        })
    }
    return <section className={styles.feedContainer}>
        {data.map((item, itemIndex)=>
            <Card className={styles.creatorItem} elevation={0} key={itemIndex}>                 
                <CardMedia   
                    className={styles.previewImage}                  
                    image={item.image}
                />
                <span className={styles.eyeLine}>{item.viewsCount}<VisibilityIcon style={{fontSize: '16px'}}/></span>
            </Card>
        )}
        </section>
};

export default Featured;