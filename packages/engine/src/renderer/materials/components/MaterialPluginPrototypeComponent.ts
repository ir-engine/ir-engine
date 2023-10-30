import { PluginObjectType } from '../../../common/functions/OnBeforeCompilePlugin'
import { MaterialSource } from './MaterialSource'
export type PluginParameterType = {
  type: string
  default: any
  min?: number
  max?: number
  options?: any[]
}

export type PluginPrototypeComponentType = {
  prototypeId: string
  parameters: {
    [parameterName: string]: PluginParameterType
  }
  pluginObject: PluginObjectType
  src: MaterialSource
}
