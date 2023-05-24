// @ts-ignore

import BasisEncoderModuleSRC from './basis_encoder_low_memory/basis_encoder.js.txt'
import BasisEncoderWASMBinary from './basis_encoder_low_memory/basis_encoder.wasm'
import type { KTX2EncodeRequestData, KTX2EncodeResponseData } from './KTX2Encoder'

;(0, eval)(BasisEncoderModuleSRC)
declare const BASIS: any

const worker: Worker = self as any

worker.onmessage = async (msg: MessageEvent<KTX2EncodeRequestData>) => {
  try {
    const texture = await encodeKTX2BasisTexture(msg.data)
    const response: KTX2EncodeResponseData = { texture }
    worker.postMessage(response, [texture])
  } catch (err: any) {
    worker.postMessage({ error: err.message })
  }
}

/**
 * Loads wasm encoder module
 */
async function loadBasisEncoder() {
  // return new Promise( ( resolve ) => {

  //   BasisModule = { wasmBinary, onRuntimeInitialized: resolve };
  //   BASIS( BasisModule );

  // } ).then( () => {

  //   var { BasisFile, initializeBasis } = BasisModule;

  //   _BasisFile = BasisFile;

  //   initializeBasis();

  // } );

  // if you try to return BasisModule the browser crashes!
  const { initializeBasis, BasisFile, KTX2File, BasisEncoder } = await BASIS({ wasmBinary: BasisEncoderWASMBinary })
  initializeBasis()
  return { BasisFile, KTX2File, BasisEncoder }
}

/**
 * Encodes image to Basis Universal Supercompressed GPU Texture.
 * @param image
 * @param options
 */
async function encodeKTX2BasisTexture(data: KTX2EncodeRequestData): Promise<ArrayBuffer> {
  let basisEncoder
  try {
    const { BasisEncoder } = await loadBasisEncoder()
    const basisFileData = new Uint8Array(data.image.width * data.image.height)

    basisEncoder = new BasisEncoder()
    basisEncoder.setCreateKTX2File(true)
    basisEncoder.setDebug(false)
    basisEncoder.setComputeStats(false)

    basisEncoder.setSliceSourceImage(0, data.image.data, data.image.width, data.image.height, false)
    basisEncoder.setQualityLevel(data.options.qualityLevel ?? 128)
    basisEncoder.setCompressionLevel(data.options.compressionLevel ?? 2)
    basisEncoder.setMipGen(data.options.mipmaps ?? false)

    basisEncoder.setUASTC(data.options.uastc ?? false)
    basisEncoder.setKTX2UASTCSupercompression(data.options.uastcZstandard)
    basisEncoder.setPackUASTCFlags(data.options.uastcFlags)

    if (data.options.srgb) {
      basisEncoder.setPerceptual(true)
      basisEncoder.setMipSRGB(true)
      basisEncoder.setKTX2SRGBTransferFunc(true)
    }

    if (data.options.normalMap) {
      basisEncoder.setNormalMap()
      basisEncoder.setMipRenormalize(true)
    }

    const numOutputBytes = basisEncoder.encode(basisFileData)
    const actualKTX2FileData = basisFileData.subarray(0, numOutputBytes).buffer
    return actualKTX2FileData.slice(0, numOutputBytes)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Basis Universal Supercompressed GPU Texture encoder Error: ', error)
    throw error
  } finally {
    basisEncoder?.delete()
  }
}
