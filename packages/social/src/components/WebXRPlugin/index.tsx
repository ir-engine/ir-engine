import { Capacitor } from '@capacitor/core'
import { XRPlugin } from 'webxr-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  CameraHelper,
  Color,
  Group,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer
} from 'three'
import VideocamIcon from '@material-ui/icons/Videocam'
import FlipCameraIosIcon from '@material-ui/icons/FlipCameraIos'
import Player from 'volumetric/web/decoder/Player'
// @ts-ignore
import PlayerWorker from 'volumetric/web/decoder/workerFunction.ts?worker'

//@ts-ignore
import styles from './WebXRPlugin.module.scss'
import { useDispatch } from '@xrengine/client-core/src/store'
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import { usePopupsStateState } from '@xrengine/client-core/src/social/state/PopupsStateService'
import { useArMediaState } from '@xrengine/client-core/src/social/state/ArMediaService'
import { ArMediaService } from '@xrengine/client-core/src/social/state/ArMediaService'
// import HintOne from '../WebXrHints/HintOne'
// import HintTwo from '../WebXrHints/HintTwo'
import { FeedService } from '@xrengine/client-core/src/social/state/FeedService'
import HintOne from '../WebXrHints/HintOne'
import HintTwo from '../WebXrHints/HintTwo'
import ZoomGestureHandler from './ZoomGestureHandler'

interface Props {
  setContentHidden?: any
  webxrRecorderActivity?: any
  feedHintsOnborded?: any
  setFeedHintsOnborded?: any
}

const { isNative } = Capacitor

enum RecordingStates {
  OFF = 'off',
  ON = 'on',
  STARTING = 'starting',
  ENDING = 'ending'
}

const correctionQuaternionZ = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2)

// TODO: return it to false
const _DEBUG = false
const DEBUG_MINI_VIEWPORT_SIZE = 100

