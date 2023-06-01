import { Material, Shader, WebGLRenderer } from 'three'

import { PluginObjectType } from '../../../common/functions/OnBeforeCompilePlugin'
import { defineComponent } from '../../../ecs/functions/ComponentFunctions'
import { MaterialSource, SourceType } from './MaterialSource'

export type MaterialPluginType = {
  plugin: PluginObjectType
  parameters: Record<string, any>
  instances: Material[]
  src: MaterialSource
}
