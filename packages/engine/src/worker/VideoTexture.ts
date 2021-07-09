
/**
 * Proxies for offscreen threejs video texture
 *
 * @author Josh Field <github.com/hexafield>
 */

import {
  Mapping,
  RGBAFormat,
  LinearFilter,
  TextureDataType,
  TextureFilter,
  CanvasTexture,
  Wrapping
} from 'three'

import type { VideoDocumentElementProxy } from './MessageQueue'

export class VideoTextureProxy extends CanvasTexture {
  isVideoTexture = true
  videoProxy: VideoDocumentElementProxy
  constructor (
    videoProxy: VideoDocumentElementProxy,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    type?: TextureDataType,
    anisotropy?: number
  ) {
    super(
      // @ts-expect-error
      videoProxy.video,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      RGBAFormat,
      type,
      anisotropy
      // encoding,
    )
    this.videoProxy = videoProxy;
    (this as any).minFilter = minFilter !== undefined ? minFilter : LinearFilter;
    (this as any).magFilter = magFilter !== undefined ? magFilter : LinearFilter;
    (this as any).generateMipmaps = false;
    (this as any).flipY = true

    const updateVideo = () => {
      (this as any).image = this.videoProxy.video;
      (this as any).needsUpdate = true
      videoProxy._requestVideoFrameCallback(updateVideo)
    }

    if ('_requestVideoFrameCallback' in videoProxy) {
      videoProxy._requestVideoFrameCallback(updateVideo)
    }
  }

  clone () {
    return (new VideoTextureProxy(this.videoProxy) as any).copy(this)
  }

  update () {
    if (
      !this.videoProxy._requestVideoFrameCallback &&
      this.videoProxy.readyState >= 2
    ) {
      (this as any).image = this.videoProxy.video;
      (this as any).needsUpdate = true
    }
  }
}
