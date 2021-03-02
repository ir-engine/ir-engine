import {
  Mapping,
  RGBAFormat,
  LinearFilter,
  TextureDataType,
  TextureFilter,
  TextureEncoding,
  DataTexture,
  Wrapping,
} from 'three';

import type { VideoDocumentElementProxy } from './MessageQueue';

export class VideoTextureProxy extends DataTexture {
  isVideoTexture = true;
  videoProxy: VideoDocumentElementProxy;
  constructor(
    videoProxy: VideoDocumentElementProxy,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    type?: TextureDataType,
    anisotropy?: number,
    encoding?: TextureEncoding,
  ) {
    super(
      /** @ts-ignore */
      videoProxy.video,
      /** @ts-ignore */
      videoProxy.video.width,
      /** @ts-ignore */
      videoProxy.video.height,
      RGBAFormat,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      type,
      anisotropy,
      encoding,
    );
    this.videoProxy = videoProxy;
    this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
    this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;
    this.generateMipmaps = false;
    this.flipY = true;

    const updateVideo = () => {
      this.image = this.videoProxy.video as ImageData;
      this.needsUpdate = true;
      videoProxy.requestVideoFrameCallback(updateVideo);
    };

    if ('requestVideoFrameCallback' in videoProxy) {
      videoProxy.requestVideoFrameCallback(updateVideo);
    }
  }
  clone(): VideoTextureProxy {
    return new VideoTextureProxy(this.videoProxy).copy(this);
  }

  update() {
    if (
      !this.videoProxy.requestVideoFrameCallback &&
      this.videoProxy.readyState >= 2
    ) {
      this.image = this.videoProxy.video as ImageData;
      this.needsUpdate = true;
    }
  }
}
