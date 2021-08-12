import { getComponent } from '../../ecs/functions/EntityFunctions'
import { ECSWorld } from '../../ecs/classes/World'
import { defineQuery, defineSystem, System } from '../../ecs/bitecs'
import { OceanComponent } from '../components/OceanComponent'
import { isClient } from '../../common/functions/isClient'
import { TransformComponent } from '../../transform/components/TransformComponent'

export const applyTransform = (entity, ocean): void => {
  if (!isClient) return
  const mesh = ocean.mesh
  if (!mesh) return

  const transform = getComponent(entity, TransformComponent)
  mesh.position.copy(transform.position)
  mesh.quaternion.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w)
  mesh.scale.copy(transform.scale)
  mesh.updateMatrix()
}

export const OceanSystem = async (): Promise<System> => {
  const oceanQuery = defineQuery([OceanComponent])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of oceanQuery(world)) {
      const ocean = getComponent(entity, OceanComponent)
      applyTransform(entity, ocean)
      ocean.mesh?.update(delta)
    }

    return world
  })
}
