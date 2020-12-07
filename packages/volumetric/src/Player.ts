import { HttpRangeFetcher } from 'http-range-fetcher';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Renderer,
  Scene,
  Uint16BufferAttribute,
  Uint32BufferAttribute,
  VideoTexture
} from 'three';
import {
  IFrameBuffer,
  KeyframeBuffer
} from './Interfaces';
import CortoDecoder from './libs/cortodecoder.js';
import RingBuffer from './RingBuffer';

import mediainfo from 'mediainfo';

export default class DracosisPlayer {
  // Public Fields
  public frameRate = 30;
  public speed = 1.0; // Multiplied by framerate for final playback output rate

  // Three objects
  public scene: Scene;
  public renderer: Renderer;
  public mesh: Mesh;
  public meshFilePath: String;
  public material: any;
  public bufferGeometry: BufferGeometry;

  // Private Fields
  private _scale = 1;
  private _prevFrame = 0;
  private _numberOfFrames = 0;
  private currentKeyframe = 1;
  private _video = null;
  private _videoTexture = null;
  private _loop = true;
  private _isinitialized = false;
  private meshBuffer: RingBuffer<KeyframeBuffer>;
  private iframeVertexBuffer: RingBuffer<IFrameBuffer>;
  private rangeFetcher = new HttpRangeFetcher({})
  
  private lastKeyframe = -1;

  fileHeader: any;
  tempBufferObject: KeyframeBuffer = {
    frameNumber: 0,
    keyframeNumber: 0,
    bufferGeometry: null
  }

  manifestFilePath: any;
  fetchLoop: number;

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

