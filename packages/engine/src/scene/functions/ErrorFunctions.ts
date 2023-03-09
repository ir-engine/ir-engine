import { isEmpty } from 'lodash'

import { none } from '@etherealengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  Component,
  ComponentErrorsType,
  getComponentState,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { ErrorComponent } from '../components/ErrorComponent'

export const addError = <C extends Component>(
  entity: Entity,
  Component: C,
  error: ComponentErrorsType<C>,
  message?: string
) => {
  console.error('[addError]:', entity, Component.name, error, message)
  if (!hasComponent(entity, ErrorComponent)) addComponent(entity, ErrorComponent)
  const errors = getComponentState(entity, ErrorComponent)
  if (!errors[Component.name].value) errors[Component.name].set({})
  errors[Component.name][error].set(message ?? '')
}

export const removeError = <C extends Component>(entity: Entity, Component: C, error: ComponentErrorsType<C>) => {
  if (!hasComponent(entity, ErrorComponent)) return
  const errors = getComponentState(entity, ErrorComponent)
  const componentErrors = errors[Component.name]
  if (componentErrors.value) componentErrors[error].set(none)
  if (isEmpty(componentErrors.value)) errors[Component.name].set(none)
  if (isEmpty(errors.value)) removeComponent(entity, ErrorComponent)
}

export const clearErrors = (entity: Entity, Component: Component) => {
  if (!hasComponent(entity, ErrorComponent)) return
  const errors = getComponentState(entity, ErrorComponent)
  errors[Component.name].set(none)
}
