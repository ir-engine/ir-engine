/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'

import { useDispatch } from '@xrengine/client-core/src/store'
import VideoRecorder from 'react-video-recorder'
import Button from '@material-ui/core/Button'
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import BackupIcon from '@mui/icons-material/Backup'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { useTranslation } from 'react-i18next'
import { Capacitor, Plugins } from '@capacitor/core'
import { Http, HttpResponse } from '@capacitor-community/http'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
// @ts-ignore
import styles from './FeedForm.module.scss'
import { FeedService } from '@xrengine/client-core/src/social/services/FeedService'
import { PopupsStateService } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { usePopupsStateState } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { useWebxrNativeState } from '@xrengine/client-core/src/social/services/WebxrNativeService'
import { WebxrNativeService } from '@xrengine/client-core/src/social/services/WebxrNativeService'
import Preloader from '@xrengine/social/src/components/Preloader'
import { useFeedState } from '@xrengine/client-core/src/social/services/FeedService'

interface Props {
  feed?: any
}
const FeedForm = ({ feed }: Props) => {
  const [isSended, setIsSended] = useState(false)
  const [isRecordVideo, setRecordVideo] = useState(false)
  const [isVideo, setIsVideo] = useState(false)
  const [composingTitle, setComposingTitle] = useState(feed ? feed.title : '')
  const [composingText, setComposingText] = useState(feed ? feed.description : '')
  const [video, setVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [preview, setPreview] = useState(null)
  const [preloader, setPreloader] = useState(false)
  const [readyToPublish, setReadyToPublish] = useState(false)
  const [saveStatus, setSaveStatus] = useState(false)
  const titleRef = React.useRef<HTMLInputElement>()
  const textRef = React.useRef<HTMLInputElement>()
  const videoRef = React.useRef<HTMLInputElement>()
  const { t } = useTranslation()
  const popupsState = usePopupsStateState()
  const videoPath = popupsState?.popups?.videoPath?.value
  const videoDir = popupsState?.popups?.fPath?.value
  const nameId = popupsState?.popups?.nameId?.value
  const { XRPlugin } = Plugins
  const dispatch = useDispatch()
  const handleComposingTitleChange = (event: any): void => setComposingTitle(event.target.value)
  const handleComposingTextChange = (event: any): void => setComposingText(event.target.value)
  const webxrnativeState = useWebxrNativeState()
  const webxrRecorderActivity = webxrnativeState.webxrnative.value
  const feedsState = useFeedState()
  const lastFeedVideoUrl = feedsState.feeds.lastFeedVideoUrl?.value

  useEffect(() => {
    console.log('videoUrl', lastFeedVideoUrl)
    console.log(lastFeedVideoUrl)
  }, [lastFeedVideoUrl])
  const handleCreateFeed = async () => {
    const newFeed = {
      title: composingTitle.trim(),
      description: composingText.trim(),
      video,
      preview
    } as any

    console.log(newFeed)

    if (!newFeed.video && !newFeed.preview) {
      alert('Error! Please try again.')
      closePopUp()
      return
    }

    if (feed) {
      FeedService.updateFeedAsAdmin(feed.id, newFeed)
    } else {
      const feedMediaLinks = await FeedService.createFeed(newFeed)
      // @ts-ignore
      // updateShareFormState(true, feedMediaLinks.video, feedMediaLinks.preview);
    }

    setComposingTitle('')
    setComposingText('')
    setVideo(null)
    setPreview(null)
    setIsSended(true)
    // const thanksTimeOut = setTimeout(()=>{
    //     setIsSended(false);
    //     clearTimeout(thanksTimeOut);
    // }, 2000);

    if (webxrRecorderActivity) {
      WebxrNativeService.changeWebXrNative()
    }
    XRPlugin.deleteVideo({ videoDir: videoDir })
    PopupsStateService.updateNewFeedPageState(false, null, null, null)
  }

  const dataURItoBlob = (dataURI) => {
    let byteString = atob(dataURI.split(',')[1])
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    const blob = new Blob([ab], { type: mimeString })
    return new File([blob], 'previewImg.png')
  }

  const shareVideo = (title: string, path: string) => {
    Share.share({
      title: t('social:shareForm.arcMedia'),
      text: t('social:shareForm.videoCreated'),
      url: videoDir,
      dialogTitle: t('social:shareForm.shareWithBuddies')
    })
    // XRPlugin.shareMedia({ title, path })
  }

  // const doGet = async () => {
  //   alert('START RESPONSE')
  //   const options = {
  //     method: "GET",
  //     url: videoPath,
  //     // headers: { 'X-Fake-Header': 'Max was here' },
  //     // params: { size: 'XL' },
  //   };
  //
  //   const response: HttpResponse = await Http.request(options).catch((error) => alert(JSON.stringify(error.message)));
  //   alert(JSON.stringify(response))
  //
  //   // or...
  //   // const response = await Http.request({ ...options, method: 'GET' })
  // };

  const readFilePath = async () => {
    // Here's an example of reading a file with a full file path. Use this to
    // read binary data (base64 encoded) from plugins that return File URIs, such as
    // the Camera.
    const contents = await Filesystem.readFile({
      path: videoDir
    })

    // const codeContents = atob(contents)
    // alert(JSON.stringify(codeContents))

    var contentType = contentType || ''
    var sliceSize = 1024
    try {
      var byteCharacters = atob(contents.data)
    } catch (e) {
      alert(JSON.stringify(e))
    }

    var bytesLength = byteCharacters.length
    var slicesCount = Math.ceil(bytesLength / sliceSize)
    var byteArrays = new Array(slicesCount)
    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize
      var end = Math.min(begin + sliceSize, bytesLength)
      var bytes = new Array(end - begin)
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0)
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes)
    }
    const myBlob = new Blob(byteArrays, { type: contentType })

    const myFile = new File([myBlob], 'test.mp4')
    console.log(myFile.size)
    setVideo(myFile)
    //
    /*Preview Begin*/
    const file = myFile
    const fileReader = new FileReader()

    // fileReader.onload = function() {
    //   const blob = new Blob([fileReader.result], { type: file.type })
    //   const url = URL.createObjectURL(blob)
    //   const video = document.createElement('video')
    //
    //   const timeupdate = function() {
    //     if (snapImage()) {
    //       video.removeEventListener('timeupdate', timeupdate)
    //       video.pause()
    //     }
    //   }
    //
    //   video.addEventListener('loadeddata', () => {

    //     if (snapImage()) {
    //       video.removeEventListener('timeupdate', timeupdate)
    //     }
    //   })

    // const snapImage = function() {
    //   alert('Snap')
    //   const canvas = document.createElement('canvas')
    //   canvas.width = video.videoWidth
    //   canvas.height = video.videoHeight
    //   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    //   const image = canvas.toDataURL()
    //   alert(JSON.stringify(image.length))
    //   const success = image.length > 100000
    //   alert(JSON.stringify(success))
    // if (success) {
    setPreview(myFile)
    //   URL.revokeObjectURL(url)
    // // }
    // return success
    // }

    // video.autoplay = true
    // video.preload = 'metadata'
    // video.playsInline = true
    // video.addEventListener('timeupdate', timeupdate)
    // video.src = url
    // // Load video in Safari / IE11
    // video.muted = true
    //
    // video.play()
    // }
    // fileReader.readAsArrayBuffer(file)
    /*Preview Finish*/
    setReadyToPublish(true)
  }

  useEffect(() => {
    readFilePath()

    // doGet()

    // fetch(videoPath).catch((error) => alert(JSON.stringify(error.message)))
    //   .then((res) => res.blob()).catch((error) => alert(JSON.stringify(error.message)))
    //   .then((myBlob) => {

    //
    //   })
    //   .catch((error) => console.log(error.message))
  }, [])

  const closePopUp = () => {
    PopupsStateService.updateNewFeedPageState(false, null, null, null)
    if (webxrRecorderActivity) {
      WebxrNativeService.changeWebXrNative()
    }
    XRPlugin.deleteVideo({ videoDir: videoDir })
  }

  // useEffect(()=> {videoUrl && updateNewFeedPageState(false, null) && updateShareFormState(true, videoUrl);}, [videoUrl] );
  // const handlePickVideo = async (file) => setVideo(popupsState?.get('videoPath'));
  // const handlePickPreview = async (file) => setPreview('');

  useEffect(() => {
    return () => {
      // cleaning up memory to avoid leaks
      setIsSended(null)
    }
  })

  const feedsFetching = feedsState.feeds.feedsFetching.value

  return (
    <section className={styles.feedFormContainer}>
      {/* <nav>
        <Button variant="text" className={styles.backButton} onClick={()=>{updateArMediaState(true); updateNewFeedPageState(false);}}><ArrowBackIosIcon />{t('social:feedForm.back')}</Button>
    </nav>   */}
      {feedsFetching && <Preloader text={'Publishing...'} />}
      {!readyToPublish && <Preloader text={'Loading...'} />}
      {isSended ? (
        <Typography>{t('social:feedForm.thanks')}</Typography>
      ) : (
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
          {videoPath && (
            <video
              className={styles.feedVideoPreview}
              id={video}
              autoPlay={false}
              loop
              muted={false}
              playsInline={true}
              controls={true}
            >
              <source src={videoPath} type="video/mp4" />
            </video>
          )}
          <div className={styles.buttonWraper}>
            {videoPath && (
              <div>
                <Button variant="contained" className={styles.submit} onClick={() => handleCreateFeed()}>
                  {/*                         {t('social:feedForm.lbl-share')} */}
                  {t('social:shareForm.addFeed')}
                </Button>
              </div>
            )}
            {!!lastFeedVideoUrl && (
              <Button
                variant="contained"
                className={styles.submit}
                onClick={() => shareVideo('ARC_Perfomance', lastFeedVideoUrl)}
              >
                {t('social:shareForm.arcMedia')}
              </Button>
            )}

            {saveStatus ? (
              ''
            ) : (
              <Button
                variant="contained"
                className={styles.submit}
                onClick={() => {
                  XRPlugin.saveVideoTo({ videoDir: videoDir, nameId: nameId })
                  setSaveStatus(true)
                }}
              >
                {t('social:save')}
              </Button>
            )}
            <Button variant="contained" className={styles.submit} onClick={() => closePopUp()}>
              {t('social:cancel')}
            </Button>
          </div>

          {isRecordVideo === true && (
            <section className={styles.videoWrapper}>
              <VideoRecorder
                onRecordingComplete={(videoBlob) => {
                  setVideo(videoBlob)
                  setIsVideo(true)
                }}
              />
              {isVideo && (
                <Button
                  variant="contained"
                  color="secondary"
                  className={styles.submit}
                  onClick={() => {
                    setRecordVideo(false)
                    setIsVideo(false)
                  }}
                >
                  {t('social:feedForm.save')}
                </Button>
              )}
            </section>
          )}
        </section>
      )}
    </section>
  )
}

export default FeedForm