  mediaInfo = null;

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    frameRate = 30,
    loop = true,
    autoplay = true,
    scale = 1,
    keyframeBufferSize = 20,
    iframeBufferSize = 100
  }) {

    // Set class values from constructor
    this.scene = scene;
    this.renderer = renderer;
    this.meshFilePath = meshFilePath;
    this.manifestFilePath = meshFilePath.replace('drcs', 'manifest');
    this._loop = loop;
    this._scale = scale;
    this._video = document.createElement('video');
    this._video.crossorigin = "anonymous";
    this._video.src = videoFilePath;
    this._videoTexture = new VideoTexture(this._video);
    this._videoTexture.crossorigin = "anonymous";

    if(frameRate) this.frameRate = frameRate;
    else {
      mediainfo(videoFilePath, (err, res) => {
        if(err) return console.error(err);
        this.mediaInfo = res;
        console.log("Video media info is", this.mediaInfo);
        // TODO: Set framerate here
      })
    }


    // Add video to dom and bind the upgdate handler to playback
    document.body.appendChild(this._video);
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));

    // Create a default mesh
    this.bufferGeometry = new PlaneBufferGeometry(1, 1);
    this.material = new MeshBasicMaterial({ map: this._videoTexture });
    this.mesh = new Mesh(this.bufferGeometry, this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale);
    this.scene.add(this.mesh);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
        this.fileHeader = JSON.parse(xhr.responseText);

        this._numberOfFrames = this.fileHeader.frameData.length;
        
        this.meshBuffer = new RingBuffer(keyframeBufferSize);
        this.iframeVertexBuffer = new RingBuffer(iframeBufferSize);

        if (autoplay) {
          // Create an event listener that removed itself on input
          const eventListener = () => {
            // If we haven't inited yet, notify that we have, autoplay content and remove the event listener
            this.play();
              document.body.removeEventListener("mousedown", eventListener);    
          }
          document.body.addEventListener("mousedown", eventListener)
        }
        this._isinitialized = true;
    };

    xhr.open('GET', this.manifestFilePath, true); // true for asynchronous
    xhr.send();
  }

  videoUpdateHandler(now, metadata) {
    let frameToPlay = metadata.presentedFrames - 1;
    if (frameToPlay !== this._prevFrame) {


      if (!this._isinitialized) return console.warn("Not inited");

    let loopedFrameToPlay = frameToPlay % this._numberOfFrames;



    // TODO:
        // Get keyframe of the frame to play
    // Is it the same as the last keyframe?
    
    // If yes, leave the keyuframe mesh, remove any iframe meshes below this one
    // If not, remove the keyframe mesh, set new mesh to the keyframe mesh and remove any iframe meshes below this keyframe


    while (this.meshBuffer.getFirst().frameNumber % this._numberOfFrames < loopedFrameToPlay )
      this.meshBuffer.remove(0);

    while (this.iframeVertexBuffer.getFirst().frameNumber % this._numberOfFrames < loopedFrameToPlay % this._numberOfFrames )
      this.iframeVertexBuffer.remove(0);



      // TODO: If keyframe changed, set mesh buffer to new keyframe
      // If last frame was a keyframe, add positions from this iframe
      // Otherwise, if last frame wasn't a keyframe, vertex positions are vertex positions from keyframe + iframe positions

      // Update meshes and finish


    if (this.meshBuffer.getFirst().frameNumber == loopedFrameToPlay) {
      this.bufferGeometry = this.meshBuffer.getFirst().bufferGeometry as any;
      this.mesh.geometry = this.bufferGeometry;
      (this.mesh.material as any).needsUpdate = true;
    } else {
      console.warn("Frame", loopedFrameToPlay, "isn't frame to play");
    }


      this._prevFrame = frameToPlay;
    }
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));
  }

  // Start loop to check if we're ready to play
  public play = () => {
    this.startFetchLoop();
    const buffering = setInterval(() => {
      if(this.meshBuffer.getBufferLength() > 10){
        console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", playing video");
        clearInterval(buffering);
        this._video.play()
        this.mesh.visible = true
      }
    }, 100)
  }

  // Start loop to fetch keyframes
  startFetchLoop = () => {
    if(this.fetchLoop !== undefined)
      return console.warn("Fetch loop already inited");
    this.fetchLoop = setInterval(() => {
      if (this.meshBuffer.getBufferLength() < this.meshBuffer.getSize()) {
        console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", fetching more frames");

        // Get last keyframe and add one, then get the frame data for it
        // if keyframe is outside of range, start fetching from the front
        // TODO: Is this login on modulo correct? We could be off by one on final keyframe
        const newKeyframe = (this.lastKeyframe + 1) % this.fileHeader.frameData.length;

        console.log("New keyframe is", newKeyframe)

        // Get count of frames associated with keyframe
        const frames = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === newKeyframe && frame.keyframeNumber !== frame.frameNumber).sort((a, b) => (a.frameNumber < b.frameNumber));
        const keyframe = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === newKeyframe && frame.keyframeNumber === frame.frameNumber)[0];

        const requestStartBytePosition = keyframe.startBytePosition;
        const requestEndBytePosition = frames[frames.length - 1].startBytePosition + frames[frames.length - 1].meshLength;

        // request next keyframe + iframe byterange
        this.rangeFetcher.getRange(this.meshFilePath, requestStartBytePosition, requestEndBytePosition)
          .then(response => {
            console.log("Response length is", response.buffer.length);
            console.log("Intended length is", requestStartBytePosition - requestEndBytePosition);

            // Slice keyframe out by byte position
            const keyframeStartPosition = 0;
            const keyframeEndPosition = keyframe.meshLength;

            // Slice data from returned response and decode
            let decoder = new CortoDecoder(response.buffer.buffer.slice(keyframeStartPosition, keyframeEndPosition), null, null);
            let meshData = decoder.decode();
            let geometry = new BufferGeometry();
            geometry.setIndex(
              new (meshData.index.length > 65535
                ? Uint32BufferAttribute
                : Uint16BufferAttribute)(meshData.index, 1)
            );
            geometry.setAttribute(
              'position',
              new Float32BufferAttribute(meshData.position, 3)
            );
            geometry.setAttribute(
              'uv',
              new Float32BufferAttribute(meshData.uv, 2)
            );

            // decode corto data and create a temp buffer geometry
            const bufferObject: KeyframeBuffer = {
              frameNumber: keyframe.frameNumber,
              keyframeNumber: keyframe.keyframeNumber,
              bufferGeometry: geometry
            }

            // Check if position is in ring buffer -- if so, update it, otherwise set it
            const _pos = this.getPositionInKeyframeBuffer(keyframe.frameNumber);
            if (_pos === -1) {
              this.meshBuffer.add(bufferObject);
            }
            else {
              this.meshBuffer.get(_pos).bufferGeometry = bufferObject.bufferGeometry;
              this.meshBuffer.get(_pos).frameNumber = bufferObject.frameNumber;
              this.meshBuffer.get(_pos).keyframeNumber = bufferObject.keyframeNumber;
            }

            // For each iframe...
            for (const frameNo in frames) {
              const iframe = frames[frameNo];
              const frameStartPosition = iframe.startBytePosition - requestStartBytePosition;
              const frameEndPosition = iframe.meshLength + iframe.startBytePosition - requestStartBytePosition
              // Slice iframe out, decode into list of position vectors
              let decoder = new CortoDecoder(response.buffer.buffer.slice(frameStartPosition, frameEndPosition), null, null);
              let meshData = decoder.decode();
              console.log("Iframe meshData is", meshData);
              const positionBuffer = new Float32BufferAttribute(meshData.position, 3);
              // Check if iframe position is in ring buffer -- if so, update it, otherwise set it
              // decode corto data and create a temp buffer geometry
              const bufferObject: IFrameBuffer = {
                frameNumber: iframe.frameNumber,
                keyframeNumber: iframe.keyframeNumber,
                vertexBuffer = positionBuffer
              }

              // Check if position is in ring buffer -- if so, update it, otherwise set it
              const _pos = this.getPositionInIFrameBuffer(iframe.frameNumber);
              if (_pos === -1) {
                this.iframeVertexBuffer.add(bufferObject);
              }
              else {
                this.iframeVertexBuffer.get(_pos).vertexBuffer = bufferObject.vertexBuffer;
                this.iframeVertexBuffer.get(_pos).frameNumber = bufferObject.frameNumber;
                this.iframeVertexBuffer.get(_pos).keyframeNumber = bufferObject.keyframeNumber;
              }
            }
          });
      }
    }, 100)
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
}
