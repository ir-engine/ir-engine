import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type WebCamInputComponentType = {
  emotions: string[]
}

export const WebCamInputComponent = createMappedComponent<WebCamInputComponentType>('WebCamInputComponent')
