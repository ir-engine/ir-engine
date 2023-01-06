import { Mesh, MeshStandardMaterial, Object3D, Scene } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '../../../ecs/functions/EntityTree'
import { GroupComponent } from '../../components/GroupComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const prepareSceneForBake = (world = Engine.instance.currentWorld): Scene => {
  const scene = world.scene.clone(false)
  const parents = {
    [world.entityTree.rootNode.entity]: scene
  } as { [key: Entity]: Object3D }

  traverseEntityNode(world.entityTree.rootNode, (node) => {
    if (node === world.entityTree.rootNode || hasComponent(node.entity, PreventBakeTagComponent)) return

    const group = getComponent(node.entity, GroupComponent) as unknown as Mesh<any, MeshStandardMaterial>[]

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
