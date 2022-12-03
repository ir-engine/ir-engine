import { World } from '../../ecs/classes/World'
import { defineQuery, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { addClientInputListeners, removeClientInputListeners } from '../functions/clientInputListeners'

export default async function ClientInputSystem(world: World) {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  addClientInputListeners(world)
  world.pointerScreenRaycaster.layers.enableAll()

  const execute = () => {
    world.pointerScreenRaycaster.setFromCamera(world.pointerState.position, world.camera)
  }

  const cleanup = async () => {
    removeClientInputListeners()
    removeQuery(world, localClientInputQuery)
  }

  return { execute, cleanup }
}
