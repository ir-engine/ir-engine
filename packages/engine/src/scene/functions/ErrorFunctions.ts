import { isEmpty } from 'lodash'
import { EngineActions } from '../../ecs/classes/EngineService'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { ErrorComponent } from '../components/ErrorComponent'

export const addError = (entity: Entity, key: string, error: any) => {
  const errorComponent = getComponent(entity, ErrorComponent) ?? addComponent(entity, ErrorComponent, {})
  errorComponent[key] = error
  dispatchLocal(EngineActions.updateEntityError(entity))
}

export const removeError = (entity: Entity, key: string) => {
  const errorComponent = getComponent(entity, ErrorComponent)

  if (!errorComponent) return
  delete errorComponent[key]

  if (isEmpty(errorComponent)) {
    removeComponent(entity, ErrorComponent)
    dispatchLocal(EngineActions.updateEntityError(entity, true))
  } else {
    dispatchLocal(EngineActions.updateEntityError(entity))
  }
}
