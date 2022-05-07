import { Material, Mesh, Vector3 } from 'three'

import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isNode } from '../../common/functions/getEnvironment'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent, Object3DWithEntity } from '../components/Object3DComponent'
import { PersistTagComponent } from '../components/PersistTagComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SimpleMaterialTagComponent } from '../components/SimpleMaterialTagComponent'
import { UpdatableComponent } from '../components/UpdatableComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { useSimpleMaterial, useStandardMaterial } from '../functions/loaders/SimpleMaterialFunctions'
import { registerPrefabs } from '../functions/registerPrefabs'
import { registerDefaultSceneFunctions } from '../functions/registerSceneFunctions'
import { reparentObject3D } from '../functions/ReparentFunction'
import { Updatable } from '../interfaces/Updatable'

/**
 * @author Josh Field <github.com/HexaField>
 */

// TODO: refactor this to be named something more generic like ObjectSystem, add object-object interactions (physics & non physics)
// GameManagerSystem already has physics interaction behaviors, these could be made generic and not game dependent

type BPCEMProps = {
  bakeScale: Vector3
  bakePositionOffset: Vector3
}

export class SceneOptions {
  static instance: SceneOptions
  bpcemOptions: BPCEMProps = {
    bakeScale: new Vector3(1, 1, 1),
    bakePositionOffset: new Vector3()
  }
  envMapIntensity = 1
  boxProjection = false
}

const processObject3d = (entity: Entity) => {
  if (!isClient) return

  const object3DComponent = getComponent(entity, Object3DComponent)
  const shadowComponent = getComponent(entity, ShadowComponent)

  object3DComponent.value.traverse((obj: Mesh<any, Material>) => {
    const material = obj.material
    if (typeof material !== 'undefined') material.dithering = true

    if (shadowComponent) {
      obj.receiveShadow = shadowComponent.receiveShadow
      obj.castShadow = shadowComponent.castShadow
    }

    if (Engine.instance.simpleMaterials || Engine.instance.isHMD) {
      useSimpleMaterial(obj as any)
    } else {
      useStandardMaterial(obj)
    }
  })
}

const sceneObjectQuery = defineQuery([Object3DComponent])
const simpleMaterialsQuery = defineQuery([SimpleMaterialTagComponent])
const persistQuery = defineQuery([Object3DComponent, PersistTagComponent])
const visibleQuery = defineQuery([Object3DComponent, VisibleComponent])
const updatableQuery = defineQuery([Object3DComponent, UpdatableComponent])

export default async function SceneObjectSystem(world: World) {
  SceneOptions.instance = new SceneOptions()

  registerDefaultSceneFunctions(world)
  registerPrefabs(world)

  if (isNode) {
    await loadDRACODecoder()
  }

  return () => {
    for (const entity of sceneObjectQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent, true).value

      if (!obj3d.parent) console.warn('[Object3DComponent]: Scene object has been removed manually.')
      else obj3d.removeFromParent()
    }

    for (const entity of sceneObjectQuery.enter()) {
      if (!hasComponent(entity, Object3DComponent)) return // may have been since removed
      const obj3d = getComponent(entity, Object3DComponent).value as Object3DWithEntity
      obj3d.entity = entity

      const node = world.entityTree.entityNodeMap.get(entity)
      if (node) {
        if (node.parentEntity) reparentObject3D(node, node.parentEntity, undefined, world.entityTree)
      } else {
        let found = false
        Engine.instance.scene.traverse((obj) => {
          if (obj === obj3d) {
            found = true
          }
        })

        if (!found) Engine.instance.scene.add(obj3d)
      }

      processObject3d(entity)

      /** @todo this breaks a bunch of stuff */
      // obj3d.visible = hasComponent(entity, VisibleComponent)
    }

    // Enable second camera layer for persistant entities for fun portal effects
    for (const entity of persistQuery.enter()) {
      const object3DComponent = getComponent(entity, Object3DComponent)
      object3DComponent?.value?.traverse((obj) => {
        obj.layers.enable(ObjectLayers.Portal)
      })
    }

    for (const entity of persistQuery.exit()) {
      const object3DComponent = getComponent(entity, Object3DComponent)
      object3DComponent?.value?.traverse((obj) => {
        obj.layers.disable(ObjectLayers.Portal)
      })
    }

    for (const entity of visibleQuery.enter()) {
      if (!hasComponent(entity, Object3DComponent)) return
      getComponent(entity, Object3DComponent).value.visible = true
    }

    for (const entity of visibleQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent)
      if (obj3d) obj3d.value.visible = false // On removal of entity Object3DComponent becomes null
    }

    for (const entity of updatableQuery()) {
      const obj = getComponent(entity, Object3DComponent)?.value as unknown as Updatable
      obj?.update(world.fixedDelta)
    }

    for (const _ of simpleMaterialsQuery.enter()) {
      Engine.instance.simpleMaterials = true
      Engine.instance.scene.traverse((obj) => {
        useSimpleMaterial(obj as any)
      })
    }

    for (const _ of simpleMaterialsQuery.exit()) {
      Engine.instance.simpleMaterials = false
      Engine.instance.scene.traverse((obj) => {
        useStandardMaterial(obj as Mesh<any, Material>)
      })
    }
  }
}
