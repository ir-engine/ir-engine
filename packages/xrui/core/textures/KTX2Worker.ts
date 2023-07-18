/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
    }

    basisEncoder.setQualityLevel(data.options.qualityLevel ?? 128)
    basisEncoder.setCompressionLevel(data.options.compressionLevel ?? 2)

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
