import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type WebCamInputComponentType = {
  emotions: string[]
}

export const WebCamInputComponent = createMappedComponent<WebCamInputComponentType>('WebCamInputComponent')
