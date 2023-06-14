import BasisEncoderModuleSRC from './basis_encoder_low_memory/basis_encoder.js.txt'
// @ts-ignore
import BasisEncoderWASMBinary from './basis_encoder_low_memory/basis_encoder.wasm'
import type { KTX2EncodeRequestData, KTX2EncodeResponseData } from './KTX2Encoder'

;(0, eval)(BasisEncoderModuleSRC)
declare const BASIS: any

/**
 * Loads wasm encoder module
 */
async function loadBasisEncoder() {
  // if you try to return BasisModule the browser crashes!
  const { initializeBasis, BasisFile, KTX2File, BasisEncoder } = await BASIS({ wasmBinary: BasisEncoderWASMBinary })
  initializeBasis()
  return { BasisFile, KTX2File, BasisEncoder }
}

const BasisPromise = loadBasisEncoder()

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
 * Encodes image to Basis Universal Supercompressed GPU Texture.
 * @param image
 * @param options
 */
async function encodeKTX2BasisTexture(data: KTX2EncodeRequestData): Promise<ArrayBuffer> {
  let basisEncoder
  try {
    basisEncoder = new (await BasisPromise).BasisEncoder()
    basisEncoder.setCreateKTX2File(true)
    basisEncoder.setDebug(false)
    basisEncoder.setComputeStats(false)

    basisEncoder.setSliceSourceImage(0, data.image.data, data.image.width, data.image.height, false)

    basisEncoder.setUASTC(data.options.uastc ?? false)

    if (data.options.uastc) {
      basisEncoder.setKTX2UASTCSupercompression(data.options.uastcZstandard ?? false)
      basisEncoder.setPackUASTCFlags(data.options.uastcFlags ?? 2)
    } else {
      basisEncoder.setQualityLevel(data.options.qualityLevel ?? 128)
      basisEncoder.setCompressionLevel(data.options.compressionLevel ?? 2)
    }

    if (data.options.srgb) {
      basisEncoder.setPerceptual(true)
      basisEncoder.setMipSRGB(true)
      basisEncoder.setKTX2SRGBTransferFunc(true)
    }

    if (data.options.normalMap) {
      basisEncoder.setNormalMap()
      basisEncoder.setMipRenormalize(true)
    }

    if (data.options.yFlip) {
      basisEncoder.setYFlip(true)
    }

    basisEncoder.setMipGen(data.options.mipmaps ?? false)

    const basisFileData = new Uint8Array(data.image.width * data.image.height * 4)
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
