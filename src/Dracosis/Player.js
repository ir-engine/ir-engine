"use_strict";
import * as draco3d from "draco3d";
import { lerp } from "../Shared/Utilities";
import RingBuffer from "./RingBuffer";
import { BufferGeometry, CompressedTexture, BoxBufferGeometry, MeshBasicMaterial, Mesh } from "three";
import { BasisTextureLoader } from "three/examples/jsm/loaders/BasisTextureLoader.js";
import { MessageType } from "./Enums";
import TestWorker from "./TestWorker";
const worker = new TestWorker();
// const worker = new Worker("./Worker");
// Class draco / basis player
export default class DracosisPlayer {
    constructor(scene, filePath, onLoaded, playOnStart = true, loop = true, startFrame = 0, endFrame = -1, speedMultiplier = 1, bufferSize = 100) {
        // Public Fields
        this.frameRate = 30;
        this.speed = 1.0; // Multiplied by framerate for final playback output rate
        // Private Fields
        this._startFrame = 0;
        this._endFrame = 0;
        this._numberOfFrames = 0;
        this._currentFrame = 0;
        this._loop = true;
        this._playOnStart = true;
        this._isinitialized = false;
        this._dataBufferSize = 100;
        this._isPlaying = false;
        this._readStreamOffset = 0;
        this._decoderModule = draco3d.createDecoderModule({});
        this._encoderModule = draco3d.createEncoderModule({});
        this._basisTextureLoader = new BasisTextureLoader();
        this._nullBufferGeometry = new BufferGeometry();
        this._nullCompressedTexture = new CompressedTexture([new ImageData(200, 200)], 0, 0);
        // Temp variables -- reused in loops, etc (beware of initialized value!)
        this._pos = 0;
        this._frameNumber = 0;
        this._framesUpdated = 0; // TODO: Remove after debug
        this._numberOfBuffersRemoved = 0; // TODO: Remove after debug
        this.scene = scene;
        this._filePath = filePath;
        this._onLoaded = onLoaded;
        this._loop = loop;
        this.speed = speedMultiplier;
        this._startFrame = startFrame;
        this._playOnStart = playOnStart;
        this._currentFrame = startFrame;
        const player = this;
        this.bufferGeometry = new BoxBufferGeometry(1, 1, 1);
        this.material = new MeshBasicMaterial({ color: 0xffff00 });
        this.mesh = new Mesh(this.bufferGeometry, this.material);
        scene.add(this.mesh);
        this.httpGetAsync("http://localhost:8000/dracosis", function (data) {
            data = JSON.parse(data);
            if (endFrame > 1) {
                player._endFrame = endFrame;
            }
            else {
                player._endFrame = data.fileHeader.frameData.length;
            }
            player._numberOfFrames = player._endFrame - player._startFrame;
            // init buffers with settings
            player._ringBuffer = new RingBuffer(bufferSize);
            const initializeMessage = {
                startFrame: player._startFrame,
                endFrame: player._endFrame,
                type: MessageType.InitializationResponse,
                // type: MessageType.DataResponse,
                data: data,
                loop: player._loop,
                filePath: data.filePath,
                fileHeader: data.fileHeader,
                isInitialized: true,
                readStreamOffset: data.readStreamOffset
            };
            // console.log("initializeMessage", initializeMessage);
            // worker.postMessage(initializeMessage);
            // const worker = new Worker();
            worker.postMessage("Hello World");
            // // Add event handler for manging worker responses
            // worker.addEventListener('message', ({ data }) => {
            //   console.log('hi worker recieved message');
            //   player.handleMessage(data);
            // });
        });
        // Validate file exists, throw error if it doesn't
        // if (!fs.existsSync(filePath)) {
        //   console.error('File not found at ' + filePath);
        //   return;
        // }
        // Open the file
        // fs.open(filePath, 'r', (err, fd) => {
        //   if (err) return console.log(err.message);
        //   // Read first 8 bytes for header length (long)
        //   let buffer = Buffer.alloc(8);
        //   fs.readSync(fd, buffer, 0, 8, 0);
        //   const fileHeaderLength = byteArrayToLong(buffer);
        //   // Read the header bytes (skip the header length, first 8 bytes)
        //   buffer = Buffer.alloc(fileHeaderLength);
        //   fs.readSync(fd, buffer, 0, fileHeaderLength, 8); // Skip 8 bytes for the header length val
        //   // Buffer to json, json to object
        //   this._fileHeader = JSON.parse(buffer.toString('utf8'));
        //   console.log('Parsed to json: ', this._fileHeader);
        //   this._readStreamOffset = fileHeaderLength + 8;
        //   // Get current frame
        //   this._currentFrame = startFrame;
        //   // If the end frame was supplied, use it, otherwise determine from length
        //   if (endFrame > 1) {
        //     this._endFrame = endFrame;
        //   } else {
        //     this._endFrame = this._fileHeader.frameData.length;
        //   }
        //   this._numberOfFrames = this._endFrame - this._startFrame;
        //   // Create Threejs object, right now it starts as a cube
        //   this.bufferGeometry = new BoxBufferGeometry(1, 1, 1);
        //   this.material = new MeshBasicMaterial({ color: 0xffff00 });
        //   this.mesh = new Mesh(this.bufferGeometry, this.material);
        //   scene.add(this.mesh);
        //   // init buffers with settings
        //   this._ringBuffer = new RingBuffer<IBufferGeometryCompressedTexture>(
        //     bufferSize
        //   );
        //   // Send init data to worker
        //   const initializeMessage: WorkerInitializationRequest = {
        //     startFrame,
        //     endFrame,
        //     type: MessageType.InitializationResponse,
        //     loop,
        //     filePath,
        //     fileHeader: this._fileHeader,
        //     readStreamOffset: this._readStreamOffset,
        //   };
        //   worker.postMessage(initializeMessage);
        //   // Add event handler for manging worker responses
        //   worker.addEventListener('message', ({ data }) => {
        //     this.handleMessage(data);
        //   });
        // });
    }
    // public getters and settings
    get currentFrame() {
        return this._currentFrame;
    }
    get startFrame() {
        return this._startFrame;
    }
    set startFrame(value) {
        this._startFrame = value;
        this._numberOfFrames = this._endFrame - this._startFrame;
        worker.postMessage({
            type: MessageType.SetEndFrameRequest,
            value
        });
    }
    get endFrame() {
        return this._endFrame;
    }
    set endFrame(value) {
        this._endFrame = value;
        this._numberOfFrames = this._endFrame - this._startFrame;
        worker.postMessage({
            type: MessageType.SetEndFrameRequest,
            value
        });
    }
    get loop() {
        return this._loop;
    }
    set loop(value) {
        this._loop = value;
        worker.postMessage({ type: MessageType.SetLoopRequest, value });
    }
    httpGetAsync(theUrl, callback) {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open("GET", theUrl, true); // true for asynchronous
        xmlHttp.send(null);
    }
    handleMessage(data) {
        switch (data.type) {
            case MessageType.InitializationResponse:
                this.handleInitializationResponse(data);
                break;
            case MessageType.DataResponse: {
                this.handleDataResponse(data);
                break;
            }
        }
    }
    handleInitializationResponse(data) {
        if (data.isInitialized) {
            this._isinitialized = true;
            this.handleBuffers();
            if (this._playOnStart)
                this.play();
            console.log("Received initialization response from worker");
        }
        else
            console.error("Initialization failed");
    }
    handleDataResponse(data) {
        // For each object in the array...
        data.forEach(geomTex => {
            this._frameNumber = geomTex.frameNumber;
            // Find the frame in our circular buffer
            this._pos = this.getPositionInBuffer(this._frameNumber);
            // Set the mesh and texture buffers
            this._ringBuffer.get(this._frameNumber).bufferGeometry = geomTex.bufferGeometry;
            this._ringBuffer.get(this._frameNumber).compressedTexture = geomTex.compressedTexture;
            this._framesUpdated++;
        });
        console.log("Updated mesh and texture data on " + this._framesUpdated + " frames");
    }
    getPositionInBuffer(frameNumber) {
        // Search backwards, which should make the for loop shorter on longer buffer
        for (let i = this._ringBuffer.getPos(); i > 0; i--)
            if ((frameNumber = this._ringBuffer.get(i).frameNumber))
                return i;
        return -1;
    }
    handleBuffers() {
        // If not initialized, skip.
        if (!this._isinitialized)
            return setTimeout(this.handleBuffers, 100);
        // Clear the buffers
        while (true) {
            // Peek the current frame. if it's frame number is below current frame, trash it
            if (this._ringBuffer.getFirst().frameNumber >= this._currentFrame)
                break;
            // if it's equal to or greater than current frame, break the loop
            this._ringBuffer.remove(0);
            this._numberOfBuffersRemoved++;
        }
        if (this._numberOfBuffersRemoved > 0)
            console.warn("Removed " + this._numberOfBuffersRemoved + " since they were skipped in playback");
        const framesToFetch = [];
        // Fill buffers with new data
        while (!this._ringBuffer.full()) {
            // Increment onto the last frame
            const lastFrame = this._ringBuffer.getLast().frameNumber;
            const nextFrame = (lastFrame + 1) % this._numberOfFrames;
            const frameData = {
                frameNumber: nextFrame,
                bufferGeometry: this._nullBufferGeometry,
                compressedTexture: this._nullCompressedTexture
            };
            framesToFetch.push(nextFrame);
            this._ringBuffer.add(frameData);
        }
        const fetchFramesMessage = {
            type: MessageType.DataRequest,
            framesToFetch
        };
        if (framesToFetch.length > 0)
            worker.postMessage(fetchFramesMessage);
        // Every 1/4 second, make sure our workers are working
        setTimeout(this.handleBuffers, 100);
    }
    update() {
        console.log("Player update called, current frame is + " + this._currentFrame);
        // If playback is paused, stop updating
        if (!this._isPlaying)
            return;
        // If we aren't initialized yet, skip logic but come back next frame
        if (!this._isinitialized)
            return setTimeout(this.update, (1.0 / this.frameRate) * this.speed);
        // Advance to next frame
        this._currentFrame++;
        // Loop logic
        if (this._currentFrame >= this._endFrame) {
            if (this._loop)
                this._currentFrame = this._startFrame;
            else {
                this._isPlaying = false;
                return;
            }
        }
        // If the frame exists in the ring buffer, use it
        if (this._ringBuffer.getFirst().frameNumber == this._currentFrame) {
            // read buffer into current buffer geometry
            this.bufferGeometry = this._ringBuffer.getFirst().bufferGeometry;
            // read buffer into current texture
            this.compressedTexture = this._ringBuffer.getFirst().compressedTexture;
            // Remove buffer
            this._ringBuffer.remove(0);
            console.log("Recalled the frame " + this._ringBuffer.getFirst().frameNumber);
        }
        else {
            // Frame doesn't exist in ring buffer, so throw an error
            console.warn("Frame " + this._ringBuffer.getFirst().frameNumber + " did not exist in ring buffer");
        }
        // Advance current buffer
        setTimeout(this.update, (1.0 / this.frameRate) * this.speed);
    }
    play() {
        this._isPlaying = true;
        this.show();
        this.update();
    }
    pause() {
        this._isPlaying = false;
    }
    reset() {
        this._currentFrame = this._startFrame;
    }
    goToFrame(frame, play) {
        this._currentFrame = frame;
        this.handleBuffers();
        if (play)
            this.play();
    }
    setSpeed(multiplyScalar) {
        this.speed = multiplyScalar;
    }
    show() {
        this.mesh.visible = true;
    }
    hide() {
        this.mesh.visible = false;
        this.pause();
    }
    fadeIn(stepLength = 0.1, fadeTime, currentTime = 0) {
        if (!this._isPlaying)
            this.play();
        this.material.opacity = lerp(0, 1, currentTime / fadeTime);
        currentTime = currentTime + stepLength * fadeTime;
        if (currentTime >= fadeTime) {
            this.material.opacity = 1;
            return;
        }
        setTimeout(() => {
            this.fadeIn(fadeTime, currentTime);
        }, stepLength * fadeTime);
    }
    fadeOut(stepLength = 0.1, fadeTime, currentTime = 0) {
        this.material.opacity = lerp(1, 0, currentTime / fadeTime);
        currentTime = currentTime + stepLength * fadeTime;
        if (currentTime >= fadeTime) {
            this.material.opacity = 0;
            this.pause();
            return;
        }
        setTimeout(() => {
            this.fadeOut(fadeTime, currentTime);
        }, stepLength * fadeTime);
    }
}
