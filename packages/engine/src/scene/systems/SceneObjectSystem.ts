import { Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isNode } from '../../common/functions/getEnvironment'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState, getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { CallbackComponent } from '../components/CallbackComponent'
import { GroupComponent, Object3DWithEntity } from '../components/GroupComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { useSimpleMaterial, useStandardMaterial } from '../functions/loaders/SimpleMaterialFunctions'

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

  const group = getComponent(entity, GroupComponent) as any as Mesh<any, MeshBasicMaterial>[]
  const shadowComponent = getComponent(entity, ShadowComponent)

  for (const obj of group) {
    const material = obj.material
    if (typeof material !== 'undefined') material.dithering = true

    if (shadowComponent) {
      obj.receiveShadow = shadowComponent.receive
      obj.castShadow = shadowComponent.cast
    }
  }

  updateSimpleMaterials([entity])
}

const updateSimpleMaterials = (sceneObjectEntities: Entity[]) => {
  for (const entity of sceneObjectEntities) {
    const group = getComponent(entity, GroupComponent) as (Object3DWithEntity & Mesh<any, MeshStandardMaterial>)[]
    if (hasComponent(entity, XRUIComponent)) continue

    const simpleMaterials = getEngineState().useSimpleMaterials.value

    let abort = false

    for (const obj of group) {
      if (abort || (obj.entity && hasComponent(entity, XRUIComponent))) {
        abort = true
        return
      }

      if (simpleMaterials) {
        obj.traverse(useSimpleMaterial)
      } else {
        obj.traverse(useStandardMaterial)
      }
    }
  }
}

export default async function SceneObjectSystem(world: World) {
  SceneOptions.instance = new SceneOptions()
  if (isNode) {
    await loadDRACODecoder()
  }

  const sceneObjectQuery = defineQuery([GroupComponent])
  const updatableQuery = defineQuery([GroupComponent, UpdatableComponent, CallbackComponent])

  return () => {
    for (const entity of sceneObjectQuery.exit()) {
      const group = getComponent(entity, GroupComponent, true)
      const layers = Object.values(Engine.instance.currentWorld.objectLayerList)
      for (const obj of group) {
        for (const layer of layers) {
          if (layer.has(obj)) layer.delete(obj)
        }
      }
    }

    // todo: refactor this processing by making all the changes reactive
    for (const entity of sceneObjectQuery()) {
      processObject3d(entity)
    }

    const delta = getState(EngineState).deltaSeconds.value
    for (const entity of updatableQuery()) {
      const callbacks = getComponent(entity, CallbackComponent)
      callbacks.get(UpdatableCallback)?.(delta)
    }
  }
}
