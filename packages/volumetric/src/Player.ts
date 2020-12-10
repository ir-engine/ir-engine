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
import Blob from 'cross-blob';

function workerFunction() {
  var self = this;
  self.onmessage = function(e) {
      console.log('Received input: ', e.data); // message received from main thread
      self.postMessage("Response back to main thread");
  }
}

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
  private currentKeyframe = 0;
  private _video = null;
  private _videoTexture = null;
  private _loop = true;
  private _isinitialized = false;
  private meshBuffer: RingBuffer<KeyframeBuffer>;
  private iframeVertexBuffer: RingBuffer<IFrameBuffer>;
  private rangeFetcher = new HttpRangeFetcher({})
  
  fileHeader: any;
  tempBufferObject: KeyframeBuffer = {
    frameNumber: 0,
    keyframeNumber: 0,
    bufferGeometry: null
  }

  manifestFilePath: any;
  fetchLoop: any;
  keyframesToBufferBeforeStart: number;

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

  constructor({
    scene,
    renderer,
    meshFilePath,
    videoFilePath,
    frameRate = 25,
    loop = true,
    autoplay = true,
    scale = 1,
    keyframesToBufferBeforeStart = 50
  }) {
    var dataObj = '(' + workerFunction + ')();'; // here is the trick to convert the above fucntion to string
    var blob = new Blob([dataObj.replace('"use strict";', '')]); // firefox adds "use strict"; to any function which might block worker execution so knock it off
    
    var blobURL = (window.URL ? URL : webkitURL).createObjectURL(blob);
    
    var worker = new Worker(blobURL); // spawn new worker
    
    worker.onmessage = function(e) {
        console.log('Worker said: ', e.data); // message received from worker
    };
    worker.postMessage("some input to worker"); // Send data to our worker.

    this.keyframesToBufferBeforeStart = keyframesToBufferBeforeStart;
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
    this.frameRate = frameRate;

    // Add video to dom and bind the upgdate handler to playback
    document.body.appendChild(this._video);
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));

    // Create a default mesh
    this.material = new MeshBasicMaterial({ map: this._videoTexture });
    this.mesh = new Mesh(new PlaneBufferGeometry(1, 1), this.material);
    this.mesh.scale.set(this._scale, this._scale, this._scale);
    this.scene.add(this.mesh);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
        this.fileHeader = JSON.parse(xhr.responseText);
        this.frameRate = this.fileHeader.frameRate;
        this._numberOfFrames = this.fileHeader.frameData.length;
      
        // Get count of frames associated with keyframe
        const numberOfIframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber !== frame.frameNumber).length;
        const numberOfKeyframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === frame.frameNumber).length;

        this.meshBuffer = new RingBuffer(numberOfKeyframes);
        this.iframeVertexBuffer = new RingBuffer(numberOfIframes);

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
    if (!this._isinitialized) return console.warn("Not inited");
    let frameToPlay = metadata.presentedFrames - 1;
    
    if (frameToPlay !== this._prevFrame) {

      let loopedFrameToPlay = Math.max(0, frameToPlay % this._numberOfFrames);

      const keyframeToPlay = this.fileHeader.frameData[loopedFrameToPlay].keyframeNumber;
      const newKeyframe = keyframeToPlay !== this.currentKeyframe;

      // console.log("Looped frame to play is", loopedFrameToPlay, "| Keyframe to play is", keyframeToPlay, "|Is new keyframe?", newKeyframe);

    if(newKeyframe){
      console.log("Is keyframe");
          // remove the keyframe mesh
          this.currentKeyframe = keyframeToPlay;
          // set new mesh to the keyframe mesh
          while (this.meshBuffer.getBufferLength() > 0 && this.meshBuffer.getFirst().keyframeNumber % this._numberOfFrames < keyframeToPlay ){
            // console.log("Removing keyframe mesh", this.meshBuffer.get(0).frameNumber);
            this.meshBuffer.remove(0);
          }
    } else {
        // leave the keyframe mesh, remove any iframe meshes below this one
        while (this.iframeVertexBuffer.getBufferLength() > 0 && this.iframeVertexBuffer.getFirst().frameNumber % this._numberOfFrames < loopedFrameToPlay )
        // console.log("Removing frames", this.iframeVertexBuffer.get(0).frameNumber);
        {
          this.iframeVertexBuffer.remove(0);
        }
    }
    
    if (this.meshBuffer.getBufferLength() > 0) { // && this.meshBuffer.getFirst().keyframeNumber == keyframeToPlay
    if(newKeyframe){
            // If keyframe changed, set mesh buffer to new keyframe
        this.mesh.geometry =  this.meshBuffer.getFirst().bufferGeometry as any;
        (this.mesh.material as any).needsUpdate = true;
 
    } else {
      if(this.iframeVertexBuffer.getBufferLength() > 0){
      const pos = this.getPositionInKeyframeBuffer(keyframeToPlay);
      if(this.meshBuffer.get(pos) !== undefined)
      this.mesh.geometry = this.meshBuffer.get(pos).bufferGeometry as any;
      else console.log("Meshbuffer at pos is undefined");
      (this.mesh.geometry as any).setAttribute(
        'position',
        this.iframeVertexBuffer.getFirst().vertexBuffer
      );
      } else {
        console.warn("Skipped iframe playback, not in buffer");
      }
    }
  } else {
    console.warn("Frame", loopedFrameToPlay, "isn't frame to play, buffer length is", this.meshBuffer.getBufferLength());
  }
      this._prevFrame = frameToPlay;
    }
    this._video.requestVideoFrameCallback(this.videoUpdateHandler.bind(this));
  }

