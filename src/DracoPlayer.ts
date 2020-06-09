'use_strict';

import * as glob from 'glob'
import * as fs from 'fs';
import * as assert from 'assert';
// @ts-ignore
import draco3d from 'draco3d';

const decoderModule = draco3d.createDecoderModule({});
const encoderModule = draco3d.createEncoderModule({});

// Class draco / basis player

// Get path to file

// Read last 4 bytes for length (long)

// Read the number of bytes minus last 4 into a buffer

// Buffer to json, json to object

// Get current frame

// worker queue

// add store frame command to worker queue

// worker queue is issueing workers??

// workers save to cycling list

// Once min frames are buffered, playback can start

// during playback, if frame exists in list, pop it

// if frame doesn't exist in list, pull it directly (throw error tho)

// either way, check to see if we're holding onto old frames we skipped over (console log if we are)

// clear old frames

// issue new workers?

class DracoBasisPlayer {

    constructor(
        scene: any,
        file: string,
        onLoaded: any,
        startScale: number = 1,
        startPosition: { x: any, y: any, z: any } = { x: 0, y: 0, z: 0 },
        castShadow: boolean = true,
        playOnStart: boolean = true,
        showFirstFrameOnStart: boolean = true,
        loop: boolean = true,
        startFrame: number = 0,
        endFrame: number = -1,
        speedMultiplier: number = 1,
    ) {
        this.scene = scene;
        this.file = file;
        this.onLoaded = onLoaded;
        this.loop = loop;
        // this.loader.setDRACOLoader(this.dracoLoader);
        this.speedMultiplier = speedMultiplier

    }

    mesh: any;
    model: any;
    gltf: any;

    startFrame = 0;
    currentFrame = 0;
    endFrame = 0;
    isPlaying: boolean = false;
    frameObject: any

    scene: any;
    file: any;
    frameRate: number;
    onLoaded: any;
    loop: boolean = true

    speedMultiplier: number;

    play() {
        this.isPlaying = true;
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
        this.frameObject = this.getObjectByCurrentFrame(this.currentFrame);
    }

    setSpeed(multiplyScalar: number) {
        this.speedMultiplier = multiplyScalar;
    }

    show() {
        this.frameObject = this.getObjectByCurrentFrame(this.currentFrame);
        this.frameObject.visible = true;
    }

    hide() {
        this.hideAll()
        this.pause()
    }

    fadeIn(stepLength: number = .1, fadeTime: number, currentTime: number = 0) {
        this.play();
        const val = this.lerp(0, 1, currentTime / fadeTime);
        this.frameObject.material.opacity = val;
        if (currentTime >= fadeTime) {
            this.frameObject.material.opacity = 1;
            return;
        }

        currentTime = currentTime + stepLength * fadeTime;

        setTimeout(() => { this.fadeIn(fadeTime, currentTime); }, stepLength * fadeTime);
    }

    fadeOut(stepLength: number = .1, fadeTime: number, currentTime: number = 0) {
        const val = this.lerp(1, 0, currentTime / fadeTime);
        this.frameObject.material.opacity = val;

        currentTime = currentTime + stepLength * fadeTime;

        if (currentTime >= fadeTime) {
            this.frameObject.material.opacity = 0;
            this.pause();
            return;
        }

        setTimeout(() => { this.fadeOut(fadeTime, currentTime); }, stepLength * fadeTime);
    }

    lerp(v0: number, v1: number, t: number) {
        return v0 * (1 - t) + v1 * t
    }

    hideAll() {
        this.model.traverse((node: any) => {
            if (node.isMesh || node.isLight) {
                node.visible = false;
            }
        });
    }

    enableShadowCasting(enable: boolean) {
        this.model.traverse((node: any) => {
            if (node.isMesh || node.isLight) {
                node.castShadow = enable;
                node.visible = false;
            }
        });
    }

    update() {
        console.log("Update player happens here")
    }
    
    getObjectByCurrentFrame(index: number) {
        let name = "Frame_";
        name.concat(this.padFrameNumberWithZeros(index, 4))
        return this.scene.getObjectByName(name)
    }

