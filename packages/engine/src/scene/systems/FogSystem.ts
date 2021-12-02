import { Fog, FogExp2 } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { FogComponent } from '../components/FogComponent'
import { FogType } from '../constants/FogType'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function FogSystem(_: World): Promise<System> {
  const fogQuery = defineQuery([FogComponent])
  let fog: Fog | FogExp2

  return () => {
    for (const entity of fogQuery()) {
      const component = getComponent(entity, FogComponent)

      if (!component.dirty) continue

      switch (component.type) {
        case FogType.Linear:
          if (Engine.scene.fog instanceof Fog) {
            Engine.scene.fog.color = component.color
            Engine.scene.fog.near = component.near
            Engine.scene.fog.far = component.far
          } else {
            Engine.scene.fog = new Fog(component.color, component.near, component.far)
          }
          break

        case FogType.Exponential:
          if (Engine.scene.fog instanceof FogExp2) {
            Engine.scene.fog.color = component.color
            Engine.scene.fog.density = component.density
          } else {
            Engine.scene.fog = new FogExp2(component.color.getHexString(), component.density)
          }
          break

        default:
          Engine.scene.fog = null
          break
      }

      component.dirty = false
    }

    for (const _ of fogQuery.exit()) {
      Engine.scene.fog = null
    }
  }
}
