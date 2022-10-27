import { Entity } from '../../ecs/classes/Entity'
import {
  Component,
  ComponentErrorsType,
  ComponentType,
  defineComponent,
  getComponentState
} from '../../ecs/functions/ComponentFunctions'

export type ErrorComponentType = {
  [componentName: string]: {
    [errorKey: string]: string
  }
}

export const ErrorComponent = defineComponent<ErrorComponentType>({
  name: 'ErrorComponent',
  onInit: () => ({} as ErrorComponentType)
})

export const getEntityErrors = <T>(entity: Entity, component: Component<T, unknown, unknown>) => {
  return getComponentState(entity, ErrorComponent)?.[component.name].value as Record<
    keyof ComponentErrorsType<Component<T, unknown, unknown>>,
    string
  >
}
