import { Scene } from 'three'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { MaterialOverrideComponentType } from './MaterialOverrideComponent'

export type ModelComponentType = {
  src: string
  materialOverrides: MaterialOverrideComponentType[]
  generateBVH: boolean
  matrixAutoUpdate: boolean
  isUsingGPUInstancing: boolean
  curScr?: string
  scene?: Scene
}

export const ModelComponent = createMappedComponent<ModelComponentType>('ModelComponent')

export const SCENE_COMPONENT_MODEL = 'gltf-model'
export const SCENE_COMPONENT_MODEL_DEFAULT_VALUE = {
  src: '',
  materialOverrides: [] as MaterialOverrideComponentType[],
  generateBVH: false,
  matrixAutoUpdate: true,
  isUsingGPUInstancing: false
} as ModelComponentType
