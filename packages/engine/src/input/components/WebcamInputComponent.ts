import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type WebcamInputComponentType = {
  expressionValue: number
  expressionIndex: number
  pucker: number
  widen: number
  open: number
}

export const WebcamInputComponent = createMappedComponent<WebcamInputComponentType>('WebcamInputComponent')
