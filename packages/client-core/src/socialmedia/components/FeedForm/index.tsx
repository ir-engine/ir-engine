import React, { useState } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import VideoRecorder from 'react-video-recorder';

import { Button, Card, CardMedia, TextField, Typography } from '@material-ui/core';
import CameraIcon from '@material-ui/icons/Camera';
import BackupIcon from '@material-ui/icons/Backup';

import styles from './FeedForm.module.scss';
import { createFeed, updateFeedAsAdmin } from '../../reducers/feed/service';

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
    const [isRecordVideo, setRecordVideo] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [composingTitle, setComposingTitle] = useState(feed ? feed.title : '');
    const [composingText, setComposingText] = useState(feed ? feed.description : '');
    const [video, setVideo] = useState(null);
    const [preview, setPreview] = useState(null);
    const titleRef = React.useRef<HTMLInputElement>();
    const textRef = React.useRef<HTMLInputElement>();
    const videoRef = React.useRef<HTMLInputElement>();

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
            <section className={styles.flexContainer}>
                <Card className={styles.preCard}>
                    <Typography variant="h2" align="center">
                        <p>Upload Video</p>
                        <p><BackupIcon onClick={()=>{(videoRef.current as HTMLInputElement).click();}} /></p>
                        <input required ref={videoRef} type="file" className={styles.displayNone} name="video" onChange={handlePickVideo} placeholder={'Select video'}/>
                    </Typography> 
                </Card>
                <Card className={styles.preCard}>
                   <Typography variant="h2" align="center">
                        <p>Record from camera</p>
                        <p><CameraIcon  onClick={()=>setRecordVideo(true)} /></p>
                    </Typography> 
                </Card>
            </section>
            {feed && <CardMedia   
                    className={styles.previewImage}                  
                    image={feed.previewUrl}
                    title={feed.title}                      
                />}  
            <Card className={styles.preCard}>
                <Typography variant="h2" align="center">Preview image<input required type="file" name="preview" onChange={handlePickPreview} placeholder={'Select preview'}/></Typography>  
            </Card>                   
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

            {isRecordVideo === true && 
                <section className={styles.videoWrapper}>
                    <VideoRecorder
                        onRecordingComplete={videoBlob => {
                            setVideo(videoBlob);
                            setIsVideo(true);
                        }}
                    />
                    {isVideo && <Button
                        variant="contained"
                        color="secondary"
                        className={styles.submit}
                        onClick={()=>{
                            setRecordVideo(false);
                            setIsVideo(false);
                        }}
                        >
                        Save and go Next
                        </Button>  }
                </section>}
        </section>
    }    
</section>;
};

export default connect(null, mapDispatchToProps)(FeedForm);