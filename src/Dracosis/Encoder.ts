'use_strict';
import glob from 'glob'
import * as fs from 'fs';
import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
// @ts-ignore
import draco3d, { createEncoderModule } from 'draco3d';
import * as THREE from 'three';
import basisu from 'basisu';

import { longToByteArray } from '../Shared/Utilities';
import { IFileHeader, IFrameData } from './Interfaces';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

import { execFile } from 'child_process';
import prependFile from 'prepend-file';

import { BasisTextureLoader } from 'three/examples/jsm/loaders/BasisTextureLoader'
import { imageSize } from 'image-size'

export default class DracoFileCreator {
    bufferSize: number;
    frameIn: number;
    frameOut: number;
    useLZ4: boolean;
    outputFileName: string;
    progressCallback: any;

    scene: THREE.Scene;
    // renderer: THREE.Renderer;

    meshFiles = [];
    textureFiles = [];
    frameData: IFrameData[] = [];

    basisLoader = new BasisTextureLoader();
    encoderModule = draco3d.createEncoderModule({});
    manager = new THREE.LoadingManager();
    loader = new OBJLoader(this.manager);
    fileReader = new FileReader();

    maxVertices = 0;
    maxTriangles = 0;

    constructor(
        scene: THREE.Scene,
        renderer: THREE.WebGLRenderer,
        meshFileSuffix: string,
        textureFileSuffix: string,
        frameIn: number,
        frameOut: number,
        useLZ4: boolean,
        outputFileName: string,
        progressCallback: any,
    ) {
        this.frameIn = frameIn;
        this.frameOut = frameOut;
        this.useLZ4 = useLZ4;
        this.frameIn = frameIn;
        this.outputFileName = outputFileName;
        this.progressCallback = progressCallback;

        this.basisLoader.detectSupport( renderer );
        this.basisLoader.setTranscoderPath( 'examples/js/libs/basis/' );

        this.manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        // Read path to OBJs and make array
        glob(__dirname + '/*.' + meshFileSuffix, {}, (err: any, files: any) => {
            if (err) console.log(err);
            this.meshFiles = files;
            console.log(files);
        })

        // Get path to jpg, png and make array
        glob(__dirname + '/*.' + textureFileSuffix, {}, (err: any, files: any) => {
            if (err) console.log(err);
            this.textureFiles = files;
            console.log(files);
        })
    }

    textureWidth: number = 0;
    textureHeight: number = 0;


    createEncodedFile(fileName: any, callback: any) {
        if (this.meshFiles.length != this.textureFiles.length)
            return console.error(`Mesh and texture sequence lengths are not the same, \
        Mesh[] is ${this.meshFiles.length}, Texture[] is ${this.textureFiles.length}`)

        console.log("Writing file to " + fileName);
        const writeStream = fs.createWriteStream(fileName);
        let currentPositionInWriteStream = 0;

        // If user specificies frame out, this it the range we process
        const frameOut = (this.frameOut > 0) ? this.frameOut : this.meshFiles.length

        // Iterate over all files and write an output file
        for (let i = this.frameIn; i < frameOut; i++) {
            let mesh;
            // load obj
            this.loader.load(this.meshFiles[i], (obj) => {
                mesh = obj;
            }, progress => {
                console.log('model ' + Math.round(progress.loaded / progress.total * 100) + '% downloaded');
            }, err => {
                console.log(err)
            });

            // If we haven't set the texture width yet, do that here automatically so we can store in the file
            if(this.textureWidth === 0){
                const dimensions = imageSize(this.textureFiles[i])
                this.textureWidth = dimensions.width;
                this.textureHeight = dimensions.height;
            }

            let encodedTexture = PNGToBasis(this.textureFiles[i]); // Takes a path, returns a buffer
            let encodedMesh = this.encodeMeshToDraco(mesh); // convert obj to draco

            // TODO: If lz4, lz4 compress and set length, otherwise length is modelLength + textureLength

            if (mesh.vertices > this.maxVertices) this.maxVertices = mesh.vertices
            if (mesh.triangles > this.maxTriangles) this.maxTriangles = mesh.triangles

            const frame: IFrameData = {
                frameNumber: i,
                startBytePosition: currentPositionInWriteStream,
                vertices: mesh.vertices,
                triangles: mesh.triangles,
                meshLength: encodedMesh.length,
                textureLength: encodedTexture.length
            }

            console.log(frame)

            // Add to the data array
            this.frameData.push(frame);

            // Write to file stream, mesh first
            writeStream.write(encodedMesh)
            console.log("Wrote " + encodedMesh.length + " bytes")

            writeStream.write(encodedTexture)
            console.log("Wrote " + encodedTexture.length + " bytes")

            // update progress callback
            currentPositionInWriteStream += encodedMesh.length + encodedTexture.length;

            // progress callback
            if (callback) callback(i - this.frameIn / frameOut - this.frameIn);
        }

        // Close file stream
        writeStream.close;

        // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
        const fileData: IFileHeader = {
            textureHeight: this.textureHeight,
            textureWidth: this.textureWidth,
            maxVertices: this.maxVertices,
            maxTriangles: this.maxTriangles,
            frameData: this.frameData
        }

        // Convert our file info into buffer and save to file stream
        let fileDataBuffer = Buffer.from(JSON.stringify(fileData), 'utf-8');

        // Write the length so we know how to read it back out into an object
        let fileDataBufferLengthEncoded = new Buffer(longToByteArray(fileDataBuffer.byteLength));

        console.log("Byte array length: " + fileDataBufferLengthEncoded.length);
        console.log("Data buffer byte length: " + fileDataBuffer.byteLength);

        // Get length of that buffer and save as 32 bit number, append to end of file
        console.log("Wrote " + this.frameData.length + " meshes and textures into file " + this.outputFileName);

        // We're going to prepend our data (and the length of that data), so combine buffers in order
        const combinedBuffer = Buffer.concat([fileDataBufferLengthEncoded, fileDataBuffer]);

        console.log("Prepending file data and how long the file data is")

        prependFile(fileName, combinedBuffer, err => {
            if (err) console.error(err);
            else console.log("Prepended data to " + fileName);
        });

        // Progress callback
        if (callback) callback(1);
    }

