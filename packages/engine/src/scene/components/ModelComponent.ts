import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ModelComponentType = {
  src: string
  envMapOverride: string
  textureOverride: string
  matrixAutoUpdate: boolean
  isUsingGPUInstancing: boolean
  isDynamicObject: boolean
  curScr?: string
  errorEnvMapLoad?: string
  error?: string
  parsed?: boolean
}

export const ModelComponent = createMappedComponent<ModelComponentType>('ModelComponent')
