import { Mesh, MeshStandardMaterial, Object3D, Scene } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { SceneState } from '../../../ecs/classes/Scene'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent, traverseEntityNode } from '../../../ecs/functions/EntityTree'
import { GroupComponent } from '../../components/GroupComponent'
import { PreventBakeTagComponent } from '../../components/PreventBakeTagComponent'

export const prepareSceneForBake = (): Scene => {
  const scene = Engine.instance.scene.clone(false)
  const sceneEntity = getState(SceneState).sceneEntity
  const parents = {
    [sceneEntity]: scene
  } as { [key: Entity]: Object3D }

  traverseEntityNode(sceneEntity, (entity) => {
    if (entity === sceneEntity || hasComponent(entity, PreventBakeTagComponent)) return

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
