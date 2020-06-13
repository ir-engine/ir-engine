'use_strict';
import * as fs from 'fs';
// @ts-ignore
import draco3d from 'draco3d';
import { byteArrayToLong, padFrameNumberWithZeros, lerp } from '../Shared/Utilities';
import { IFileHeader, IBufferGeometryCompressedTexture, WorkerFetchAction, WorkerInitAction } from './Interfaces';
import { RingBuffer } from 'ring-buffer-ts';
import { BufferGeometry, CompressedTexture, CompressedPixelFormat, BoxBufferGeometry, MeshBasicMaterial, Mesh } from 'three';
import { BasisTextureLoader } from './libs/BasisTextureLoader';
import { ReadStream } from 'fs';

const worker = new Worker('./Worker')

// Class draco / basis player
export default class DracosisPlayer {
    scene: THREE.Scene
    filePath: string
    onLoaded: any
    loop: boolean = true
    speedMultiplier: number = 1.0
    scaleMultiplier: number = 1.0;
    startFrame = 0;
    currentFrame = 0;
    endFrame = 0;
    frameObject: THREE.Object3D;
    file: any;
    frameRate: number = 30;
    isPlaying: boolean = false;
    isinitialized: boolean = false;
    // Mesh / texture buffer
    ringBuffer: RingBuffer<IBufferGeometryCompressedTexture>;
    dataBufferSize: number = 100;

    geometry: THREE.BufferGeometry; // 
    material: THREE.MeshBasicMaterial;
    mesh: any;
    model: any;
    gltf: any;

    textureWidth: number = 0;
    textureHeight: number = 0;
    numberOfFrames: number = 0;
    fileReadStream: ReadStream

    decoderModule = draco3d.createDecoderModule({});
    encoderModule = draco3d.createEncoderModule({});
    basisTextureLoader = new BasisTextureLoader();

    nullBuffer = new Buffer(0);
    nullBufferGeometry = new BufferGeometry();
    nullCompressedTexture = new CompressedTexture([new ImageData(0, 0)], 0, 0);

    constructor(
        scene: any,
        filePath: string,
        onLoaded: any,
        startScale: number = 1,
        castShadow: boolean = true,
        playOnStart: boolean = true,
        showFirstFrameOnStart: boolean = true,
        loop: boolean = true,
        startFrame: number = 0,
        endFrame: number = -1,
        speedMultiplier: number = 1,
        bufferSize: number = 100
    ) {
        this.scene = scene;
        this.filePath = filePath;
        this.onLoaded = onLoaded;
        this.loop = loop;
        this.speedMultiplier = speedMultiplier;
        this.startFrame = startFrame;
        this.scaleMultiplier = startScale;

        // Validate file exists, throw error if it doesn't
        if (!fs.existsSync(filePath)) {
            console.error("File not found at " + filePath);
            return;
        }

        // Open the file
        fs.open(filePath, 'r', (err, fd) => {
            if (err) return console.log(err.message);

            // Read first 8 bytes for header length (long)
            let buffer = Buffer.alloc(8);
            fs.readSync(fd, buffer, 0, 8, 0);
            const fileHeaderLength = byteArrayToLong(buffer);

            // Read the header bytes (skip the header length, first 8 bytes)
            buffer = Buffer.alloc(fileHeaderLength);
            fs.readSync(fd, buffer, 0, fileHeaderLength, 8); // Skip 8 bytes for the header length val

            // Buffer to json, json to object
            let fileHeader: IFileHeader = JSON.parse(buffer.toString('utf8'));
            console.log('Parsed to json: ', fileHeader);

            // Get current frame
            this.currentFrame = startFrame;

            // If the end frame was supplied, use it, otherwise determine from length
            if (endFrame > 1) {
                this.endFrame = endFrame;
            } else {
                this.endFrame = fileHeader.frameData.length;
            }

            this.numberOfFrames = this.endFrame - this.startFrame;

            // Create Threejs object, right now it starts as a cube
            this.geometry = new BoxBufferGeometry( 1, 1, 1 );
            this.material = new MeshBasicMaterial( { color: 0xffff00 } );
            this.mesh = new Mesh( this.geometry, this.material );
            scene.add( this.mesh );

            // init buffers with settings
            this.ringBuffer = new RingBuffer<IBufferGeometryCompressedTexture>(bufferSize);

            const initializeMessage: WorkerInitAction = {
                startFrame: this.startFrame,
                endFrame: this.endFrame,
                type: 'initialize',
                filePath,
                fileHeader,
                readStreamOffset: fileHeaderLength + 8,
            }
            
            worker.postMessage(initializeMessage);

            worker.addEventListener('message', ({ data }) => {
                if(data.type === 'isInitialized'){
                    console.log("Received initialization response from worker");
                } else {
                    this.handleNewDataFromWorker(data);
                }
            })
        });
    }

