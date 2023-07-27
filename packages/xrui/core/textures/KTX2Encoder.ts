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

import { createWorkerFromCrossOriginURL } from '@etherealengine/common/src/utils/createWorkerFromCrossOriginURL'

import { WorkerPool } from '../WorkerPool'

// @ts-ignore
const workerPath = new URL('./KTX2Worker.bundle.js', import.meta.url).href

export enum UASTCFlags {
  /** Fastest is the lowest quality, although it's stil substantially higher quality vs. BC1/ETC1. It supports 5 modes.
    /* The output may be somewhat blocky because this setting doesn't support 2/3-subset UASTC modes, but it should be less blocky vs. BC1/ETC1.
    /* This setting doesn't write BC1 hints, so BC1 transcoding will be slower. 
    /* Transcoded ETC1 quality will be lower because it only considers 2 hints out of 32.
    /* Avg. 43.45 dB
     */
  UASTCLevelFastest = 0,

  /** Faster is ~3x slower than fastest. It supports 9 modes.
    /* Avg. 46.49 dB
    */
  UASTCLevelFaster = 1,

  /** Default is ~5.5x slower than fastest. It supports 14 modes.
    /* Avg. 47.47 dB
    */
  UASTCLevelDefault = 2,

  /** Slower is ~14.5x slower than fastest. It supports all 18 modes.
    /* Avg. 48.01 dB
    */
  UASTCLevelSlower = 3,

  /** VerySlow is ~200x slower than fastest. 
    /* The best quality the codec is capable of, but you'll need to be patient or have a lot of cores.
    /* Avg. 48.24 dB
    */
  UASTCLevelVerySlow = 4,

  UASTCLevelMask = 0xf,

  /** By default the encoder tries to strike a balance between UASTC and transcoded BC7 quality.
    /** These flags allow you to favor only optimizing for lowest UASTC error, or lowest BC7 error.
    */
  UASTCFavorUASTCError = 8,
  UASTCFavorBC7Error = 16,

  UASTCETC1FasterHints = 64,
  UASTCETC1FastestHints = 128,
  UASTCETC1DisableFlipAndIndividual = 256,

  /**
   * Favor UASTC modes 0 and 10 more than the others (this is experimental, it's useful for RDO compression)
   */
  UASTCFavorSimplerModes = 512
}
export interface KTX2EncodeOptions {
  /**
   * If true, the input is assumed to be in sRGB space. Be sure to set this correctly! (Examples: True on photos, albedo/spec maps, and false on normal maps.)
   * @default false
   */
  srgb?: boolean
  /**
   * Sets the ETC1S encoder's quality level, which controls the file size vs. quality tradeoff
   * Range is [1,256]
   * @default 128
   */
  qualityLevel?: number
  /**
   * The compression_level parameter controls the encoder perf vs. file size tradeoff for ETC1S files
   * It does not directly control file size vs. quality - see qualityLevel
   * Range is [0,6]
   * @default 2
   */
  compressionLevel?: number
  /**
   * If true, the encoder will output a UASTC texture, otherwise a ETC1S texture.
   * @default false
   */
  uastc?: boolean
  /**
   * Use UASTC Zstandard supercompression. Use with uastc = true
   * @default false
   */
  uastcZstandard?: boolean
  /**
   * Sets the UASTC encoding performance vs. quality tradeoff, and other lesser used UASTC encoder flags.
   * This is a combination of flags. See UASTCFlags
   */
  uastcFlags?: number
  /**
   * Tunes several codec parameters so compression works better on normal maps.
   * @default false
   */
  normalMap?: boolean
  /**
   * If true, the encoder will generate mipmaps.
   * @default false
   */
  mipmaps?: boolean
  /**
   * If true the source images will be Y flipped before compression
   * @default false
   */
  yFlip?: boolean
}

export type KTX2EncodeRequestData = {
  image: ImageData
  options: KTX2EncodeOptions
}

export type KTX2EncodeResponseData = {
  texture: ArrayBuffer
  error?: string
}

export class KTX2Encoder {
  pool = new WorkerPool(1)

  constructor() {
    this.pool.setWorkerCreator(() => createWorkerFromCrossOriginURL(workerPath, false, { name: 'KTX2 Encoder' }))
  }

  setWorkerLimit(limit: number) {
    this.pool.setWorkerLimit(limit)
  }

  async encode(image: ImageData, options: KTX2EncodeOptions): Promise<ArrayBuffer> {
    const responseMessage = await this.pool.postMessage<KTX2EncodeResponseData>(
      { image, options } as KTX2EncodeRequestData,
      [image.data.buffer]
    )
    if (responseMessage.data.error) throw new Error(responseMessage.data.error)
    if (!responseMessage.data.texture || responseMessage.data.texture.byteLength === 0)
      throw new Error('Encoding failed')
    return responseMessage.data.texture
  }
}
