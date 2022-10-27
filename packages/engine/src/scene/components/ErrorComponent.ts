import { Entity } from '../../ecs/classes/Entity'
import {
  Component,
  ComponentErrorsType,
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

export const getEntityErrors = <C extends Component>(entity: Entity, component: C) => {
  return getComponentState(entity, ErrorComponent)?.[component.name].value as Record<ComponentErrorsType<C>, string>
}
