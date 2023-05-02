import { useEffect } from 'react'
import React from 'react'
import {
  Color,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial
} from 'three'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { createGLTFLoader } from '../../assets/functions/createGLTFLoader'
import { loadDRACODecoderNode } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeQuery,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { updateShadowMap } from '../../renderer/functions/RenderSettingsFunction'
import { registerMaterial, unregisterMaterial } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { isMobileXRHeadset } from '../../xr/XRState'
import { CallbackComponent } from '../components/CallbackComponent'
import { createGroupQueryReactor, GroupComponent, Object3DWithEntity } from '../components/GroupComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { EnvironmentSystem } from './EnvironmentSystem'
import { FogSystem } from './FogSystem'
import { ShadowSystem } from './ShadowSystem'

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

export function setupObject(obj: Object3DWithEntity, force = false) {
  const mesh = obj as any as Mesh<any, any>
  mesh.traverse((child: Mesh<any, any>) => {
    if (child.material) {
      if (!child.userData) child.userData = {}
      const shouldMakeSimple = (force || isMobileXRHeadset) && ExpensiveMaterials.has(child.material.constructor)
      if (!force && !isMobileXRHeadset && child.userData.lastMaterial) {
        child.material = child.userData.lastMaterial
        delete child.userData.lastMaterial
      } else if (shouldMakeSimple && !child.userData.lastMaterial) {
        const prevMaterial = child.material
        const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
        const prevMatEntry = unregisterMaterial(prevMaterial)
        const nuMaterial = new MeshLambertMaterial().copy(prevMaterial)
        child.material = nuMaterial
        child.material.color = onlyEmmisive ? new Color('white') : prevMaterial.color
        child.material.map = prevMaterial.map ?? prevMaterial.emissiveMap

        // todo: find out why leaving the envMap makes basic & lambert materials transparent here
        child.material.envMap = null
        child.userData.lastMaterial = prevMaterial
        prevMatEntry && registerMaterial(nuMaterial, prevMatEntry.src)
      }
      child.material.dithering = true
    }
  })
}

const groupQuery = defineQuery([GroupComponent])
const updatableQuery = defineQuery([GroupComponent, UpdatableComponent, CallbackComponent])

function SceneObjectReactor(props: { entity: Entity; obj: Object3DWithEntity }) {
  const { entity, obj } = props

  const shadowComponent = useOptionalComponent(entity, ShadowComponent)
  const renderState = getMutableState(RendererState)
  const forceBasicMaterials = useHookstate(renderState.forceBasicMaterials)
  const csm = useHookstate(renderState.csm)

  useEffect(() => {
    return () => {
      const layers = Object.values(Engine.instance.objectLayerList)
      for (const layer of layers) {
        if (layer.has(obj)) layer.delete(obj)
      }
    }
  }, [])

  useEffect(() => {
    setupObject(obj, forceBasicMaterials.value)
  }, [forceBasicMaterials])

  useEffect(() => {
    const shadow = shadowComponent?.value
    const csm = getState(RendererState).csm
    obj.traverse((child: Mesh<any, Material>) => {
      if (!child.isMesh) return
      child.castShadow = !!shadow?.cast
      child.receiveShadow = !!shadow?.receive
      if (child.material && child.receiveShadow && csm) {
        csm.setupMaterial(child)
      }
    })
  }, [shadowComponent?.cast, shadowComponent?.receive, csm])

  return null
}

/**
 * Group Reactor - responds to any changes in the
 */
const GroupReactor = createGroupQueryReactor(SceneObjectReactor)

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  const delta = getState(EngineState).deltaSeconds
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

const reactor = () => {
  useEffect(() => {
    Engine.instance.gltfLoader = createGLTFLoader()
  }, [])
  return <GroupReactor />
}

export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  execute,
  reactor,
  subSystems: isClient ? [FogSystem, EnvironmentSystem, ShadowSystem] : []
})