export const WebXRPlugin = ({
  setContentHidden,
  webxrRecorderActivity,
  feedHintsOnborded,
  setFeedHintsOnborded
}: Props) => {
  const canvasRef = React.useRef()
  const [initializationResponse, setInitializationResponse] = useState('')
  const [cameraStartedState, setCameraStartedState] = useState('')
  const [cameraPoseState, setCameraPoseState] = useState('')
  const [anchorPoseState, setAnchorPoseState] = useState('')
  const [intrinsicsState, setCameraIntrinsicsState] = useState('')
  const [savedFilePath, setSavedFilePath] = useState('')
  const [hintOne, hintOneShow] = useState(false)
  const [hintTwo, hintTwoShow] = useState(false)
  //     const [horizontalOrientation, setHorizontalOrientation] = useState(false);
  const [mediaItem, _setMediaItem] = useState(null)
  const [videoDelay, setVideoDelay] = useState(null)
  const [recordingState, _setRecordingState] = useState(RecordingStates.OFF)
  const playerRef = useRef<Player | null>(null)
  const anchorRef = useRef<Group | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const cameraRef = useRef<PerspectiveCamera | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const animationFrameIdRef = useRef<number>(0)
  const zoomHandlerRef = useRef<ZoomGestureHandler | null>(null)
  const dispatch = useDispatch()
  const arMediaState = useArMediaState()
  const recordingStateRef = React.useRef(recordingState)
  const setRecordingState = (data) => {
    recordingStateRef.current = data
    _setRecordingState(data)
  }
  const popupsState = usePopupsStateState()
  const mediaItemRef = React.useRef(mediaItem)
  const setMediaItem = (data) => {
    mediaItemRef.current = data
    _setMediaItem(data)
  }
  const closeBtnAction = React.useRef(false)

  const debugCamera: {
    userCameraHelper: CameraHelper
    overview: PerspectiveCamera
    xz: OrthographicCamera
    xy: OrthographicCamera
    zy: OrthographicCamera
  } = {
    userCameraHelper: null,
    overview: null,
    xz: null,
    xy: null,
    zy: null
  }

  const showContent = () => {
    if (!webxrRecorderActivity) {
      setContentHidden()
    }
  }

  function onBackButton() {
    console.log('onBackButton recordingState:', recordingStateRef.current)
    closeBtnAction.current = true
    finishRecord()
    // exit this popup
    PopupsStateService.updateWebXRState(false, null)

    showContent()
  }

  useEffect(() => {
    console.log('recordingState USE EFFECT:', recordingState)
  }, [recordingState])

  useEffect(() => {
    // console.log('WebXRComponent MOUNTED');
    document.addEventListener('backbutton', onBackButton)

    if (!zoomHandlerRef.current) {
      zoomHandlerRef.current = new ZoomGestureHandler(canvasRef.current, (scale) => {
        if (anchorRef.current) {
          anchorRef.current.scale.multiplyScalar(scale)
        }
      })
    }

    if (!feedHintsOnborded) {
      hintOneShow(true)
    }

    return () => {
      // console.log('WebXRComponent UNMOUNT');
      document.removeEventListener('backbutton', onBackButton)

      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }

      if (playerRef.current) {
        console.log('WebXRComponent - dispose player')
        playerRef.current.dispose()
        playerRef.current = null
      }
      if (zoomHandlerRef.current) {
        console.log('WebXRComponent - dispose zoom handler')
        zoomHandlerRef.current.dispose()
        zoomHandlerRef.current = null
      }

      console.log('WebXRComponent - stop plugin')
      // @ts-ignore
      XRPlugin.removeAllListeners()
      // @ts-ignore
      XRPlugin.stop({})
      window.screen.orientation.unlock()

      // setContentHidden();
      // console.log('WebXRComponent - UNMOUNT END');
    }
  }, [])

  const raf = () => {
    animationFrameIdRef.current = requestAnimationFrame(raf) // always request new frame
    const scene = sceneRef.current
    const camera = cameraRef.current
    const renderer = rendererRef.current
    if (!renderer) {
      // if renderer is not created yet, we have nothing to render
      return
    }

    playerRef.current?.handleRender(() => {})

    renderer.render(scene, camera)

    if (_DEBUG) {
      const clearColor = new Color()
      renderer.getClearColor(clearColor)
      const clearAlpha = renderer.getClearAlpha()

      debugCamera.userCameraHelper.visible = true

      renderer.setScissorTest(true)
      renderer.setClearColor(0xa0a0a0, 1)

      renderer.setViewport(10, 10 * 2 + DEBUG_MINI_VIEWPORT_SIZE, DEBUG_MINI_VIEWPORT_SIZE, DEBUG_MINI_VIEWPORT_SIZE)
      renderer.setScissor(10, 10 * 2 + DEBUG_MINI_VIEWPORT_SIZE, DEBUG_MINI_VIEWPORT_SIZE, DEBUG_MINI_VIEWPORT_SIZE)
      renderer.render(scene, debugCamera.overview)
      ;[debugCamera.xz, debugCamera.xy, debugCamera.zy].forEach((cam, index) => {
        const left = 10 + (DEBUG_MINI_VIEWPORT_SIZE + 10) * index
        renderer.setViewport(left, 10, DEBUG_MINI_VIEWPORT_SIZE, DEBUG_MINI_VIEWPORT_SIZE)
        renderer.setScissor(left, 10, DEBUG_MINI_VIEWPORT_SIZE, DEBUG_MINI_VIEWPORT_SIZE)
        renderer.render(scene, cam)
      })

      // reset changes
      debugCamera.userCameraHelper.visible = false
      renderer.setClearColor(clearColor, clearAlpha)
      renderer.setScissorTest(false)
      renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    }
  }

  const itemId = popupsState.popups.itemId?.value
  useEffect(() => {
    ArMediaService.getArMediaItem(itemId)
  }, [itemId])
  useEffect(() => {
    if (!arMediaState.fetchingItem.value) {
      setMediaItem(arMediaState.item.value)
    }
  }, [arMediaState.fetchingItem.value, arMediaState, itemId])

  const mediaItemId = mediaItem?.id
  useEffect(() => {
    if (!mediaItemId) {
      console.log('Media item is not here yet', itemId, arMediaState?.fetchingItem.value)
      return
    }

    ;(async function () {
      if (!sceneRef.current) {
        sceneRef.current = new Scene()
      }
      const scene = sceneRef.current

      if (_DEBUG) {
        debugCamera.xz = new OrthographicCamera(2, -2, 2, -2, 0.001, 100)
        debugCamera.xz.position.y = 10
        debugCamera.xz.rotateX(-Math.PI / 2)

        debugCamera.xy = new OrthographicCamera(2, -2, 2, -2, 0.001, 100)
        debugCamera.xy.position.z = 10

        debugCamera.zy = new OrthographicCamera(2, -2, 2, -2, 0.001, 100)
        debugCamera.zy.position.x = 10
        debugCamera.zy.rotateY(Math.PI / 2)
      }

      //             const geometry = new BoxGeometry(.1, .1, .1);
      //             const materialX = new MeshBasicMaterial({ color: 0xff0000 });
      //             const materialY = new MeshBasicMaterial({ color: 0x00ff00 });
      //             const materialZ = new MeshBasicMaterial({ color: 0x0000ff });
      //             const materialC = new MeshBasicMaterial({ color: 0xffffff });

      if (!anchorRef.current) {
        anchorRef.current = new Group()
      }
      const anchor = anchorRef.current
      // TODO: return it to false
      anchor.visible = false

      //             anchor.add(new AxesHelper(0.3));
      //             const anchorC = new Mesh(geometry, materialC);
      //             anchor.add(anchorC);
      //             const anchorX = new Mesh(geometry, materialX);
      //             anchorX.position.x = 0.3;
      //             anchor.add(anchorX);
      //             const anchorY = new Mesh(geometry, materialY);
      //             anchorY.position.y = 0.3;
      //             anchor.add(anchorY);
      //             const anchorZ = new Mesh(geometry, materialZ);
      //             anchorZ.position.z = 0.3;
      //             anchor.add(anchorZ);
      //
      //             scene.add(new AxesHelper(0.2));

      if (!cameraRef.current) {
        cameraRef.current = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 100)
      }
      const camera = cameraRef.current

      if (_DEBUG) {
        debugCamera.overview = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 100)
        debugCamera.overview.position.set(3, 3, 3)
        debugCamera.overview.lookAt(new Vector3())
      }
      scene.background = null

      if (!rendererRef.current) {
        console.log('CREATE new Renderer')
        rendererRef.current = new WebGLRenderer({ alpha: true, canvas: canvasRef.current })
        //document.body.appendChild(renderer.domElement);
      } else {
        console.log('USE ref Renderer', rendererRef.current)
        console.log('CANVAS is same??', rendererRef.current.domElement === canvasRef.current)
      }
      const renderer = rendererRef.current

      renderer.outputEncoding = sRGBEncoding
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.domElement.style.position = 'fixed'
      renderer.domElement.style.width = '100vw'
      renderer.domElement.style.height = '100vh'
      renderer.domElement.style.zIndex = '-1'

      renderer.domElement.style.top = '0'
      renderer.domElement.style.left = '0'
      renderer.domElement.style.margin = '0'
      renderer.domElement.style.padding = '0'

      scene.add(camera)

      if (_DEBUG) {
        debugCamera.userCameraHelper = new CameraHelper(camera)
        scene.add(debugCamera.userCameraHelper)
      }

      scene.add(anchor)
      anchor.position.set(0, 0, 0)
      anchor.scale.setScalar(1)

      // scene.add(new AxesHelper(2));
      // const gh = new GridHelper(2);
      // scene.add(gh);

      if (!playerRef.current) {
        // setup player if not exists
        // sr1.url as manifestUrl, sr2.url as previewUrl, sr3.url as dracosisUrl, sr4.url as audioUrl
        playerRef.current = new Player({
          scene: anchor,
          renderer,
          worker: new PlayerWorker(),
          meshFilePath: mediaItem.dracosisUrl,
          videoFilePath: mediaItem.audioUrl,
          manifestFilePath: mediaItem.manifestUrl,
          onMeshBuffering: (progress) => {
            // console.warn('BUFFERING!!', progress);
            // setBufferingProgress(Math.round(progress * 100));
            // setIsBuffering(true);
          },
          onFrameShow: () => {
            // setIsBuffering(false);
          }
          // video: document.getElementById("video")
        })
        //const video = playerRef.current.video as HTMLMediaElement;
        //video.muted = true;
      }

      requestAnimationFrame(raf)

      // const { XRPlugin } = Plugins;

      await XRPlugin.initialize({})
        .then((response) => {
          setInitializationResponse(response.status)
          setContentHidden()
        })
        .catch((error) => console.log(error.message))

      // @ts-ignore
      XRPlugin.addListener('poseDataReceived', (data: any) => {
        const camera = cameraRef.current
        const anchor = anchorRef.current

        const {
          cameraPositionX,
          cameraPositionY,
          cameraPositionZ,
          cameraRotationX,
          cameraRotationY,
          cameraRotationZ,
          cameraRotationW
        } = data

        // setCameraPoseState(JSON.stringify({
        //     cameraPositionX,
        //     cameraPositionY,
        //     cameraPositionZ,
        //     cameraRotationX,
        //     cameraRotationY,
        //     cameraRotationZ,
        //     cameraRotationW
        // }));

        camera.quaternion
          .set(cameraRotationX, cameraRotationY, cameraRotationZ, cameraRotationW)
          .multiply(correctionQuaternionZ)
        camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ)

        camera.updateProjectionMatrix()

        if (_DEBUG) {
          // sync cams
          debugCamera.overview?.lookAt(camera.position)
          if (debugCamera.xz) {
            debugCamera.xz.position.x = camera.position.x
            debugCamera.xz.position.z = camera.position.z
          }
          if (debugCamera.xy) {
            debugCamera.xy.position.x = camera.position.x
            debugCamera.xy.position.y = camera.position.y
          }
          if (debugCamera.zy) {
            debugCamera.zy.position.z = camera.position.z
            debugCamera.zy.position.y = camera.position.y
          }
        } // sync cams

        if (data.placed) {
          const {
            anchorPositionX,
            anchorPositionY,
            anchorPositionZ,
            anchorRotationX,
            anchorRotationY,
            anchorRotationZ,
            anchorRotationW
          } = data

          const newAnchorTransformString = JSON.stringify([
            anchorPositionX,
            anchorPositionY,
            anchorPositionZ,
            anchorRotationX,
            anchorRotationY,
            anchorRotationZ,
            anchorRotationW
          ])
          setAnchorPoseState(newAnchorTransformString)

          anchor.quaternion.set(anchorRotationX, anchorRotationY, anchorRotationZ, anchorRotationW)
          anchor.position.set(anchorPositionX, anchorPositionY, anchorPositionZ)

          if (!anchor.visible) {
            console.log('SET ANCHOR VISIBLE!')

            // autosize anchor
            const volumetricHeight = 2 // assuming this as highest height
            const k = camera.position.distanceTo(anchor.position)
            const a = (camera.fov * Math.PI) / 180 / 2

            const halfScreenHeightAtPoint = k * Math.tan(a)
            const newScale = (halfScreenHeightAtPoint / volumetricHeight) * 0.75
            anchor.scale.setScalar(newScale)

            // console.log('player = ', playerRef.current);
            anchor.visible = true

            if (!feedHintsOnborded) {
              setTimeout(() => {
                hintTwoShow(true)
                setFeedHintsOnborded(true)
              }, 1000)
            }
          }
          // TODO: add volumetric isPlaying property
          // if (playerRef.current) {
          // console.log('player play!', data);
          // playerRef.current.mesh.visible = true;
          // if ((playerRef.current.video as HTMLMediaElement).paused) {
          //     playerRef.current.play();
          // }
          // }
        }
      })

      // @ts-ignore
      XRPlugin.addListener('cameraIntrinsicsReceived', (data: any) => {
        setCameraIntrinsicsState(
          JSON.stringify({
            fX: data.fX,
            fY: data.fY,
            cX: data.cX,
            cY: data.cy,
            x: data.x,
            y: data.y
          })
        )

        // TODO: checkout focal length
        // camera.setFocalLength(data.fY/10);
        // camera.setFocalLength(50);

        // TODO:
        // Set camera position and rotation
        // Enable cube and move to position/rotation if placed is true
      })

      XRPlugin.start({})
        .then(() => {
          setCameraStartedState(isNative ? 'Camera started on native' : 'Camera started on web')
        })
        .catch((error) => console.log(error.message))
    })()
  }, [mediaItemId])

  let finishRecord = () => {
    console.log('finishRecord recordingState:', recordingState)
    if (recordingStateRef.current === RecordingStates.ON) {
      console.log('finishRecord')
      console.log('mediaItemRef.current.audioId', mediaItemRef.current)
      console.log('closeBtnAction', closeBtnAction)
      console.log('VIDEO DELAY', videoDelay)
      const clipTitle = mediaItemRef.current.title.replace(/ /gi, '_')
      const clipTime = new Date().toLocaleTimeString().replace(/[\:\ ]/gi, '_')
      console.log(clipTime)
      console.log(clipTitle)

      // @ts-ignore
      XRPlugin.stopRecording({
        audioId: mediaItemRef.current.audioId,
        videoDelay: videoDelay,
        clipTitle: clipTitle,
        clipTime: clipTime
      })
        // @ts-ignore
        .then(({ result, filePath, nameId }) => {
          //console.log('END RECORDING, result IS', result)
          // console.log('filePath is', filePath)
          FeedService.setLastFeedVideoUrl(filePath)
          ArMediaService.getArMediaItem(null)
          setSavedFilePath('file://' + filePath)
          if (!closeBtnAction.current) {
            const videoPath = Capacitor.convertFileSrc(filePath)
            console.log(videoPath)
            PopupsStateService.updateNewFeedPageState(true, videoPath, filePath, nameId)
          }
          setRecordingState(RecordingStates.OFF)
          PopupsStateService.updateWebXRState(false, null)

          // if (playerRef.current) {
          //     const video = playerRef.current.video as HTMLMediaElement;
          //     video.muted = true;
          // }
          // setContentHidden();
        })
        .catch((error) => alert(error.message))
    } else {
      return console.log('Record state is OFF')
    }
  }

  function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1)
    return seconds
  }

  const startRecord = () => {
    if (!window.confirm('Double click to finish the record.')) {
      return
    }
    setRecordingState(RecordingStates.STARTING)
    const start = new Date()
    const screenHeight = Math.floor(screen.height / 2) * 2
    const screenWidth = Math.floor(screen.width / 2) * 2

    //TODO: check why there are errors
    // @ts-ignore
    XRPlugin.startRecording({
      isAudio: true,
      width: screenWidth,
      height: screenHeight,
      bitRate: 6000000,
      dpi: 100,
      filePath: '/test.mp4'
    })
      .then(({ status }) => {
        console.log('RECORDING, STATUS IS', status)
        if (playerRef.current) {
          // const video = playerRef.current.video as HTMLMediaElement;
          // video.muted = true;
          playerRef.current.video.muted = true
          console.log('Player.play()!')
          playerRef.current.play()
          const end = new Date()
          setVideoDelay(parseFloat(msToTime(end.getTime() - start.getTime())))
        }
        setRecordingState(RecordingStates.ON)
      })
      .catch((error) => {
        alert(error.message)
        setRecordingState(RecordingStates.OFF)
      })
  }

  const toggleRecording = () => {
    if (recordingState === RecordingStates.OFF) {
      startRecord()
    } else if (recordingState === RecordingStates.ON) {
      finishRecord()
    }
  }

  const handleTap = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (recordingState !== RecordingStates.OFF) {
      return
    }
    const params = {
      x: e.clientX * window.devicePixelRatio,
      y: e.clientY * window.devicePixelRatio
    }

    if (playerRef.current && playerRef.current.currentFrame <= 0) {
      playerRef.current.playOneFrame()
    }
    // @ts-ignore
    XRPlugin.handleTap(params)
  }

  const playVideo = () => {
    // @ts-ignore
    XRPlugin.playVideo()
  }

  const pauseVideo = () => {
    // @ts-ignore
    XRPlugin.pauseVideo()
  }

  const clearAnchors = () => {
    // @ts-ignore
    XRPlugin.clearAnchors()
  }

  const stopRecord = () => {
    // @ts-ignore
    XRPlugin.stop({})
  }

  // useEffect(() => {
  //     setSecondState("Initialized and effected");
  // }, [initializationResponse]);

  return (
    <>
      {/* <div className="plugintest">
            <div className="plugintestReadout">
                <p>IR:{initializationResponse}</p>
                <p>CSS:{cameraStartedState}</p>
                <p>IS:{intrinsicsState}</p>
                <p>CPS:{cameraPoseState}</p>
                <p>APS:{anchorPoseState}</p>
            </div>
        </div> */}
      {hintOne ? <HintOne hintOneShow={hintOneShow} /> : ''}
      {hintTwo ? <HintTwo hintTwoShow={hintTwoShow} /> : ''}
      <div className="plugintestControls">
        <div className={recordingState === RecordingStates.OFF ? '' : styles.hideButtons}>
          <section className={styles.waterMarkWrapper}>
            <section className={styles.waterMark}>
              <section className={styles.subContainer} />
            </section>
          </section>
          <button type="button" className={styles.flipCamera} onClick={() => {}}>
            <FlipCameraIosIcon />
          </button>
          {/*                 <button type="button" className={styles.changeOrientation} onClick={() => {setHorizontalOrientation(!horizontalOrientation);}}><FlipCameraIosIcon /></button> */}
          <section
            className={recordingState === RecordingStates.OFF ? styles.startButtonWrapper : styles.stopButtonWrapper}
          >
            {/*{recordingState === RecordingStates.OFF ? "Record" : "Stop Recording"}*/}
            <button
              type="button"
              className={recordingState === RecordingStates.OFF ? styles.startButton : styles.stopButton}
              onClick={() => toggleRecording()}
            >
              <VideocamIcon />
            </button>
          </section>
          {/* <button type="button" style={{ padding: "1em" }} onClick={() => handleTap()}>Place AR</button> */}
          {/* <button type="button" style={{ padding: "1em" }} onClick={() => clearAnchors()}>clearAnchors</button> */}
          {/* <button type="button" style={{ padding: "1em" }} onClick={() => playVideo()}>playVideo</button> */}
          {/* <button type="button" style={{ padding: "1em" }} onClick={() => pauseVideo()}>pauseVideo</button> */}
          {/*
                <section className={styles.closeButtonWrapper}>
                    <button type="button" className={styles.closeButton} onClick={() => stopRecord()}><ChevronLeftIcon />Slide to cancel</button>
                </section>
              */}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.arcCanvas}
        id={'arcCanvas'}
        onClick={(e) => handleTap(e)}
        onDoubleClick={finishRecord}
      />
    </>
  )
}

export default WebXRPlugin
