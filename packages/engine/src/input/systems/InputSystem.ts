import { getComponent } from '../../ecs/functions/EntityFunctions'
import { InputComponent } from '../components/InputComponent'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'

export const InputSystem = async (): Promise<System> => {
  const localClientInputQuery = defineQuery([InputComponent])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of localClientInputQuery(world)) {
      const inputComponent = getComponent(entity, InputComponent)
      while (inputComponent.data.length) {
        inputComponent.data[0].forEach((value: InputValue, key: InputAlias) => {
          if (inputComponent.schema.behaviorMap.has(key)) {
            inputComponent.schema.behaviorMap.get(key)(entity, key, value, delta)
          }
        })
        inputComponent.data.splice(0, 1)
      }
    }

    return world
  })
}
