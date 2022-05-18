import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type ErrorComponentType = {
  [key: string]: any
}

export const ErrorComponent = createMappedComponent<ErrorComponentType>('ErrorComponent')