    // TODO: Finish
    handleNewDataFromWorker(data: IBufferGeometryCompressedTexture[]){
        // For each object in the array...
        // Get the frame number
        // Find the frame in our circular buffer
        // Set the mesh and texture buffers
    }

    handleBuffers() {
        // Clear the buffers
        let numberOfBuffersRemoved = 0; // TODO: Remove after debug
        while (true) {
            // Peek the current frame. if it's frame number is below current frame, trash it
            if(this.ringBuffer.getFirst().frameNumber >= this.currentFrame)
                break;
            
            // if it's equal to or greater than current frame, break the loop
            this.ringBuffer.removeFirst();
            numberOfBuffersRemoved++;
        }
        if(numberOfBuffersRemoved > 0) console.warn("Removed " + numberOfBuffersRemoved + " since they were skipped in playback");

        let framesToFetch: number[] = []

        // Fill buffers with new data
        while(!this.ringBuffer.isFull()) {
            // Increment onto the last frame
            const lastFrame = this.ringBuffer.getLast().frameNumber;
            const nextFrame = (lastFrame+1) % this.numberOfFrames;
            const frameData: IBufferGeometryCompressedTexture = {
                frameNumber: nextFrame,
                bufferGeometry: this.nullBufferGeometry,
                compressedTexture: this.nullCompressedTexture
            }
            framesToFetch.push(nextFrame);
            this.ringBuffer.add(frameData);
        }

        const fetchFramesMessage: WorkerFetchAction = {
            type: 'fetch',
            framesToFetch
        }

        if(framesToFetch.length > 0)
            worker.postMessage(fetchFramesMessage);

        // Every 1/4 second, make sure our workers are working
        setTimeout(this.handleBuffers, 100);
    }

    // TODO: Finish
    update() {
        console.log("Update player happens here")

        // If playback is paused, stop updating
        if (!this.isPlaying) return;

        // Advance to next frame
        this.currentFrame++;

        // Loop logic
        if (this.currentFrame >= this.endFrame) {
            if (this.loop) this.currentFrame = this.startFrame;
            else {
                this.isPlaying = false;
                return;
            }
        }

        // If the frame exists in the ring buffer, use it
        if (this.ringBuffer.getFirst().frameNumber) {

        } else {
            // Frame doesn't exist in ring buffer, so we'll need to pull it on the main thread
            // This is not ideal, and kills our framerate, so log a warning

        }

        // Advance current buffer
        setTimeout(this.update, (1.0 / this.frameRate) * this.speedMultiplier);
    }

    play() {
        this.isPlaying = true;
        this.show();
        this.update();
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.currentFrame = this.startFrame;
    }

    goToFrame(frame: number) {
        this.currentFrame = frame;
        console.error("Not implemented");
    }

    setSpeed(multiplyScalar: number) {
        this.speedMultiplier = multiplyScalar;
    }

    show() {
        this.mesh.visible = true;
    }

    hide() {
        this.mesh.visible = false;
        this.pause()
    }

    fadeIn(stepLength: number = .1, fadeTime: number, currentTime: number = 0) {
        if(!this.isPlaying) this.play();
        this.material.opacity = lerp(0, 1, currentTime / fadeTime);
        currentTime = currentTime + stepLength * fadeTime;
        if (currentTime >= fadeTime) {
            this.material.opacity = 1;
            return;
        }

        setTimeout(() => { this.fadeIn(fadeTime, currentTime); }, stepLength * fadeTime);
    }

    fadeOut(stepLength: number = .1, fadeTime: number, currentTime: number = 0) {
        this.material.opacity = lerp(1, 0, currentTime / fadeTime);
        currentTime = currentTime + stepLength * fadeTime;
        if (currentTime >= fadeTime) {
            this.material.opacity = 0;
            this.pause();
            return;
        }

        setTimeout(() => { this.fadeOut(fadeTime, currentTime); }, stepLength * fadeTime);
    }
}
