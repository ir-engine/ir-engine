import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { MaterialOverrideComponentType } from './MaterialOverrideComponent'

export type ModelComponentType = {
  src: string
  textureOverride: string
  materialOverrides: MaterialOverrideComponentType[]
  matrixAutoUpdate: boolean
  useBasicMaterial: boolean
  isUsingGPUInstancing: boolean
  isDynamicObject: boolean
  curScr?: string
  parsed?: boolean
}

export const ModelComponent = createMappedComponent<ModelComponentType>('ModelComponent')
