import { Not } from 'bitecs'
import { Material, Mesh, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isNode } from '../../common/functions/getEnvironment'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../components/NameComponent'
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
  object3DComponent.value.name = getComponent(entity, NameComponent)?.name ?? ''

  object3DComponent.value.traverse((obj: Mesh<any, Material>) => {
    const material = obj.material
    if (typeof material !== 'undefined') material.dithering = true

    if (shadowComponent) {
      obj.receiveShadow = shadowComponent.receiveShadow
      obj.castShadow = shadowComponent.castShadow
    }
  })
}

const sceneObjectQuery = defineQuery([Object3DComponent])
const simpleMaterialsQuery = defineQuery([Object3DComponent, SimpleMaterialTagComponent])
const standardMaterialsQuery = defineQuery([Object3DComponent, Not(SimpleMaterialTagComponent)])
const persistQuery = defineQuery([Object3DComponent, PersistTagComponent])
const visibleQuery = defineQuery([Object3DComponent, VisibleComponent])
const notVisibleQuery = defineQuery([Object3DComponent, Not(VisibleComponent)])
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

      const layers = Object.values(Engine.instance.currentWorld.objectLayerList)
      for (const layer of layers) {
        if (layer.has(obj3d)) layer.delete(obj3d)
      }
    }

    for (const entity of sceneObjectQuery.enter()) {
      if (!hasComponent(entity, Object3DComponent)) return // may have been since removed
      const obj3d = getComponent(entity, Object3DComponent).value as Object3DWithEntity
      obj3d.entity = entity

      const node = world.entityTree.entityNodeMap.get(entity)
      if (node) {
        if (node.parentEntity) reparentObject3D(node, node.parentEntity, undefined, world.entityTree)
      } else {
        const scene = Engine.instance.currentWorld.scene
        let isInScene = false
        obj3d.traverseAncestors((ancestor) => {
          if (ancestor === scene) {
            isInScene = true
          }
        })
        if (!isInScene) scene.add(obj3d)
      }

      processObject3d(entity)
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

    for (const entity of visibleQuery()) {
      getComponent(entity, Object3DComponent).value.visible = true
    }

    for (const entity of notVisibleQuery()) {
      getComponent(entity, Object3DComponent).value.visible = false
    }

    const fixedDelta = getState(EngineState).fixedDeltaSeconds.value
    for (const entity of updatableQuery()) {
      const obj = getComponent(entity, Object3DComponent)?.value as unknown as Updatable
      obj?.update(fixedDelta)
    }

    /**
     * If a SimpleMaterialTagComponent is attached to the root node, this acts as a global to override all materials
     * It can also be used to selectively convert individual objects to use simple materials
     */
    for (const entity of simpleMaterialsQuery.enter()) {
      const object3DComponent = getComponent(entity, Object3DComponent)
      if (object3DComponent.value === world.scene) {
        Engine.instance.simpleMaterials = true
      }
      object3DComponent.value.traverse((obj) => {
        useSimpleMaterial(obj as any)
      })
    }

    /**
     * As we iterative down the scene hierarchy, we don't want to override entities that have a SimpleMaterialTagComponent
     */
    for (const entity of simpleMaterialsQuery.exit()) {
      const object3DComponent = getComponent(entity, Object3DComponent, true)
      if (object3DComponent.value === world.scene) {
        Engine.instance.simpleMaterials = false
      }
      if (!Engine.instance.simpleMaterials) {
        object3DComponent.value.traverse((obj: Object3DWithEntity) => {
          if (typeof obj.entity === 'number' && hasComponent(obj as any, SimpleMaterialTagComponent)) return
          useStandardMaterial(obj as any)
        })
      }
    }

    /**
     * This is needed as the inverse case of the previous query to ensure objects that are created without a simple material still have the standard material logic applied
     */
    for (const entity of standardMaterialsQuery.enter()) {
      //check for materials that have had simple material tag added this frame
      if (hasComponent(entity, SimpleMaterialTagComponent)) continue
      const object3DComponent = getComponent(entity, Object3DComponent)
      if (object3DComponent.value === world.scene) continue
      object3DComponent.value.traverse((obj: Object3DWithEntity) => {
        Engine.instance.simpleMaterials ? useSimpleMaterial(obj as any) : useStandardMaterial(obj as any)
      })
    }
  }
}
