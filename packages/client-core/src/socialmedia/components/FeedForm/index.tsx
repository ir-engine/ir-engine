/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import VideoRecorder from 'react-video-recorder';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import BackupIcon from '@material-ui/icons/Backup';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { useTranslation } from 'react-i18next';
import { Capacitor, Plugins } from '@capacitor/core';
// @ts-ignore
import styles from './FeedForm.module.scss';
import { createFeed, updateFeedAsAdmin } from '../../reducers/feed/service';
import { updateNewFeedPageState, updateShareFormState, updateArMediaState } from '../../reducers/popupsState/service';
import { selectPopupsState } from '../../reducers/popupsState/selector';

const mapStateToProps = (state: any): any => {
    return {
      popupsState: selectPopupsState(state),
    };
  };

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createFeed: bindActionCreators(createFeed, dispatch),
    updateFeedAsAdmin: bindActionCreators(updateFeedAsAdmin, dispatch),
    updateNewFeedPageState: bindActionCreators(updateNewFeedPageState, dispatch),
    updateShareFormState: bindActionCreators(updateShareFormState, dispatch),
    updateArMediaState: bindActionCreators(updateArMediaState, dispatch),
});

interface Props{
    feed?:any;
    popupsState?: any;
    createFeed?: typeof createFeed;
    updateFeedAsAdmin?: typeof updateFeedAsAdmin;
    updateNewFeedPageState?: typeof updateNewFeedPageState; 
    updateShareFormState?: typeof updateShareFormState;
    updateArMediaState?: typeof updateArMediaState;
}
const FeedForm = ({feed, createFeed, updateFeedAsAdmin, updateNewFeedPageState, updateShareFormState, updateArMediaState, popupsState } : Props) => { 
    const [isSended, setIsSended] = useState(false);
    const [isRecordVideo, setRecordVideo] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [composingTitle, setComposingTitle] = useState(feed ? feed.title : '');
    const [composingText, setComposingText] = useState(feed ? feed.description : '');
    const [video, setVideo] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [preview, setPreview] = useState(null);
    const titleRef = React.useRef<HTMLInputElement>();
    const textRef = React.useRef<HTMLInputElement>();
    const videoRef = React.useRef<HTMLInputElement>();
	const { t } = useTranslation();
    const videoPath = popupsState?.get('videoPath');
    const { XRPlugin } = Plugins;

    const handleComposingTitleChange = (event: any): void => setComposingTitle(event.target.value);
    const handleComposingTextChange = (event: any): void => setComposingText(event.target.value);
    const handleCreateFeed = async () => {

        const newFeed = {
            title: composingTitle.trim(),
            description: composingText.trim(),
            video, preview
        } as any;   
        if(feed){                    
            updateFeedAsAdmin(feed.id, newFeed);
        }else{
           setVideoUrl(await createFeed(newFeed)); 
        }
        console.log(newFeed);

        setComposingTitle('');
        setComposingText('');
        setVideo(null);
        setPreview(null);
        setIsSended(true);
        Plugins.XRPlugin.stop();
        const thanksTimeOut = setTimeout(()=>{
            setIsSended(false); 
            clearTimeout(thanksTimeOut);
        }, 2000);
    
    };


    const dataURItoBlob = (dataURI) => {
        let byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        return new File([blob], "previewImg.png");
    };

    useEffect(()=> {
        fetch(videoPath)
        .then((res) => res.blob())
        .then((myBlob) => {
         const myFile = new File([myBlob], "test.mp4");
         setVideo(myFile);
         console.log(myFile);
        }).catch(error => console.log(error.message));

//         const prevImage = dataURItoBlob(popupsState?.get('imgSrc'));
        console.log(popupsState?.get('imgSrc'));
        setPreview('prevImage');
    }, [] ); 
     
    
    useEffect(()=> {videoUrl && updateShareFormState(true, videoUrl);}, [videoUrl] ); 
    // const handlePickVideo = async (file) => setVideo(popupsState?.get('videoPath'));
    // const handlePickPreview = async (file) => setPreview('');
    
return <section className={styles.feedFormContainer}>
    {/* <nav>               
        <Button variant="text" className={styles.backButton} onClick={()=>{updateArMediaState(true); updateNewFeedPageState(false);}}><ArrowBackIosIcon />{t('social:feedForm.back')}</Button>
    </nav>   */}
    {isSended ? 
        <Typography>{t('social:feedForm.thanks')}</Typography>
        :
        <section>
            {/* <Typography>{t('social:feedForm.share')}</Typography>            
                {feed && <CardMedia   
                    className={styles.previewImage}                  
                    src={feed.videoUrl}
                    title={feed.title}  
                    component='video'      
                    controls  
                    autoPlay={true} 
                />}  
                {feed && <CardMedia   
                    className={styles.previewImage}                  
                    image={feed.previewUrl}
                    title={feed.title}                      
                />}  
                <section className={styles.flexContainer}>
                    <Card className={styles.preCard}>
                        <Typography>
                            {t('social:feedForm.upload')}
                            <br/><BackupIcon onClick={()=>{(videoRef.current as HTMLInputElement).click();}} />
                            <input required ref={videoRef} type="file" className={styles.displayNone} name="video" onChange={handlePickVideo} placeholder={t('social:feedForm.ph-selectVideo')}/>
                        </Typography> 
                    </Card> */}
                {/* <Card className={styles.preCard}>
                   <Typography variant="h2" align="center">
                        <p>Record from camera</p>
                        <p><CameraIcon  onClick={()=>setRecordVideo(true)} /></p>
                    </Typography> 
                </Card> */}
                {/* <Card className={styles.preCard}>
                    <Typography>{t('social:feedForm.preview')}<input required type="file" name="preview" onChange={handlePickPreview} placeholder={t('social:feedForm.ph-selectPreview')}/></Typography>  
                </Card>  
            </section>            
            <Typography>{t('social:feedForm.createFeed')}</Typography>              
            <TextField ref={titleRef} 
                value={composingTitle}
                onChange={handleComposingTitleChange}
                fullWidth 
                placeholder={t('social:feedForm.ph-videoName')}
                />     */}
            {/* <TextField className={styles.textArea} ref={textRef} 
                value={composingText}
                onChange={handleComposingTextChange}
                fullWidth 
                multiline
                placeholder={t('social:feedForm.ph-type')}
                />     */}
            <Button
                variant="contained"                
                className={styles.submit}
                onClick={()=>handleCreateFeed()}
                >
                {t('social:feedForm.lbl-share')}
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
                        {t('social:feedForm.save')}
                        </Button>  }
                </section>}
        </section>
    }    
</section>;
};

export default connect(mapStateToProps, mapDispatchToProps)(FeedForm);
