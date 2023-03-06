import { Mesh, MeshStandardMaterial, Object3D, Scene } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, traverseEntityNode } from '../../../ecs/functions/EntityTree'
import { GroupComponent } from '../../components/GroupComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const prepareSceneForBake = (world = Engine.instance.currentScene): Scene => {
  const scene = Engine.instance.scene.clone(false)
  const parents = {
    [world.sceneEntity]: scene
  } as { [key: Entity]: Object3D }

  traverseEntityNode(world.sceneEntity, (entity) => {
    if (entity === world.sceneEntity || hasComponent(entity, PreventBakeTagComponent)) return

    const group = getComponent(entity, GroupComponent) as unknown as Mesh<any, MeshStandardMaterial>[]
    const node = getComponent(entity, EntityTreeComponent)

    if (group) {
      for (const obj of group) {
        const newObj = obj.clone(true)
        if (node.parentEntity) parents[node.parentEntity].add(newObj)
        newObj.traverse((o: any) => {
          if (o.material) {
            o.material = obj.material.clone()
            o.material.roughness = 1
          }
        })
      }
    }
  })

  return scene
}
