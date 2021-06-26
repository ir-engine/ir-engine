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
import { selectWebXrNativeState } from "@xrengine/client-core/src/socialmedia/reducers/webxr_native/selector";
import { changeWebXrNative } from "@xrengine/client-core/src/socialmedia/reducers/webxr_native/service";
import Preloader from "@xrengine/client-core/src/socialmedia/components/Preloader";
import {selectFeedsState} from "../../reducers/feed/selector";

const mapStateToProps = (state: any): any => {
    return {
      popupsState: selectPopupsState(state),
      feedsState: selectFeedsState(state),
      webxrnativeState: selectWebXrNativeState(state),
    };
  };

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    createFeed: bindActionCreators(createFeed, dispatch),
    updateFeedAsAdmin: bindActionCreators(updateFeedAsAdmin, dispatch),
    updateNewFeedPageState: bindActionCreators(updateNewFeedPageState, dispatch),
    updateShareFormState: bindActionCreators(updateShareFormState, dispatch),
    updateArMediaState: bindActionCreators(updateArMediaState, dispatch),
    changeWebXrNative: bindActionCreators(changeWebXrNative, dispatch)
});

interface Props{
    feed?:any;
    popupsState?: any;
    feedsState?: any;
    createFeed?: typeof createFeed;
    updateFeedAsAdmin?: typeof updateFeedAsAdmin;
    updateNewFeedPageState?: typeof updateNewFeedPageState; 
    updateShareFormState?: typeof updateShareFormState;
    updateArMediaState?: typeof updateArMediaState;
    changeWebXrNative?: any;
    webxrnativeState?: any;
}
const FeedForm = ({feed, createFeed, updateFeedAsAdmin, updateNewFeedPageState, updateShareFormState, updateArMediaState, popupsState, feedsState, webxrnativeState, changeWebXrNative } : Props) => {
    const [isSended, setIsSended] = useState(false);
    const [isRecordVideo, setRecordVideo] = useState(false);
    const [isVideo, setIsVideo] = useState(false);
    const [composingTitle, setComposingTitle] = useState(feed ? feed.title : '');
    const [composingText, setComposingText] = useState(feed ? feed.description : '');
    const [video, setVideo] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [preview, setPreview] = useState(null);
    const [preloader, setPreloader] = useState(false);
    const [readyToPublish, setReadyToPublish] = useState(false);
    const titleRef = React.useRef<HTMLInputElement>();
    const textRef = React.useRef<HTMLInputElement>();
    const videoRef = React.useRef<HTMLInputElement>();
    const { t } = useTranslation();
    const videoPath = popupsState?.get('videoPath');
    const { XRPlugin } = Plugins;

    const handleComposingTitleChange = (event: any): void => setComposingTitle(event.target.value);
    const handleComposingTextChange = (event: any): void => setComposingText(event.target.value);
    const webxrRecorderActivity = webxrnativeState.get('webxrnative');
    const lastFeedVideoUrl = feedsState.get('lastFeedVideoUrl');

    useEffect(()=>{
        console.log('videoUrl', lastFeedVideoUrl);
    }, [lastFeedVideoUrl]);
    const handleCreateFeed = async () => {
        const newFeed = {
            title: composingTitle.trim(),
            description: composingText.trim(),
            video, preview
        } as any;


        if(!newFeed.video && !newFeed.preview){
            alert("Error! Please try again.");
            closePopUp();
            return;
        }

        if(feed){                    
            updateFeedAsAdmin(feed.id, newFeed);
        }else{
           const feedMediaLinks = await createFeed(newFeed);
           // @ts-ignore
           updateShareFormState(true, feedMediaLinks.video, feedMediaLinks.preview);
        }

        setComposingTitle('');
        setComposingText('');
        setVideo(null);
        setPreview(null);
        setIsSended(true);
        // const thanksTimeOut = setTimeout(()=>{
        //     setIsSended(false);
        //     clearTimeout(thanksTimeOut);
        // }, 2000);

        if(webxrRecorderActivity){
            changeWebXrNative();
        }
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

    const shareVideo = (title: string, path: string) => {
        XRPlugin.shareMedia({title, path});
    };

    useEffect(()=> {
        fetch(videoPath)
        .then((res) => res.blob())
        .then((myBlob) => {
         const myFile = new File([myBlob], "test.mp4");
         setVideo(myFile);
         console.log("test.mp4",myFile);
         /*Preview Begin*/
         const file = myFile;
         const fileReader = new FileReader();

         fileReader.onload = function() {
            const blob = new Blob([fileReader.result], {type: file.type});
            const url = URL.createObjectURL(blob);
            const video = document.createElement('video');
            const timeupdate = function() {
                if (snapImage()) {
                    video.removeEventListener('timeupdate', timeupdate);
                    video.pause();
                }
             };
             video.addEventListener('loadeddata', () => {
                if (snapImage()) {
                    video.removeEventListener('timeupdate', timeupdate);
                }
             });
             const snapImage = function() {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
                const image = canvas.toDataURL();
                const success = image.length > 100000;
                if (success) {
                    setPreview(dataURItoBlob(image));
                    URL.revokeObjectURL(url);
                }
                return success;
             };
             video.addEventListener('timeupdate', timeupdate);
             video.preload = 'metadata';
             video.src = url;
             // Load video in Safari / IE11
             video.muted = true;
             video.playsInline = true;
             video.play();
          };
          fileReader.readAsArrayBuffer(file);
          /*Preview Finish*/
          setReadyToPublish(true);
        }).catch(error => console.log(error.message));


    }, [] );

    const closePopUp = () => {
        updateNewFeedPageState(false);
        if(webxrRecorderActivity){
            changeWebXrNative();
        }
    };

    // useEffect(()=> {videoUrl && updateNewFeedPageState(false, null) && updateShareFormState(true, videoUrl);}, [videoUrl] );
    // const handlePickVideo = async (file) => setVideo(popupsState?.get('videoPath'));
    // const handlePickPreview = async (file) => setPreview('');

    useEffect(()=>{
        return ()=>{
            // cleaning up memory to avoid leaks
            setIsSended(null);
        };
    });

    const feedsFetching = feedsState.get('feedsFetching');

return <section className={styles.feedFormContainer}>
    {/* <nav>               
        <Button variant="text" className={styles.backButton} onClick={()=>{updateArMediaState(true); updateNewFeedPageState(false);}}><ArrowBackIosIcon />{t('social:feedForm.back')}</Button>
    </nav>   */}
    {feedsFetching && <Preloader text={'Publishing...'} />}
    {!readyToPublish && <Preloader text={'Loading...'} />}
    {isSended ? 
        <Typography>{t('social:feedForm.thanks')}</Typography>
        :
        <section className={styles.alignSection}>
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
            <video className={styles.feedVideoPreview} autoPlay={true} loop muted={false}>
                <source src={ videoPath } type="video/mp4" />
            </video>
            <div className={styles.buttonWraper}>
                {readyToPublish &&
                    <div>
                        <Button
                        variant="contained"
                        className={styles.submit}
                        onClick={()=>handleCreateFeed()}
                        >
    {/*                         {t('social:feedForm.lbl-share')} */}
                            Add Feed
                        </Button>
                    </div>
                }
                {!!lastFeedVideoUrl && <Button
                    variant="contained"
                    className={styles.submit}
                    onClick={ () => shareVideo('ARC_Perfomance', lastFeedVideoUrl) }
                >
                    Share
                </Button>}

                <Button
                    variant="contained"
                    className={styles.submit}
                    onClick={()=>closePopUp()}
                    >
                        Cancel
                    </Button>
            </div>

                
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
