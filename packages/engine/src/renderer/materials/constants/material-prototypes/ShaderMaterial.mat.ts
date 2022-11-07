import { Color, ShaderMaterial as Shader } from 'three'

import { MaterialPrototypeComponentType } from '../../components/MaterialPrototypeComponent'
import { SourceType } from '../../components/MaterialSource'
import { ColorArg, ObjectArg, ShaderArg } from '../DefaultArgs'

export const DefaultArgs = {
  uniforms: {
    ...ObjectArg,
    default: {
      color: { ...ColorArg, default: new Color('#f00') }
    }
  },
  vertexShader: ShaderArg,
  fragmentShader: ShaderArg
}

export const ShaderMaterial: MaterialPrototypeComponentType = {
  prototypeId: 'ShaderMaterial',
  baseMaterial: Shader,
  arguments: DefaultArgs,
  src: { type: SourceType.BUILT_IN, path: '' }
}
