import { IFileHeader, IBufferGeometryCompressedTexture, WorkerFetchAction, WorkerInitAction } from './Interfaces'
import { createReadStream, ReadStream } from 'fs';
import { RingBuffer } from 'ring-buffer-ts';

self.addEventListener('message', ({ data }) => {
    switch (data.action) {
        case 'initialize':
            initialize(data)
            break;
        case 'fetch':
            fetch(data);
            break;
        default:
            console.error(data.action + " was not understood by the worker");
    }
})

let fileHeader: IFileHeader;
let filePath: string;
let fileReadStream: ReadStream;
let isInitialized: boolean = false;
const bufferSize: number = 100;
const ringBuffer = new RingBuffer<IBufferGeometryCompressedTexture>(bufferSize);
let tempBufferObject: IBufferGeometryCompressedTexture;

function initialize(data: WorkerInitAction): void {
    if(isInitialized)
        return console.error("Worker has already been initialized for file " + data.filePath);

    fileHeader = data.fileHeader;
    filePath = data.filePath;

    // Create readstream starting from after the file header and long
    fileReadStream = createReadStream(filePath, { start: data.readStreamOffset });

    postMessage({type: 'isInitialized'}, "*");
}

// TODO: Finish
function fetch(data: WorkerFetchAction): void {
    // Clear Ring Buffer

    // Make a list of buffers to transfer
    let transferableBuffers: Buffer[] = []
    // Sort the frames from low to high, might not be necessary
    // Iterate over values...
    //  If this frame > end frame...
        // If loop is on, modulo and pull the frames
        // Otherwise, don't add the frame and throw a warning that invalid frame requested
    // If this frame = last frame + 1 (and isn't first in array), tell the stream reader to read out the next bytes..
    // Otherwise, seek to it and read it
    // Set temp buffer object frame number
    // Then mesh
    // Then texture
    // Add it to the ring buffer
    // Add buffers to transferableBuffers
    // Post message
    postMessage( ringBuffer.toArray(), '*', transferableBuffers);
}

// TODO: Finish
function getBufferGeometryFromFile(frameNumber: number): BufferGeometry {
    // Get the byte position in the file for read start, add the geometry size to get the frame end
    // return the read as a buffered geometry
}

// TODO: Finish
function getCompressedTextureFromFile(frameNumber: number): CompressedTexture {
    // Get the frame from frame data header
    // Get the byte position of the file and add geometry to calculate start, file + geometry + texture size to calculate end
    // return the read as a compressed texture
}