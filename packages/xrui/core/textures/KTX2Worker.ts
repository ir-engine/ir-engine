import type { ImageDataType } from '@loaders.gl/images'

import BasisEncoderModuleSRC from './basis_encoder_low_memory/basis_encoder.js.txt'
// @ts-ignore
import BasisEncoderWASMBinary from './basis_encoder_low_memory/basis_encoder.wasm'
import type { EncodeResponse } from './KTX2Encoder'

;(0, eval)(BasisEncoderModuleSRC)
declare const BASIS: any

const worker: Worker = self as any

worker.onmessage = async (msg: MessageEvent<ImageDataType>) => {
  try {
    const texture = await encodeKTX2BasisTexture(msg.data, {
      useSRGB: true,
      encodeUASTC: true,
      mipmaps: true
    })
    const response: EncodeResponse = { texture }
    worker.postMessage(response, [texture])
  } catch (err: any) {
    worker.postMessage({ error: err.message })
  }
}

/**
 * Loads wasm encoder module
 * @param options
 * @returns {BasisFile, KTX2File} promise
 */
async function loadBasisEncoder(options: any) {
  options.wasmBinary = BasisEncoderWASMBinary
  // if you try to return BasisModule the browser crashes!
  const { initializeBasis, BasisFile, KTX2File, BasisEncoder } = await BASIS(options)
  initializeBasis()
  return { BasisFile, KTX2File, BasisEncoder }
}

/**
 * Encodes image to Basis Universal Supercompressed GPU Texture.
 * @param image
 * @param options
 */
async function encodeKTX2BasisTexture(
  image: ImageDataType,
  options: { useSRGB?: boolean; qualityLevel?: number; encodeUASTC?: boolean; mipmaps?: boolean } = {}
): Promise<ArrayBuffer> {
  const { useSRGB = false, qualityLevel = 10, encodeUASTC = false, mipmaps = false } = options

  let basisEncoder
  try {
    const { BasisEncoder } = await loadBasisEncoder(options)
    basisEncoder = new BasisEncoder()
    const basisFileData = new Uint8Array(image.width * image.height * 4)
    basisEncoder.setCreateKTX2File(true)
    basisEncoder.setKTX2UASTCSupercompression(true)
    basisEncoder.setKTX2SRGBTransferFunc(true)

    basisEncoder.setSliceSourceImage(0, image.data, image.width, image.height, false)
    basisEncoder.setPerceptual(useSRGB)
    basisEncoder.setMipSRGB(useSRGB)
    basisEncoder.setQualityLevel(qualityLevel)
    basisEncoder.setUASTC(encodeUASTC)
    basisEncoder.setMipGen(mipmaps)

    const numOutputBytes = basisEncoder.encode(basisFileData)

    const actualKTX2FileData = basisFileData.subarray(0, numOutputBytes).buffer
    return actualKTX2FileData
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Basis Universal Supercompressed GPU Texture encoder Error: ', error)
    throw error
  } finally {
    basisEncoder?.delete()
  }
}
