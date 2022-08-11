import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { MaterialOverrideComponentType } from './MaterialOverrideComponent'

export type ModelComponentType = {
  src: string
  materialOverrides: MaterialOverrideComponentType[]
  generateBVH: boolean
  matrixAutoUpdate: boolean
  useBasicMaterial: boolean
  isUsingGPUInstancing: boolean
  curScr?: string
  parsed?: boolean
}

export const ModelComponent = createMappedComponent<ModelComponentType>('ModelComponent')
