export type ImageConvertParms = {
  src: string
  format: 'jpg' | 'png' | 'webp'
  resize: boolean
  width: number
  height: number
  flipX: boolean
  flipY: boolean
}

export const ImageConvertDefaultParms: ImageConvertParms = {
  src: '',
  format: 'png',
  resize: false,
  width: 1024,
  height: 1024,
  flipX: false,
  flipY: false
}
