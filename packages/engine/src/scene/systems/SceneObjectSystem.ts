import { BufferGeometry, Material, Mesh, Vector3 } from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isNode } from '../../common/functions/getEnvironment'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, EngineState, getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { CallbackComponent } from '../components/CallbackComponent'
import { GroupComponent } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SimpleMaterialTagComponent } from '../components/SimpleMaterialTagComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { useSimpleMaterial, useStandardMaterial } from '../functions/loaders/SimpleMaterialFunctions'
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

  const group = getComponent(entity, GroupComponent).value
  const shadowComponent = getComponent(entity, ShadowComponent)
  group.name = getComponent(entity, NameComponent)?.name ?? ''

  group.traverse((obj: Mesh<any, Material>) => {
    const material = obj.material
    if (typeof material !== 'undefined') material.dithering = true

    if (shadowComponent) {
      obj.receiveShadow = shadowComponent.receive
      obj.castShadow = shadowComponent.cast
    }
  })

  updateSimpleMaterials([entity])
}

const updateSimpleMaterials = (sceneObjectEntities: Entity[]) => {
  for (const entity of sceneObjectEntities) {
    const group = getComponent(entity, GroupComponent).value
    if (hasComponent(entity, XRUIComponent)) return

    const simpleMaterials =
      hasComponent(entity, SimpleMaterialTagComponent) || getEngineState().useSimpleMaterials.value

    let abort = false

    group.traverse((obj: any) => {
      if (abort || (obj.entity && hasComponent(entity, XRUIComponent))) {
        abort = true
        return
      }
      if (simpleMaterials) {
        useSimpleMaterial(obj)
      } else {
        useStandardMaterial(obj)
      }
    })
  }
}

export default async function SceneObjectSystem(world: World) {
  SceneOptions.instance = new SceneOptions()
  if (isNode) {
    await loadDRACODecoder()
  }

  const sceneObjectQuery = defineQuery([GroupComponent])
  const updatableQuery = defineQuery([GroupComponent, UpdatableComponent])

  const useSimpleMaterialsActionQueue = createActionQueue(EngineActions.useSimpleMaterials.matches)

  return () => {
    for (const entity of sceneObjectQuery.exit()) {
      const obj3d = getComponent(entity, GroupComponent, true).value
      const layers = Object.values(Engine.instance.currentWorld.objectLayerList)
      for (const layer of layers) {
        if (layer.has(obj3d)) layer.delete(obj3d)
      }
      obj3d.traverse((mesh: Mesh) => {
        if (typeof (mesh.material as Material)?.dispose === 'function') (mesh.material as Material)?.dispose()
        if (typeof (mesh.geometry as BufferGeometry)?.dispose === 'function')
          (mesh.geometry as BufferGeometry)?.dispose()
      })
    }

    for (const entity of sceneObjectQuery.enter()) {
      const group = getComponent(entity, GroupComponent).value
      group.entity = entity
      Engine.instance.currentWorld.scene.add(group)
      processObject3d(entity)
    }

    for (const action of useSimpleMaterialsActionQueue()) {
      const sceneObjectEntities = sceneObjectQuery()
      updateSimpleMaterials(sceneObjectEntities)
    }

    const delta = getState(EngineState).deltaSeconds.value
    for (const entity of updatableQuery()) {
      const obj = getComponent(entity, GroupComponent)?.value as unknown as Updatable
      obj?.update(delta)
      const callbacks = getComponent(entity, CallbackComponent)
      callbacks[UpdatableCallback]?.(delta)
    }
  }
}
