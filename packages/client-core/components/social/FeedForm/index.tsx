import React, { useState } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Button, CardMedia, TextField, Typography } from '@material-ui/core';
import { createFeed } from '../../../redux/feed/service';

import styles from './FeedForm.module.scss';

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createFeed: bindActionCreators(createFeed, dispatch),
});

interface Props{
    createFeed?: typeof createFeed,
}
const FeedForm = ({createFeed} : Props) => { 
    const [isSended, setIsSended] = useState(false);
    const [composingTitle, setComposingTitle] = useState('');
    const [composingText, setComposingText] = useState('');
    const titleRef = React.useRef<HTMLInputElement>();
    const textRef = React.useRef<HTMLInputElement>();

    const handleComposingTitleChange = (event: any): void => setComposingTitle(event.target.value);
    const handleComposingTextChange = (event: any): void => setComposingText(event.target.value);
    const handleCreateFeed = () => {
        const feed = {
            title: composingTitle.trim(),
            description: composingText.trim()
        }
        createFeed(feed);
        setComposingTitle('');
        setComposingText('');
        setIsSended(true)
    }
    
    return <section className={styles.feedFormContainer} style={{overflow: 'scroll'}}>{isSended ? 
        <Typography variant="h1" align="center">Thanks for sharing and improving our community</Typography>
        :
        <>
        <Typography variant="h1" align="center">Share something with the community</Typography>
        <CardMedia   
            className={styles.previewImage}                  
            image={'https://picsum.photos/375/210'}
        />
        <TextField ref={titleRef} 
            value={composingTitle}
            onChange={handleComposingTitleChange}
            fullWidth 
            placeholder="Title"                     
            />    
        <TextField className={styles.textArea} ref={textRef} 
            value={composingText}
            onChange={handleComposingTextChange}
            fullWidth 
            multiline
            placeholder="Type what you want to share with the community ... "                     
            />    
        <Button
            variant="contained"
            color="primary"
            className={styles.submit}
            onClick={()=>handleCreateFeed()}
            >
            Share
            </Button>   
        </>}    
        </section>
};

export default connect(null, mapDispatchToProps)(FeedForm);