    padFrameNumberWithZeros(n: any, width: number) {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
    }

}


    // Encode mesh
    // encodeMesh(this.mesh);

function decodeDracoData(rawBuffer: Buffer, decoder: any) {
    const buffer = new decoderModule.DecoderBuffer();
    buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
    const geometryType = decoder.GetEncodedGeometryType(buffer);

    let dracoGeometry;
    let status;
    if (geometryType === decoderModule.TRIANGULAR_MESH) {
        dracoGeometry = new decoderModule.Mesh();
        status = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
    } else if (geometryType === decoderModule.POINT_CLOUD) {
        dracoGeometry = new decoderModule.PointCloud();
        status = decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
    } else {
        const errorMsg = 'Error: Unknown geometry type.';
        console.error(errorMsg);
    }
    decoderModule.destroy(buffer);

    return dracoGeometry;
}

function encodeMesh(mesh: any) {
    const encoder = new encoderModule.Encoder();
    const meshBuilder = new encoderModule.MeshBuilder();
    // Create a mesh object for storing mesh data.
    const newMesh = new encoderModule.Mesh();

    const numFaces = mesh.num_faces();
    const numIndices = numFaces * 3;
    const numPoints = mesh.num_points();
    const indices = new Uint32Array(numIndices);

    console.log("Number of faces " + numFaces);
    console.log("Number of vertices " + numPoints);

    // Add Faces to mesh
    const ia = new decoderModule.DracoInt32Array();
    for (let i = 0; i < numFaces; ++i) {
        decoder.GetFaceFromMesh(mesh, i, ia);
        const index = i * 3;
        indices[index] = ia.GetValue(0);
        indices[index + 1] = ia.GetValue(1);
        indices[index + 2] = ia.GetValue(2);
    }
    decoderModule.destroy(ia);
    meshBuilder.AddFacesToMesh(newMesh, numFaces, indices);

        const meshAttributes: Map<string, number> = new Map();
        meshAttributes.set('POSITION', 3)
        meshAttributes.set('NORMAL', 3)
        meshAttributes.set('COLOR', 3)
        meshAttributes.set('TEX_COORD', 2)

        Object.keys(meshAttributes).forEach((meshAttributeKey: string) => {
        const stride = meshAttributes.get(meshAttributeKey)
        const numValues = numPoints * stride;
        const decoderAttr = decoderModule[meshAttributeKey];
        const encoderAttr = encoderModule[meshAttributeKey];
        const attrId = decoder.GetAttributeId(mesh, decoderAttr);

        if (attrId < 0) return;

        console.log("Adding %s attribute", meshAttributeKey);

        const attribute = decoder.GetAttribute(mesh, attrId);
        const attributeData = new decoderModule.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(mesh, attribute, attributeData);

        assert(numValues === attributeData.size(), 'Wrong attribute size.');

        const attributeDataArray = new Float32Array(numValues);
        for (let i = 0; i < numValues; ++i) {
            attributeDataArray[i] = attributeData.GetValue(i);
        }

        decoderModule.destroy(attributeData);
        meshBuilder.AddFloatAttributeToMesh(newMesh, encoderAttr, numPoints,
            stride, attributeDataArray);
    });

    let encodedData = new encoderModule.DracoInt8Array();
    // Set encoding options.
    encoder.SetSpeedOptions(5, 5);
    encoder.SetAttributeQuantization(encoderModule.POSITION, 10);
    encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);

    // Encoding.
    console.log("Encoding...");
    const encodedLen = encoder.EncodeMeshToDracoBuffer(newMesh,
        encodedData);
    encoderModule.destroy(newMesh);

    if (encodedLen > 0) {
        console.log("Encoded size is " + encodedLen);
    } else {
        console.log("Error: Encoding failed.");
    }
    // Copy encoded data to buffer.
    const outputBuffer = new ArrayBuffer(encodedLen);
    const outputData = new Int8Array(outputBuffer);
    for (let i = 0; i < encodedLen; ++i) {
        outputData[i] = encodedData.GetValue(i);
    }
    encoderModule.destroy(encodedData);
    encoderModule.destroy(encoder);
    encoderModule.destroy(meshBuilder);

return outputBuffer;
}