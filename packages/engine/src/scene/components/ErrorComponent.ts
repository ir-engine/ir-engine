import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export type ErrorComponentType = {
  [componentName: string]: {
    [errorKey: string]: string
  }
}

export const ErrorComponent = defineComponent<ErrorComponentType>({
  name: 'ErrorComponent',
  onInit: () => ({} as ErrorComponentType)
})
