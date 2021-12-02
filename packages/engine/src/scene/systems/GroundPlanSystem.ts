import { Group } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import GroundPlane from '../classes/GroundPlane'
import { GroundPlaneComponent } from '../components/GroundPlaneComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { isClient } from '@xrengine/engine/src/common/functions/isClient'
import { WalkableTagComponent } from '../components/Walkable'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function GroundPlanSystem(_: World): Promise<System> {
  const groundPlanQuery = defineQuery([GroundPlaneComponent])

  let navigationRaycastTarget: Group

  return () => {
    for (const entity of groundPlanQuery()) {
      const component = getComponent(entity, GroundPlaneComponent)

      if (!component.dirty) continue
      const groundPlane = getComponent(entity, Object3DComponent)?.value as GroundPlane

      groundPlane.color.set(component.color)

      const isWalkable = hasComponent(entity, WalkableTagComponent)
      if (component.walkable && !isWalkable) {
        addComponent(entity, WalkableTagComponent, {})
      } else if (!component.walkable && isWalkable) {
        removeComponent(entity, WalkableTagComponent)
      }

      groundPlane.generateNavmesh = component.generateNavmesh
      if (isClient && !Engine.isEditor) {
        if (component.generateNavmesh) {
          if (!navigationRaycastTarget) navigationRaycastTarget = new Group()

          navigationRaycastTarget.scale.setScalar(getComponent(entity, TransformComponent).scale.x)
          Engine.scene.add(navigationRaycastTarget)
          addComponent(entity, NavMeshComponent, { navTarget: navigationRaycastTarget })
        } else {
          Engine.scene.remove(navigationRaycastTarget)
          removeComponent(entity, NavMeshComponent)
        }
      }

      component.dirty = false
    }
  }
}
