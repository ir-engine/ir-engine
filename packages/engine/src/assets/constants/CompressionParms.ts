export type KTX2EncodeArguments = {
  src: string
  format: 'ktx2' | 'basis'
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
  format: 'ktx2',
  mode: 'ETC1S',
  quality: 128,
  mipmaps: true,
  resize: false,
  resizeWidth: 0,
  resizeHeight: 0,
  resizeMethod: 'stretch'
}
