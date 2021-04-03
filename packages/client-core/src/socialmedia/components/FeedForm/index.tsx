import React, { useState } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';

import { Button, CardMedia, TextField, Typography } from '@material-ui/core';
import { createFeed, updateFeedAsAdmin } from '../../../redux/feed/service';

import styles from './FeedForm.module.scss';


const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createFeed: bindActionCreators(createFeed, dispatch),
    updateFeedAsAdmin: bindActionCreators(updateFeedAsAdmin, dispatch),
});

interface Props{
    feed?:any;
    createFeed?: typeof createFeed;
    updateFeedAsAdmin?: typeof updateFeedAsAdmin;
}
const FeedForm = ({feed, createFeed, updateFeedAsAdmin} : Props) => { 
    const [isSended, setIsSended] = useState(false);
    const [composingTitle, setComposingTitle] = useState(feed ? feed.title : '');
    const [composingText, setComposingText] = useState(feed ? feed.description : '');
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const titleRef = React.useRef<HTMLInputElement>();
    const textRef = React.useRef<HTMLInputElement>();

    const handleComposingTitleChange = (event: any): void => setComposingTitle(event.target.value);
    const handleComposingTextChange = (event: any): void => setComposingText(event.target.value);
    const handleCreateFeed = () => {
        const newFeed = {
            title: composingTitle.trim(),
            description: composingText.trim(),
            video, preview
        } as any;   
        if(feed){                    
            updateFeedAsAdmin(feed.id, newFeed);
        }else{
            createFeed(newFeed);
        }

        setComposingTitle('');
        setComposingText('');
        setVideo(null);
        setPreview(null);
        setIsSended(true);
        const thanksTimeOut = setTimeout(()=>{
            setIsSended(false); 
            clearTimeout(thanksTimeOut);
        }, 2000);
    };
    const handlePickVideo = async (file) => setVideo(file.target.files[0]);
    const handlePickPreview = async (file) => setPreview(file.target.files[0]);
    
return <section className={styles.feedFormContainer}>
    {isSended ? 
        <Typography variant="h1" align="center">Thanks for sharing and improving our community</Typography>
        :
        <section>
            <Typography variant="h1" align="center">Share something with the community</Typography>

            {feed && <CardMedia   
                    className={styles.previewImage}                  
                    src={feed.videoUrl}
                    title={feed.title}  
                    component='video'      
                    controls  
                    autoPlay={true} 
                />}
            <Typography variant="h2" align="center">Video<input type="file" name="video" onChange={handlePickVideo} placeholder={'Select video'}/></Typography> 
            {feed && <CardMedia   
                    className={styles.previewImage}                  
                    image={feed.previewUrl}
                    title={feed.title}                      
                />}                     
            <Typography variant="h2" align="center">Preview image<input type="file" name="preview" onChange={handlePickPreview} placeholder={'Select preview'}/></Typography>  
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
        </section>
    }    
</section>;
};

export default connect(null, mapDispatchToProps)(FeedForm);