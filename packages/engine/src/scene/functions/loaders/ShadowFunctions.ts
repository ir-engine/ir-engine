import { Mesh } from 'three'

import { ComponentUpdateFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ShadowComponent } from '../../components/ShadowComponent'

export const updateShadow: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, ShadowComponent)
  const obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) return

  obj3d.traverse((mesh: Mesh) => {
    mesh.castShadow = component.cast
    mesh.receiveShadow = component.receive

    if (Array.isArray(mesh.material)) {
      for (let i = 0; i < mesh.material.length; i++) {
        if (mesh.material[i]) mesh.material[i].needsUpdate = true
      }
    } else if (mesh.material) {
      mesh.material.needsUpdate = true
    }
  })
}
