import { VideoTexture } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { createElement } from "@xr3ngine/engine/src/ecs/functions/createElement";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Renderer,
  sRGBEncoding,
  Uint32BufferAttribute,
  WebGLRenderer
} from 'three';
import {
  IFrameBuffer,
  KeyframeBuffer
} from './Interfaces';
import RingBuffer from './RingBuffer';

type AdvancedHTMLVideoElement = HTMLVideoElement & { requestVideoFrameCallback: (callback: (number, {}) => void) => void };
type onMeshBufferingCallback = (progress:number) => void;
type onFrameShowCallback = (frame:number) => void;


const boxLength = 32; // length of the databox
const byteLength = 16;
const videoSize = 2048;

export default class DracosisPlayer {
  // Public Fields
  public frameRate = 30;
  public speed = 1.0; // Multiplied by framerate for final playback output rate

  // Three objects
  public scene: Object3D;
  public renderer: Renderer;
  public mesh: Mesh;
  public meshFilePath: String;
  public material: MeshBasicMaterial;
  public failMaterial: MeshBasicMaterial;
  public bufferGeometry: BufferGeometry;

  // Private Fields
  private readonly _scale:number = 1;
  private _prevFrame = 0;
  private currentKeyframe = 0;
  private _video:HTMLVideoElement|AdvancedHTMLVideoElement = null;
  private _videoTexture = null;
  private _loop = true;
  private _isinitialized = false;
  private meshBuffer: RingBuffer<KeyframeBuffer>;
  private iframeVertexBuffer: RingBuffer<IFrameBuffer>;
  private _worker: Worker;
  private _bufferingTimer: any;
  private status:"paused"|"playing"|"buffering"|"error" = 'paused';
  private onMeshBuffering: onMeshBufferingCallback|null = null;
  private onFrameShow: onFrameShowCallback|null = null;

  fileHeader: any;
  tempBufferObject: KeyframeBuffer = {
    frameNumber: 0,
    keyframeNumber: 0,
    bufferGeometry: null
  }

  manifestFilePath: any;
  fetchLoop: any;
  keyframesToBufferBeforeStart: number;
  numberOfKeyframes = 0;
  numberOfIframes = 0;
  counterCanvas: HTMLCanvasElement;
  counterCtx: CanvasRenderingContext2D;
  actorCanvas: HTMLCanvasElement;
  actorCtx: CanvasRenderingContext2D;

  numberOfFrames: any;
  private _canvasTexture: any;

  // public getters and settings
  get currentFrame(): number {
    return this.currentKeyframe;
  }

  get loop(): boolean {
    return this._loop;
  }
  set loop(value: boolean) {
    this._loop = value;
  }

  request
  performAnimation = () => {
    if (this._video !== null) {
      this.videoAnimationFrame(null);
    }
    this.request = requestAnimationFrame(this.performAnimation)
  }

  currentEncode = false;
  textureBatchChanged = false;

