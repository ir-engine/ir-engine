import { Color } from 'three'

import { ColorArg, FloatArg, NormalizedFloatArg, TextureArg } from './DefaultArgs'

export const BasicArgs = {
  alphaTest: NormalizedFloatArg,
  alphaMap: TextureArg,
  aoMap: TextureArg,
  aoMapIntensity: NormalizedFloatArg,
  envMap: TextureArg,
  lightMap: TextureArg,
  lightMapIntensity: FloatArg,
  map: TextureArg,
  color: { ...ColorArg, default: new Color(1, 1, 1) }
}
