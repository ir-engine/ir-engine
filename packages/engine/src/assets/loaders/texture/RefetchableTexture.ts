/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  ColorSpace,
  CompressedArrayTexture,
  CompressedPixelFormat,
  CompressedTexture,
  CubeTexture,
  CubeTextureMapping,
  Loader,
  MagnificationTextureFilter,
  Mapping,
  MinificationTextureFilter,
  PixelFormat,
  PMREMGenerator,
  Texture,
  TextureDataType,
  Wrapping
} from 'three'

function noop() {}

/**
 * Extends the base Three.js Texture class with refetching capability
 */
export class RefetchableTexture extends Texture {
  pendingFetch = false
  loader: Loader

  constructor(
    image?: TexImageSource | OffscreenCanvas,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number,
    encoding?: ColorSpace
  ) {
    super(image, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding)
    let version = 0
    Object.defineProperty(this, 'version', {
      get: () => {
        return version
      },
      set: (value) => {
        version = value
        if (!this.source.data) {
          this.refetchSource()
          version = 0
        }
      }
    })
  }

  refetchSource() {
    if (this.pendingFetch || !this.loader) return
    this.pendingFetch = true
    const onRefetch = (image: ImageBitmap) => {
      this.image = image
      this.needsUpdate = true
      this.pendingFetch = false
    }
    const url = this.userData?.url
    if (url) {
      this.loader.load(url, onRefetch, noop, noop)
    }
  }

  copy(source: RefetchableTexture): this {
    super.copy(source)
    this.loader = source.loader
    return this
  }
}

/**
 * Extends the CubeTexture class with refetching capability
 */
export class RefetchableCubeTexture extends CubeTexture {
  pendingFetch = false
  loader: Loader

  constructor(
    images?: any[],
    mapping?: CubeTextureMapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    format?: PixelFormat,
    type?: TextureDataType,
    anisotropy?: number,
    colorSpace?: ColorSpace
  ) {
    super(images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace)
    let version = 0
    Object.defineProperty(this, 'version', {
      get: () => {
        return version
      },
      set: (value) => {
        version = value
        if (!this.source.data) {
          this.refetchSource()
          version = 0
        }
      }
    })
  }

  refetchSource() {
    if (this.pendingFetch || !this.loader) return
    this.pendingFetch = true
    const onRefetch = (result: any) => {
      this.image = result
      this.needsUpdate = true
      this.pendingFetch = false
    }
    const url = this.userData?.url
    if (url) {
      this.loader.load(url, onRefetch, noop, noop)
    }
  }

  copy(source: RefetchableCubeTexture): this {
    super.copy(source)
    this.loader = source.loader
    return this
  }
}

/**
 * Extends the CompressedTexture class with refetching capability
 */
export class RefetchableCompressedTexture extends CompressedTexture {
  pendingFetch = false
  loader: Loader

  constructor(
    mipmaps: ImageData[],
    width: number,
    height: number,
    format: CompressedPixelFormat,
    type: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    anisotropy?: number,
    encoding?: ColorSpace
  ) {
    super(mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding)
    let version = 0
    Object.defineProperty(this, 'version', {
      get: () => {
        return version
      },
      set: (value) => {
        version = value
        if (!this.source.data) {
          this.refetchSource()
          version = 0
        }
      }
    })
  }

  refetchSource() {
    if (this.pendingFetch || !this.loader) return
    this.pendingFetch = true
    const onRefetch = (result: any) => {
      this.mipmaps = result?.mipmaps || result || []
      if (result?.width) {
        ;(this as any).width = result.width
      }
      if (result?.height) {
        ;(this as any).height = result.height
      }
      this.needsUpdate = true
      this.pendingFetch = false
    }
    const url = this.userData?.url
    if (url) {
      this.loader.load(url, onRefetch, noop, noop)
    }
  }

  copy(source: RefetchableCompressedTexture): this {
    super.copy(source)
    this.loader = source.loader
    return this
  }
}

/**
 * Extends the CompressedArrayTexture class with refetching capability
 */
export class RefetchableCompressedArrayTexture extends CompressedArrayTexture {
  pendingFetch = false
  loader: Loader

  constructor(
    mipmaps: ImageData[],
    width: number,
    height: number,
    depth: number,
    format: CompressedPixelFormat,
    type?: TextureDataType
  ) {
    super(mipmaps, width, height, depth, format, type)
    let version = 0
    Object.defineProperty(this, 'version', {
      get: () => {
        return version
      },
      set: (value) => {
        version = value
        if (!this.source.data) {
          this.refetchSource()
          version = 0
        }
      }
    })
  }

  refetchSource() {
    if (this.pendingFetch || !this.loader) return
    this.pendingFetch = true
    const onRefetch = (result: any) => {
      this.mipmaps = Array.isArray(result) ? result : result?.mipmaps || []
      if (result?.width) {
        ;(this as any).width = result.width
      }
      if (result?.height) {
        ;(this as any).height = result.height
      }
      this.needsUpdate = true
      this.pendingFetch = false
    }
    const url = this.userData?.url
    if (url) {
      this.loader.load(url, onRefetch, noop, noop)
    }
  }

  copy(source: RefetchableCompressedArrayTexture): this {
    super.copy(source)
    this.loader = source.loader
    return this
  }
}

/**
 * Extends the CompressedCubeTexture class with refetching capability
 */
export class RefetchableCompressedCubeTexture extends CompressedTexture {
  pendingFetch = false
  loader: Loader

  constructor(
    faces: ImageData[],
    width: number,
    height: number,
    format: CompressedPixelFormat,
    type: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: MagnificationTextureFilter,
    minFilter?: MinificationTextureFilter,
    anisotropy?: number,
    encoding?: ColorSpace
  ) {
    super(faces, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding)
    let version = 0
    Object.defineProperty(this, 'version', {
      get: () => {
        return version
      },
      set: (value) => {
        version = value
        if (!this.source.data) {
          this.refetchSource()
          version = 0
        }
      }
    })
  }

  refetchSource() {
    if (this.pendingFetch || !this.loader) return
    this.pendingFetch = true
    const onRefetch = (result: any) => {
      this.mipmaps = result?.mipmaps || result || []
      if (result?.width) {
        ;(this as any).width = result.width
      }
      if (result?.height) {
        ;(this as any).height = result.height
      }
      this.needsUpdate = true
      this.pendingFetch = false
    }
    const url = this.userData?.url
    if (url) {
      this.loader.load(url, onRefetch, noop, noop)
    }
  }

  copy(source: RefetchableCompressedCubeTexture): this {
    super.copy(source)
    this.loader = source.loader
    return this
  }
}

const _fromTexture = PMREMGenerator.prototype['_fromTexture']
PMREMGenerator.prototype['_fromTexture'] = function (texture, renderTarget) {
  texture.needsUpdate = true
  return _fromTexture.call(this, texture, renderTarget)
}