lastRequestedKeyframe = 0;

  // Start loop to check if we're ready to play
  public play = () => {
    const buffering = setInterval(() => {
      if(this.meshBuffer.getBufferLength() >= this.keyframesToBufferBeforeStart)
      {
        console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", playing video");
        clearInterval(buffering);
        this._video.play()
        this.mesh.visible = true
      }

    }, 1000/60)

    if(this.fetchLoop !== undefined)
      return console.warn("Fetch loop already inited");
    this.fetchLoop = setInterval(() => {
      if(!this._isinitialized) return console.log("not inited");
      if (this.meshBuffer.getBufferLength() < this.meshBuffer.getSize()) {
        // console.log("Keyframe buffer length is ", this.meshBuffer.getBufferLength(), ", fetching more frames");

        // console.log("this.fileHeader.frameData.length is", this.fileHeader.frameData.length);

        // New keyframe to fetch
        let newKeyframe
        // If buffer has some keyframes, get the next keyframe from the last one in the buffer
        if(this.meshBuffer.getBufferLength() > 0){
          // Check if the last requested frame is less than the last frame in the buffer, if so set equal
          if(this.lastRequestedKeyframe < this.meshBuffer.getBufferLength()) this.lastRequestedKeyframe = this.meshBuffer.getBufferLength();
          // Now increment one more
          this.lastRequestedKeyframe++;
          // This is our new keyframe
          newKeyframe = this.lastRequestedKeyframe % this.fileHeader.frameData.length;
          // console.log("Mesh buffer length is", this.meshBuffer.getBufferLength(), "last keyframe is", this.meshBuffer.getLast().keyframeNumber, " and new keyframe is", newKeyframe);
        }
          // Otherwise get the next expected keyframe from where playback currently is
        else newKeyframe = this.currentKeyframe;
        
        // Get last keyframe and add one, then get the frame data for it
        // if keyframe is outside of range, start fetching from the front
        // TODO: Is this login on modulo correct? We could be off by one on final keyframe

        // console.log("In fileheader", this.fileHeader.frameData.filter(value => value.keyframeNumber === value.frameNumber && value.frameNumber === newKeyframe));

        const keyframe = this.fileHeader.frameData[newKeyframe];
        // Get count of frames associated with keyframe
        const iframes = this.fileHeader.frameData.filter(frame => frame.keyframeNumber === newKeyframe && frame.keyframeNumber !== frame.frameNumber).sort((a, b) => (a.frameNumber < b.frameNumber));

        const requestStartBytePosition = keyframe.startBytePosition;

        const requestEndBytePosition = iframes.length > 0 ?
          iframes[iframes.length - 1].startBytePosition + iframes[iframes.length - 1].meshLength
          : keyframe.startBytePosition + keyframe.meshLength;
          
        // request next keyframe + iframe byterange
        this.rangeFetcher.getRange(this.meshFilePath, requestStartBytePosition, requestEndBytePosition - requestStartBytePosition)
          .then(response => {

            // Slice keyframe out by byte position
            const keyframeStartPosition = 0;
            const keyframeEndPosition = keyframe.meshLength;

            // Slice data from returned response and decode
            let decoder = new CortoDecoder(response.buffer.buffer.slice(keyframeStartPosition, keyframeEndPosition), null, null);
            let meshData = decoder.decode();
            let geometry = new BufferGeometry();
            geometry.setIndex(
              new Uint32BufferAttribute(meshData.index, 1)
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
            for (const frameNo in iframes) {
              const iframe = iframes[frameNo];
              const frameStartPosition = iframe.startBytePosition - requestStartBytePosition;
              const frameEndPosition = iframe.meshLength + iframe.startBytePosition - requestStartBytePosition
              // Slice iframe out, decode into list of position vectors
              let decoder = new CortoDecoder(response.buffer.buffer.slice(frameStartPosition, frameEndPosition), null, null);
              let meshData = decoder.decode();
              console.log("Iframe meshData is", meshData);
              // Check if iframe position is in ring buffer -- if so, update it, otherwise set it
              // decode corto data and create a temp buffer geometry
              const bufferObject: IFrameBuffer = {
                frameNumber: iframe.frameNumber,
                keyframeNumber: iframe.keyframeNumber,
                vertexBuffer: new Float32BufferAttribute(meshData.position, 3)
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
    }, 1000/60)
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
