import { Color, ShadowMaterial as Shadow } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { BoolArg, ColorArg } from '../DefaultArgs'

export const DefaultArgs = {
  color: { ...ColorArg, default: new Color('#000') },
  fog: { ...BoolArg, default: true },
  transparent: { ...BoolArg, default: true }
}

export const ShadowMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'ShadowMaterial',
  baseMaterial: Shadow,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}
