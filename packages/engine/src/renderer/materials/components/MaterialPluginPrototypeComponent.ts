import { Shader, WebGLRenderer } from 'three'
import { PluginObjectType } from '../../../common/functions/OnBeforeCompilePlugin'
import { createMappedComponent } from '../../../ecs/functions/ComponentFunctions'
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
  //onBeforeCompile?: (shader: Shader, renderer: WebGLRenderer) => void;
}

export const PluginPrototypeComponent = createMappedComponent<PluginPrototypeComponentType>('PluginPrototypeComponent')

export const RENDER_COMPONENT_PLUGIN_PROTOTYPE = 'plugin-prototype'
export const RENDER_COMPONENT_PLUGIN_PROTOTYPE_DEFAULT_VALUES: PluginPrototypeComponentType = {
  prototypeId: '',
  pluginObject: {
    id: '',
    priority: undefined,
    compile: (shader: Shader, renderer: WebGLRenderer) => {}
  },
  parameters: {}
}