  lastTimeReported = 0;
  lastDate = -1;
  delta = 0;
  lastDeltadFrame = 0;

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    targetFramesToRequest = 50,
    frameRate = 25,
    loop = true,
    autoplay = true,
    scale = 1,
    keyframesToBufferBeforeStart = 100,
    video = null,
    onMeshBuffering = null,
    onFrameShow = null
  }:{
    scene: Object3D,
    renderer: WebGLRenderer,
    meshFilePath: string,
    videoFilePath: string,
    targetFramesToRequest?: number,
    frameRate?: number,
    loop?: boolean,
    autoplay?: boolean,
    scale?: number,
    keyframesToBufferBeforeStart?: number,
    video?:any,
    onMeshBuffering?: onMeshBufferingCallback
    onFrameShow?: onFrameShowCallback
  }) {

    this.onMeshBuffering = onMeshBuffering;
    this.onFrameShow = onFrameShow;

    const worker = new Worker(new URL('./workerFunction.ts', import.meta.url)); // spawn new worker
    this._worker = worker;

    const handleFrameData = (messages) => {
        messages.forEach(frameData => {
        let geometry = new BufferGeometry();
        geometry.setIndex(
          new Uint32BufferAttribute(frameData.bufferGeometry.index, 1)
        );
        geometry.setAttribute(
          'position',
          new Float32BufferAttribute(frameData.bufferGeometry.position, 3)
        );
        geometry.setAttribute(
          'uv',
          new Float32BufferAttribute(frameData.bufferGeometry.uv, 2)
        );

        this.meshBuffer.add({ ...frameData, bufferGeometry: geometry });

        if (this.status === "buffering") {
          // Handle buffering state, check if we buffered enough or report buffering progress
          // TODO: handle our inconsecutive frames loading, now i assume that all previous frames are loaded
          const bufferingSize = this.keyframesToBufferBeforeStart;
          const bufferedEnough = this.meshBuffer.getPos() > (this.currentKeyframe+bufferingSize);
          const bufferedCompletely = frameData.keyframeNumber >= (this.numberOfKeyframes - 1);

          if (bufferedEnough || bufferedCompletely) {
            this.status = "playing";
            this._video.play();
            if (!this.mesh.visible) {
              this.mesh.visible = true;
            }
          } else {
            if (typeof this.onMeshBuffering === "function") {
              // TODO: make progress report based on how many frames loaded (not on index of last loaded)
              this.onMeshBuffering(frameData.keyframeNumber / (this.currentKeyframe + bufferingSize));
            }
          }
        }
      })
    }

    worker.onmessage = (e) => {
      switch (e.data.type) {
        case 'initialized':
          console.log("Worker initialized");
          break;
        case 'framedata':
          // console.log("Frame data received");
          handleFrameData(e.data.payload);
          break;
        case 'completed':
          console.log("Worker complete!");
          break;

      }
      // console.log('Worker said: ', e.data); // message received from worker
    };

    this.keyframesToBufferBeforeStart = keyframesToBufferBeforeStart;
    // Set class values from constructor
    this.scene = scene;
    this.renderer = renderer;
    this.meshFilePath = meshFilePath;
    this.manifestFilePath = meshFilePath.replace('drcs', 'manifest');
    this._loop = loop;
    this._scale = scale;
    this._video = video ?? createElement('video', {
      crossorigin: "anonymous",
      playsInline: "true",
      loop: true,
      src: videoFilePath,
      style: {
        display: "none",
        position: 'fixed',
        zIndex: '-1',
        top: '0',
        left: '0',
        width: '1px'
      },
      playbackRate: 1
    });

    this.frameRate = frameRate;

    this.videoUpdateHandler = this.videoUpdateHandler.bind(this)
    this.videoAnimationFrame = this.videoAnimationFrame.bind(this)

    // Create a default mesh

    if ("requestVideoFrameCallback" in this._video) {
      this._video.requestVideoFrameCallback(this.videoUpdateHandler);
      this._videoTexture = new VideoTexture(this._video as any);
      this._videoTexture.encoding = sRGBEncoding;
      this.material = new MeshBasicMaterial({ map: this._videoTexture });

      console.log("****** This platform has requestVideoFrameCallback!")
    } else {
      // this._video.addEventListener('timeupdate', this.videoAnimationFrame);
      console.log("****** This platform has no requestVideoFrameCallback!")
      this.counterCanvas = document.createElement('canvas') as HTMLCanvasElement;
      this.counterCanvas.width = byteLength;
      this.counterCanvas.height = 1;
      this.counterCtx = this.counterCanvas.getContext('2d');
      this.actorCtx = document.createElement('canvas').getContext('2d');
      this.actorCtx.canvas.width = this.actorCtx.canvas.height = videoSize;
      this.actorCtx.fillStyle = '#FFF';
      this.actorCtx.fillRect(0, 0, this.actorCtx.canvas.width, this.actorCtx.canvas.height);
      this._canvasTexture = new VideoTexture(this.actorCtx.canvas as any);
      this.material = new MeshBasicMaterial({ map: this._canvasTexture });

      this.performAnimation();
    }
    this.failMaterial = new MeshBasicMaterial({ color: '#555555' });
    this.mesh = new Mesh(new PlaneBufferGeometry(0.00001, 0.00001), this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale);
    this.scene.add(this.mesh);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      this.fileHeader = JSON.parse(xhr.responseText);
      this.frameRate = this.fileHeader.frameRate;

      // Get count of frames associated with keyframe
      const numberOfIframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber !== frame.frameNumber).length;
      const numberOfKeyframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === frame.frameNumber).length;
      this.numberOfFrames = this.fileHeader.frameData.length;
      this.numberOfIframes = numberOfIframes;
      this.numberOfKeyframes = numberOfKeyframes;

      this.meshBuffer = new RingBuffer(this.numberOfFrames);
      this.iframeVertexBuffer = new RingBuffer(numberOfIframes);

      // if (autoplay) {
      //   if (Engine.hasUserEngaged) {
      //     this.play();
      //   } else {
      //     const onUserEngage = () => {
      //       this.play();
      //       EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.USER_ENGAGE, onUserEngage);
      //     }
      //     EngineEvents.instance?.addEventListener(EngineEvents.EVENTS.USER_ENGAGE, onUserEngage);
      //   }
      // }

      worker.postMessage({ type: "initialize", payload: { targetFramesToRequest, meshFilePath, numberOfKeyframes: this.numberOfKeyframes, numberOfFrames: this.numberOfFrames, fileHeader: this.fileHeader } }); // Send data to our worker.
      this._isinitialized = true;
    };

    xhr.open('GET', this.manifestFilePath, true); // true for asynchronous
    xhr.send();
  }

  /**
   * emulated video frame callback
   * bridge from video.timeupdate event to videoUpdateHandler
   * @param {Event} e
   */
  videoAnimationFrame(e) {
    if (!this.fileHeader || !this._isinitialized) return;
    if (this._video.currentTime === 0 || this._video.paused) return;
    if (this.lastDate < 0) this.lastDate = Date.now() / 1000;
    // Check if current time reported is same as last reported frame
    // If it is the same, add the delta from last frame
    if (this._video.currentTime === this.lastTimeReported) {
      this.delta += (Date.now() / 1000) - this.lastDate;
      // If it isn't the same, clear delta
    } else {
      this.delta = 0;
    }
    this.lastTimeReported = this._video.currentTime;
    this.lastDate = Date.now() / 1000;

    this.counterCtx.clearRect(0, 0, byteLength, 1);

    this.counterCtx.drawImage(this._video, 0, videoSize-boxLength, boxLength*byteLength, boxLength, 0, 0, byteLength, 1);

    const imgData = this.counterCtx.getImageData(0, 0, byteLength, 1);
    let frameIn = 0;
    for(let i = 0; i < byteLength; i++)
      frameIn += imgData.data[i*4]/255*Math.pow(2, byteLength - i);

    console.log("********* FRAME IN IS", frameIn);

    // now is not used, so no matter what we pass
    this.videoUpdateHandler(0, {
      timeIsNotExact: true,
      mediaTime: this._video.currentTime,
      presentedFrames: Math.round(frameIn) // we use presentedFrames only for check, so no need to be precise here
    });
  }

  videoUpdateHandler(now, metadata) {
    if (!this._isinitialized) return console.warn("Not inited");
    let frameToPlay = metadata.timeIsNotExact ? metadata.presentedFrames : Math.round(metadata.mediaTime * this.frameRate);
    const keyframeToPlay = this.fileHeader.frameData[metadata.timeIsNotExact ? metadata.presentedFrames : frameToPlay].keyframeNumber

    if (frameToPlay !== this._prevFrame) {
      this._prevFrame = frameToPlay;

      const isNewKeyframe = keyframeToPlay !== this.currentKeyframe;
      // console.log("Looped frame to play is: ", frameToPlay, "| Current keyframe is: ", this.currentKeyframe, "| Requested Keyframe is: ", keyframeToPlay, "|Is new?", isNewKeyframe);

      // console.log("Looped frame to play is", loopedFrameToPlay, "| Keyframe to play is", keyframeToPlay, "|Is new keyframe?", newKeyframe);

      if (isNewKeyframe) {
        this.currentKeyframe = keyframeToPlay;
        console.log("***** Keyframe to play", this.currentKeyframe)
        console.log("Mesh buffer length is, ", this.meshBuffer.getBufferLength());

        // If keyframe changed, set mesh buffer to new keyframe
        const meshBufferPosition = this.getPositionInKeyframeBuffer(keyframeToPlay);

        // console.log("Mesh buffer position is: ", meshBufferPosition);

        if (meshBufferPosition === -1) {
          console.log('out of sync');

        }
        if (meshBufferPosition === -1) {
          this.status = "buffering";
          if (!this._video.paused) {
            this._video.pause();
          }
          if (typeof this.onMeshBuffering === "function") {
            this.onMeshBuffering(0);
          }
          // this.mesh.visible = false;
          // this._video.pause();
          this.mesh.material = this.failMaterial;
        } else {
          this.mesh.material = this.material;
          this.mesh.geometry = this.meshBuffer.get(meshBufferPosition).bufferGeometry as BufferGeometry;
          if (typeof this.onFrameShow === "function") {
            this.onFrameShow(keyframeToPlay);
          }
        }
      }
      else {
        let vertexBufferPosition = this.getPositionInIFrameBuffer(frameToPlay);
        if (this.iframeVertexBuffer.get(vertexBufferPosition) !== undefined) {
          this.mesh.geometry = this.iframeVertexBuffer.get(vertexBufferPosition).vertexBuffer as any;
        } else {
          vertexBufferPosition = this.getPositionInIFrameBuffer(frameToPlay + 1);
          console.warn("Iframe was not found, but the next one was");
          if (this.iframeVertexBuffer.get(vertexBufferPosition) !== undefined) {
            this.mesh.geometry = this.iframeVertexBuffer.get(vertexBufferPosition).vertexBuffer as any;
          } else {
            console.warn("Skipped iframe playback, not in buffer");
          }
        }
      }
      (this.mesh.material as any).needsUpdate = true;
    }

    if ("requestVideoFrameCallback" in this._video) {
      this._video.requestVideoFrameCallback(this.videoUpdateHandler);
    }
  }

  // Start loop to check if we're ready to play
  play() {
    this._video.playsInline = true;

    this._video.play()

    // console.log("Playing")
    const buffering = setInterval(() => {
      if (this.meshBuffer && this.meshBuffer.getBufferLength() >= this.keyframesToBufferBeforeStart) {
        // console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", playing video");
        clearInterval(buffering);
        // this._video.play()
        this.mesh.visible = true
      }

    }, 1000 / 60);
    this._bufferingTimer = buffering;
  }

  getPositionInKeyframeBuffer(keyframeNumber: number): number {
    // Search backwards, which should make the for loop shorter on longer buffer
    for (let i = this.meshBuffer.getBufferLength(); i >= 0; i--) {
      if (
        this.meshBuffer.get(i) &&
        keyframeNumber == this.meshBuffer.get(i).frameNumber &&
        keyframeNumber == this.meshBuffer.get(i).keyframeNumber
      )
        return i;
    }
    return -1;
  }

  getPositionInIFrameBuffer(frameNumber: number): number {
    // Search backwards, which should make the for loop shorter on longer buffer
    for (let i = this.iframeVertexBuffer.getBufferLength(); i >= 0; i--) {
      if (
        this.iframeVertexBuffer.get(i) &&
        frameNumber == this.iframeVertexBuffer.get(i).frameNumber
      )
        return i;
    }
    return -1;
  }

  dispose(): void {
    // TODO: finish dispose method
    this._isinitialized = false;
    this._worker?.terminate();
    if (this._video) {
      // this._video.stop();
      // this._video.parentElement.removeChild(this._video);
      this._video = null;
      this._videoTexture.dispose();
      this._videoTexture = null;
    }
    if (this.meshBuffer) {
      for (let i = 0; i < this.meshBuffer.getBufferLength(); i++) {
        const buffer = this.meshBuffer.get(i);
        if (buffer && buffer.bufferGeometry instanceof BufferGeometry) {
          buffer.bufferGeometry?.dispose();
        }
      }
      this.meshBuffer.clear();
    }
    if (this._bufferingTimer) {
      clearInterval(this._bufferingTimer);
    }
  }
}
