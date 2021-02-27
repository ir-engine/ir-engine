import React from 'react';
import { random } from 'lodash';

import CommentCard from '../CommentCard';

import styles from './CommentList.module.scss';

const CommentList = () => { 
    const data=[];
    for(let i=0; i<random(150, 5); i++){
        data.push({ 
            id: i,
            author:{
                id:'185',
                avatar :'https://picsum.photos/40/40',
                username: 'User username'
            },
            flamesCount: random(15000),
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris ni '
        })
    }
    return <section className={styles.commentsContainer}>
        {data.map((item, key)=><CommentCard key={key} {...item} /> )}
        </section>
};

export default CommentList;