    encodeMeshToDraco(mesh: THREE.Geometry): any {

        const encoderModule = createEncoderModule({});
        const encoder = new encoderModule.Encoder();

        const meshBuilder = new encoderModule.MeshBuilder();
        const dracoMesh = new encoderModule.Mesh();

        const numFaces = mesh.faces.length;
        const numPoints = mesh.vertices.length;
        const numIndices = numFaces * 3;
        let indices = new Uint32Array(numIndices);

        console.log("Number of faces " + numFaces);
        console.log("Number of vertices " + numPoints);

        let vertices = new Float32Array(mesh.vertices.length * 3);
        let normals = new Float32Array(mesh.vertices.length * 3);

        // Add Faces to mesh
        for (let i = 0; i < numFaces; i++) {
            const index = i * 3;
            indices[index] = mesh.faces[i].a;
            indices[index + 1] = mesh.faces[i].b;
            indices[index + 2] = mesh.faces[i].c;
        }
        meshBuilder.AddFacesToMesh(dracoMesh, numFaces, indices);

        // Add POSITION to mesh (Vertices)
        for (let i = 0; i < mesh.vertices.length; i++) {
            const index = i * 3;
            vertices[index] = mesh.vertices[i].x;
            vertices[index + 1] = mesh.vertices[i].y;
            vertices[index + 2] = mesh.vertices[i].z;
        }
        meshBuilder.AddFloatAttributeToMesh(dracoMesh, encoderModule.POSITION, numPoints, 3, vertices);

        // Add NORMAL to mesh
        for (let face of mesh.faces) {
            normals[face["a"] * 3] = face.vertexNormals[0].x;
            normals[(face["a"] * 3) + 1] = face.vertexNormals[0].y;
            normals[(face["a"] * 3) + 2] = face.vertexNormals[0].z;

            normals[face["b"] * 3] = face.vertexNormals[1].x;
            normals[(face["b"] * 3) + 1] = face.vertexNormals[1].y;
            normals[(face["b"] * 3) + 2] = face.vertexNormals[1].z;

            normals[face["c"] * 3] = face.vertexNormals[2].x;
            normals[(face["c"] * 3) + 1] = face.vertexNormals[2].y;
            normals[(face["c"] * 3) + 2] = face.vertexNormals[2].z;
        }
        meshBuilder.AddFloatAttributeToMesh(dracoMesh, encoderModule.NORMAL, numPoints, 3, normals);

        console.log("//DRACO UNCOMPRESSED MESH STATS//////////");
        console.log("Number of faces " + dracoMesh.num_faces());
        console.log("Number of Vertices " + dracoMesh.num_points());
        console.log("Number of Attributes " + dracoMesh.num_attributes());

        // Compressing using DRACO
        let encodedData = new encoderModule.DracoInt8Array();
        encoder.SetSpeedOptions(5, 5);
        encoder.SetAttributeQuantization(encoderModule.POSITION, 10);
        encoder.SetEncodingMethod(encoderModule.MESH_EDGEBREAKER_ENCODING);

        console.log("Encoding...");
        const encodedLen = encoder.EncodeMeshToDracoBuffer(dracoMesh, encodedData);
        encoderModule.destroy(dracoMesh);

        if (encodedLen > 0) console.log("Encoded size is " + encodedLen);
        else console.log("Error: Encoding failed.");

        // Copy encoded data to buffer.
        const outputBuffer = new ArrayBuffer(encodedLen);

        encoderModule.destroy(encodedData);
        encoderModule.destroy(encoder);
        encoderModule.destroy(meshBuilder);

        console.log("DRACO ENCODED////////////////////////////");
        console.log("Length of buffer: " + outputBuffer.byteLength);

        return outputBuffer;
    }
}

function PNGToBasis(inPath): Buffer {
    const basisFilePath = inPath.replace(".png", ".basis");

    execFile(basisu.path, inPath);

    // Read file into array
    const basisData: Buffer = fs.readFileSync(basisFilePath);

    // destroy file
    fs.unlinkSync(basisFilePath);

    // Return array
    return basisData;
}
