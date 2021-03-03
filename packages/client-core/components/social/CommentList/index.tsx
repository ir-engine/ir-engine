import React from 'react';
import { random } from 'lodash';

import CommentCard from '../CommentCard';

import styles from './CommentList.module.scss';

const CommentList = () => { 
    
    return <section className={styles.commentsContainer}>
        {data.map((item, key)=><CommentCard key={key} {...item} /> )}
        </section>
};

export default CommentList;