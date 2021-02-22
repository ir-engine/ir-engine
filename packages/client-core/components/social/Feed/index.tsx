import React from 'react';
import { random } from 'lodash';

// import styles from './Feed.module.scss';
import FeedCard from '../FeedCard';
import CommentList from '../CommentList';
import NewComment from '../NewComment';

const Feed = () => { 
    const feed ={ 
        id: 150,
        author:{
            id:'185',
            avatar :'https://picsum.photos/40/40',
            username: 'User username'
        },
        previewImg:'https://picsum.photos/375/210',
        videoLink:null,
        title: 'Featured Artist Post',
        flamesCount: random(15000),
        description: 'I recently understood the words of my friend Jacob West about music.'
    }  

    return <>
            <FeedCard {...feed} />        
            <CommentList />  
            <NewComment />      
        </>
};

export default Feed;