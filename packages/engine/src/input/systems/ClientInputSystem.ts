import { World } from '../../ecs/classes/World'
import { defineQuery, getOptionalComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { InputComponent } from '../components/InputComponent'
import { LocalInputTagComponent } from '../components/LocalInputTagComponent'
import { BaseInput } from '../enums/BaseInput'
import { addClientInputListeners, removeClientInputListeners } from '../functions/clientInputListeners'

export default async function ClientInputSystem(world: World) {
  const localClientInputQuery = defineQuery([InputComponent, LocalInputTagComponent])

  addClientInputListeners(world)
  world.pointerScreenRaycaster.layers.enableAll()

  const execute = () => {
    const input = getOptionalComponent(world.localClientEntity, InputComponent)
    const screenXY = input?.data?.get(BaseInput.SCREENXY)?.value

    if (screenXY) {
      world.pointerScreenRaycaster.setFromCamera({ x: screenXY[0], y: screenXY[1] }, world.camera)
    } else {
      world.pointerScreenRaycaster.ray.origin.set(Infinity, Infinity, Infinity)
      world.pointerScreenRaycaster.ray.direction.set(0, -1, 0)
    }
  }

  const cleanup = async () => {
    removeClientInputListeners()
    removeQuery(world, localClientInputQuery)
  }

  return { execute, cleanup }
}
