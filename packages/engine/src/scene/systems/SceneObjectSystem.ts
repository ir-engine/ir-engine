import { Not } from 'bitecs'
import { useEffect } from 'react'
import { Color, Mesh, MeshBasicMaterial, MeshPhongMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

import { getState, useHookstate } from '@xrengine/hyperflux'

import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isNode } from '../../common/functions/getEnvironment'
import { isClient } from '../../common/functions/isClient'
import { isHMD } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeQuery,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { XRState } from '../../xr/XRState'
import { CallbackComponent } from '../components/CallbackComponent'
import { GroupComponent, Object3DWithEntity } from '../components/GroupComponent'
import { SceneTagComponent } from '../components/SceneTagComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import FogSystem from './FogSystem'
import ShadowSystem from './ShadowSystem'

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])

/** @todo reimplement BPCEM */
const applyBPCEM = (material) => {
  // SceneOptions needs to be replaced with a proper state
  // if (!material.userData.hasBoxProjectionApplied && SceneOptions.instance.boxProjection) {
  //   addOBCPlugin(
  //     material,
  //     beforeMaterialCompile(
  //       SceneOptions.instance.bpcemOptions.bakeScale,
  //       SceneOptions.instance.bpcemOptions.bakePositionOffset
  //     )
  //   )
  //   material.userData.hasBoxProjectionApplied = true
  // }
}

export default async function SceneObjectSystem(world: World) {
  if (isNode) {
    await loadDRACODecoder()
  }

  const groupQuery = defineQuery([GroupComponent])
  const updatableQuery = defineQuery([GroupComponent, UpdatableComponent, CallbackComponent])

  const reactorSystem = startQueryReactor([GroupComponent, Not(SceneTagComponent), VisibleComponent], function (props) {
    const entity = props.root.entity

    useEffect(() => {
      /** ensure that hmd has no heavy materials */
      if (isHMD) {
        // this code seems to have a race condition where a small percentage of the time, materials end up being fully transparent
        for (const object of getOptionalComponent(entity, GroupComponent) ?? [])
          object.traverse((obj: Mesh<any, any>) => {
            if (obj.material)
              if (ExpensiveMaterials.has(obj.material.constructor)) {
                const prevMaterial = obj.material
                const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
                prevMaterial.dispose()
                obj.material = new MeshBasicMaterial().copy(prevMaterial)
                obj.material.color = onlyEmmisive ? new Color('white') : prevMaterial.color
                obj.material.map = prevMaterial.map ?? prevMaterial.emissiveMap

                // todo: find out why leaving the envMap makes basic & lambert materials transparent here
                obj.material.envMap = null
              }
          })
      }
    }, [])

    return null
  })

  const addedToGroup = (obj) => {
    const material = obj.material
    if (typeof material !== 'undefined') {
      material.dithering = true
      if (obj.material?.userData && obj.receiveShadow) EngineRenderer.instance.csm?.setupMaterial(obj)
    }
  }

  /**
   * Group Reactor System
   * responds to any changes in the
   */
  const groupReactorSystem = startQueryReactor([GroupComponent], function (props) {
    const entity = props.root.entity
    if (!hasComponent(entity, GroupComponent)) throw props.root.stop()

    const groupComponent = useOptionalComponent(entity, GroupComponent)
    const visibleComponent = useOptionalComponent(entity, VisibleComponent)
    const shadowComponent = useOptionalComponent(entity, ShadowComponent)
    const _groups = useHookstate([] as Object3DWithEntity[])

    useEffect(() => {
      const length = groupComponent?.value?.length ?? 0
      const addedGroup = length > _groups.value.length
      const removedGroup = length < _groups.value.length

      if (addedGroup && groupComponent?.value) {
        for (const obj of groupComponent.value) {
          if (!_groups.value.includes(obj)) {
            addedToGroup(obj)
          }
        }
      }

      if (removedGroup) {
        const layers = Object.values(Engine.instance.currentWorld.objectLayerList)
        for (const obj of _groups.value) {
          if (!groupComponent?.value.includes(obj)) {
            for (const layer of layers) {
              if (layer.has(obj)) layer.delete(obj)
            }
          }
        }
      }

      groupComponent?.value ? _groups.set([...groupComponent.value]) : _groups.set([])

      return () => {
        const layers = Object.values(Engine.instance.currentWorld.objectLayerList)
        for (const obj of _groups.value) {
          for (const layer of layers) {
            if (layer.has(obj)) layer.delete(obj)
          }
        }
      }
    }, [groupComponent])

    useEffect(() => {
      if (groupComponent?.value) {
        if (shadowComponent?.value)
          for (const obj of groupComponent.value) {
            obj.castShadow = shadowComponent.cast.value
            obj.receiveShadow = shadowComponent.receive.value
          }
      }
    }, [shadowComponent, groupComponent])

    return null
  })

  const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

  const execute = () => {
    const delta = getState(EngineState).deltaSeconds.value
    for (const entity of updatableQuery()) {
      const callbacks = getComponent(entity, CallbackComponent)
      callbacks.get(UpdatableCallback)?.(delta)
    }

    for (const entity of groupQuery()) {
      const group = getComponent(entity, GroupComponent)
      /**
       * do frustum culling here, but only if the object is more than 5 units away
       */
      const visible =
        hasComponent(entity, VisibleComponent) &&
        !(
          FrustumCullCameraComponent.isCulled[entity] &&
          DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr
        )
      for (const obj of group) obj.visible = visible
    }
  }

  const cleanup = async () => {
    removeQuery(world, groupQuery)
    removeQuery(world, updatableQuery)
  }

  const subsystems = [() => Promise.resolve({ default: FogSystem })]
  if (isClient) subsystems.push(() => Promise.resolve({ default: ShadowSystem }))

  return {
    execute,
    cleanup,
    subsystems
  }
}
