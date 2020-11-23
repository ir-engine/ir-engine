// "use_strict"
// // import * as glob from "glob"
// import * as fs from "browserify-fs"
// import { Geometry, Mesh, LoadingManager, WebGLRenderer } from "three"
// import { BasisTextureLoader } from "three/examples/jsm/loaders/BasisTextureLoader"
// import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"

// import * as prependFile from "prepend-file"
// import * as imageSize from "image-size"
// import { PNGToBasis, encodeMeshToDraco } from "./CodecHelpers"
// import { longToByteArray } from "../Shared/Utilities"
// import { IFileHeader, IFrameData } from "./Interfaces"

// export default class DracoFileCreator {
//   private _frameIn: number
//   private _frameOut: number
//   private _outputFileName: string

//   private _meshFiles: string[] = []
//   private _textureFiles: string[] = []
//   private _frameData: IFrameData[] = []
//   private _maxVertices = 0
//   private _maxFaces = 0

//   private _basisLoader = new BasisTextureLoader()
//   private _manager = new LoadingManager()
//   private _loader = new OBJLoader(this._manager)

//   constructor(
//     renderer: WebGLRenderer,
//     meshFileSuffix: string,
//     textureFileSuffix: string,
//     frameIn: number,
//     frameOut: number,
//     outputFileName: string,
//     progressCallback: any
//   ) {
//     // this._frameIn = frameIn
//     // this._frameOut = frameOut
//     // this._frameIn = frameIn
//     // this._outputFileName = outputFileName

//     // this._basisLoader.detectSupport(renderer)
//     // this._basisLoader.setTranscoderPath("examples/js/libs/basis/")

//     // this._manager.onProgress = function(item, loaded, total) {
//     //   console.log(item, loaded, total)
//     //   if (progressCallback) progressCallback(item, loaded, total)
//     // }

//     // Read path to OBJs and make array
//     // glob.glob(__dirname + "/*." + meshFileSuffix, {}, (err: any, files: any) => {
//     //   if (err) console.log(err)
//     //   this._meshFiles = files
//     //   console.log(files)
//     // })

//     // // Get path to jpg, png and make array
//     // glob.glob(__dirname + "/*." + textureFileSuffix, {}, (err: any, files: any) => {
//     //   if (err) console.log(err)
//     //   this._textureFiles = files
//     //   console.log(files)
//     // })
//   }

//   textureWidth = 0
//   textureHeight = 0

//   mesh = new Mesh()
//   geometry = new Geometry()
//   createEncodedFile(fileName: any, callback: any) {
//     if (this._meshFiles.length != this._textureFiles.length)
//       return console.error(`Mesh and texture sequence lengths are not the same, \
//         Mesh[] is ${this._meshFiles.length}, Texture[] is ${this._textureFiles.length}`)

//     console.log("Writing file to " + fileName)
//     const writeStream = fs.createWriteStream(fileName)
//     let currentPositionInWriteStream = 0

//     // If user specificies frame out, this it the range we process
//     const frameOut = this._frameOut > 0 ? this._frameOut : this._meshFiles.length

//     // Iterate over all files and write an output file
//     for (let i = this._frameIn; i < frameOut; i++) {
//       // load obj
//       this._loader.load(
//         this._meshFiles[i],
//         obj => {
//           // Search for mesh object
//           obj.traverse(child => {
//             if (child instanceof Mesh) {
//               this.mesh = child
//               this.geometry = child.geometry
//               if (child.geometry.vertices > this._maxVertices) this._maxVertices = child.geometry.vertices
//               if (child.geometry.faces > this._maxFaces) this._maxFaces = child.geometry.faces
//               return // Only get the first mesh in the obj
//             }
//           })
//         },
//         progress => {
//           console.log("model " + Math.round((progress.loaded / progress.total) * 100) + "% downloaded")
//         },
//         err => {
//           console.log(err)
//         }
//       )
//       // If we haven't set the texture width yet, do that here automatically so we can store in the file
//       if (this.textureWidth === 0) {
//         const dimensions = imageSize.imageSize(this._textureFiles[i])
//         this.textureWidth = dimensions.width
//         this.textureHeight = dimensions.height
//       }

//       const encodedTexture = PNGToBasis(this._textureFiles[i]) // Takes a path, returns a buffer
//       const encodedMesh = encodeMeshToDraco(this.mesh.geometry as Geometry) // convert obj to draco

//       const frame: IFrameData = {
//         frameNumber: i,
//         startBytePosition: currentPositionInWriteStream,
//         vertices: this.geometry.vertices.length,
//         faces: this.geometry.faces.length,
//         meshLength: encodedMesh.length,
//         textureLength: encodedTexture.length
//       }

//       console.log(frame)

//       // Add to the data array
//       this._frameData.push(frame)

//       // Write to file stream, mesh first
//       writeStream.write(encodedMesh)
//       console.log("Wrote " + encodedMesh.length + " bytes")

//       writeStream.write(encodedTexture)
//       console.log("Wrote " + encodedTexture.length + " bytes")

//       // update progress callback
//       currentPositionInWriteStream += encodedMesh.length + encodedTexture.length

//       // progress callback
//       if (callback) callback(i - this._frameIn / frameOut - this._frameIn)
//     }

//     // Close file stream
//     writeStream.close

//     // create object with maxVertices, textureWidth and textureHeight, then pack frames {} in
//     const fileData: IFileHeader = {
//       textureHeight: this.textureHeight,
//       textureWidth: this.textureWidth,
//       maxVertices: this._maxVertices,
//       maxTriangles: this._maxFaces,
//       frameData: this._frameData
//     }

//     // Convert our file info into buffer and save to file stream
//     const fileDataBuffer = Buffer.from(JSON.stringify(fileData), "utf-8")

//     // Write the length so we know how to read it back out into an object
//     const fileDataBufferLengthEncoded = new Buffer(longToByteArray(fileDataBuffer.byteLength))

//     console.log("Byte array length: " + fileDataBufferLengthEncoded.length)
//     console.log("Data buffer byte length: " + fileDataBuffer.byteLength)

//     // Get length of that buffer and save as 32 bit number, append to end of file
//     console.log("Wrote " + this._frameData.length + " meshes and textures into file " + this._outputFileName)

//     // We're going to prepend our data (and the length of that data), so combine buffers in order
//     const combinedBuffer = Buffer.concat([fileDataBufferLengthEncoded, fileDataBuffer])

//     console.log("Prepending file data and how long the file data is")

//     prependFile.prependFile(fileName, combinedBuffer, (err: any) => {
//       if (err) console.error(err)
//       else console.log("Prepended data to " + fileName)
//     })

//     // Progress callback
//     if (callback) callback(1)
//   }
// }
