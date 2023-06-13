export type KTX2EncodeArguments = {
  src: string
  flipY: boolean
  format: 'ktx2' | 'basis'
  linear: boolean
  mode: 'ETC1S' | 'UASTC'
  quality: number
  mipmaps: boolean
  resize: boolean
  resizeWidth: number
  resizeHeight: number
  resizeMethod: 'stretch' | 'aspect'
}

export const KTX2EncodeDefaultArguments: KTX2EncodeArguments = {
  src: '',
  flipY: false,
  format: 'ktx2',
  linear: true,
  mode: 'ETC1S',
  quality: 128,
  mipmaps: true,
  resize: false,
  resizeWidth: 0,
  resizeHeight: 0,
  resizeMethod: 'stretch'
}
