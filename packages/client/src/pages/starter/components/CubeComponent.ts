import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type CubeComponentType = {
  number: number
}

export const CubeComponent = createMappedComponent<CubeComponentType>('CubeComponent')
