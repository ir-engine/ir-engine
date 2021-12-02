import { Mesh } from 'three'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { ShadowComponent } from '../components/ShadowComponent'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function ShadowSystem(_: World): Promise<System> {
  const shadowQuery = defineQuery([ShadowComponent])

  return () => {
    for (const entity of shadowQuery()) {
      const component = getComponent(entity, ShadowComponent)

      if (!component.dirty) continue

      const obj3d = getComponent(entity, Object3DComponent)?.value

      obj3d.traverse((mesh: Mesh) => {
        mesh.castShadow = component.castShadow
        mesh.receiveShadow = component.receiveShadow

        if (Array.isArray(mesh.material)) {
          for (let i = 0; i < mesh.material.length; i++) {
            if (mesh.material[i]) mesh.material[i].needsUpdate = true
          }
        } else if (mesh.material) {
          mesh.material.needsUpdate = true
        }
      })

      component.dirty = false
    }
  }
}
