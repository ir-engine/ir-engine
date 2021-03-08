import {
  Mapping,
  RGBAFormat,
  LinearFilter,
  TextureDataType,
  TextureFilter,
  CanvasTexture,
  Wrapping,
} from 'three';

import type { VideoDocumentElementProxy } from './MessageQueue';

export class VideoTextureProxy extends CanvasTexture {
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
  ) {
    super(
      // @ts-ignore
      videoProxy.video,
      mapping,
      wrapS,
      wrapT,
      magFilter,
      minFilter,
      RGBAFormat,
      type,
      anisotropy,
      // encoding,
    );
    this.videoProxy = videoProxy;
    this.minFilter = minFilter !== undefined ? minFilter : LinearFilter;
    this.magFilter = magFilter !== undefined ? magFilter : LinearFilter;
    this.generateMipmaps = false;
    this.flipY = true;

    const updateVideo = () => {
      this.image = this.videoProxy.video;
      this.needsUpdate = true;
      videoProxy._requestVideoFrameCallback(updateVideo);
    };

    if ('_requestVideoFrameCallback' in videoProxy) {
      videoProxy._requestVideoFrameCallback(updateVideo);
    }
  }
  clone(): VideoTextureProxy {
    return new VideoTextureProxy(this.videoProxy).copy(this);
  }

  update() {
    if (
      !this.videoProxy._requestVideoFrameCallback &&
      this.videoProxy.readyState >= 2
    ) {
      this.image = this.videoProxy.video;
      this.needsUpdate = true;
    }
  }
}