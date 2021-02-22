import React from 'react';
import { random } from 'lodash';

import FeedCard from '../FeedCard';

import styles from './TheFeed.module.scss';

const TheFeed = () => { 
    const data=[];
    for(let i=0; i<random(20, 5); i++){
        data.push({ 
            id: i,
            author:{
                id: '169',
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
        {data.map((item)=><FeedCard {...item} /> )}
        </section>
};

export default TheFeed;