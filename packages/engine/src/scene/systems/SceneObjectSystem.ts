import { Material, Mesh, Vector3 } from 'three'
import { ObjectLayers } from '../constants/ObjectLayers'
import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent, Object3DWithEntity } from '../components/Object3DComponent'
import { PersistTagComponent } from '../components/PersistTagComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { UpdatableComponent } from '../components/UpdatableComponent'
import { Updatable } from '../interfaces/Updatable'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'
import { generateMeshBVH } from '../functions/bvhWorkerPool'
import { SimpleMaterialTagComponent } from '../components/SimpleMaterialTagComponent'
import { useSimpleMaterial, useStandardMaterial } from '../functions/loaders/SimpleMaterialFunctions'
import { isClient } from '../../common/functions/isClient'
import { ReplaceObject3DComponent } from '../components/ReplaceObject3DComponent'
import { Entity } from '../../ecs/classes/Entity'
import { reparentObject3D } from '../functions/ReparentFunction'
import { parseGLTFModel } from '../functions/loadGLTFModel'
import { ModelComponent } from '../components/ModelComponent'

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

export const processObject3d = (entity: Entity) => {
  if (!isClient) return

  const object3DComponent = getComponent(entity, Object3DComponent)
  const shadowComponent = getComponent(entity, ShadowComponent)

  object3DComponent.value.traverse((obj: Mesh) => {
    const material = obj.material as Material
    if (typeof material !== 'undefined') material.dithering = true

    if (shadowComponent) {
      obj.receiveShadow = shadowComponent.receiveShadow
      obj.castShadow = shadowComponent.castShadow
    }

    if (Engine.simpleMaterials) {
      // || Engine.isHMD) {
      useSimpleMaterial(obj)
    } else {
      useStandardMaterial(obj)
    }
  })

  // Generate BVH
  object3DComponent.value.traverse(generateMeshBVH)
}

const sceneObjectQuery = defineQuery([Object3DComponent])
const objectReplaceQuery = defineQuery([ReplaceObject3DComponent])
const simpleMaterialsQuery = defineQuery([SimpleMaterialTagComponent])
const persistQuery = defineQuery([Object3DComponent, PersistTagComponent])
const visibleQuery = defineQuery([Object3DComponent, VisibleComponent])
const updatableQuery = defineQuery([Object3DComponent, UpdatableComponent])

export default async function SceneObjectSystem(world: World): Promise<System> {
  SceneOptions.instance = new SceneOptions()

  return () => {
    for (const entity of sceneObjectQuery.enter()) {
      const obj3d = getComponent(entity, Object3DComponent).value as Object3DWithEntity
      obj3d.entity = entity

      const node = world.entityTree.findNodeFromEid(entity)
      if (node) {
        reparentObject3D(node, node.parentNode)
      } else {
        let found = false
        Engine.scene.traverse((obj) => {
          if (obj === obj3d) {
            found = true
          }
        })

        if (!found) Engine.scene.add(obj3d)
      }

      processObject3d(entity)
    }

    for (const entity of sceneObjectQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent, true).value

      if (!obj3d.parent) console.warn('[Object3DComponent]: Scene object has been removed manually.')

      obj3d.removeFromParent()
    }

    for (const entity of objectReplaceQuery.enter()) {
      const obj3d = getComponent(entity, Object3DComponent)
      const modelComponent = getComponent(entity, ModelComponent)
      const replacementObj = getComponent(entity, ReplaceObject3DComponent)?.replacement.scene

      if (!obj3d || !replacementObj) continue
      ;(replacementObj as any).entity = entity
      replacementObj.parent = obj3d.value.parent

      const parent = obj3d.value.parent!
      const index = parent.children.indexOf(obj3d.value)
      parent.children.splice(index, 1, replacementObj)

      obj3d.value.parent = null
      obj3d.value = replacementObj

      const node = world.entityTree.findNodeFromEid(entity)
      if (node) {
        node.children?.forEach((child) => reparentObject3D(child, node))
      }

      processObject3d(entity)
      parseGLTFModel(entity, modelComponent, obj3d.value)
      removeComponent(entity, ReplaceObject3DComponent)
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
      Engine.simpleMaterials = true
      Engine.scene.traverse((obj) => {
        useSimpleMaterial(obj as Mesh)
      })
    }

    for (const _ of simpleMaterialsQuery.exit()) {
      Engine.simpleMaterials = false
      Engine.scene.traverse((obj) => {
        useStandardMaterial(obj as Mesh)
      })
    }
  }
}
