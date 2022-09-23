import { Mesh } from 'three'

import { ComponentUpdateFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { GroupComponent } from '../../components/GroupComponent'
import { ShadowComponent } from '../../components/ShadowComponent'

export const updateShadow: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, ShadowComponent)
  const group = getComponent(entity, GroupComponent)
  if (!group.length) return

  for (const obj of group)
    obj.traverse((mesh: Mesh) => {
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
