import {
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Vector3
} from 'three'

import { getState } from '@xrengine/hyperflux'

import { loadDRACODecoder } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isNode } from '../../common/functions/getEnvironment'
import { isClient } from '../../common/functions/isClient'
import { isHMD, isMobileOrHMD } from '../../common/functions/isMobile'
import { addOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import MeshPhysicalMaterial from '../../renderer/materials/constants/material-prototypes/MeshPhysicalMaterial.mat'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { XRState } from '../../xr/XRState'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { beforeMaterialCompile } from '../classes/BPCEMShader'
import { CallbackComponent } from '../components/CallbackComponent'
import { GroupComponent, Object3DWithEntity } from '../components/GroupComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'

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

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])

const updateObject = (entity: Entity) => {
  const group = getComponent(entity, GroupComponent) as (Object3DWithEntity & Mesh<any, MeshStandardMaterial>)[]
  const shadowComponent = getComponent(entity, ShadowComponent)

  for (const obj of group) {
    const material = obj.material
    if (typeof material !== 'undefined') material.dithering = true

    if (shadowComponent) {
      obj.receiveShadow = shadowComponent.receive
      obj.castShadow = shadowComponent.cast
    }
  }
  if (isHMD) return

  if (hasComponent(entity, XRUIComponent)) return

  let abort = false

  for (const obj of group) {
    if (abort || (obj.entity && hasComponent(entity, XRUIComponent))) {
      abort = true
      return
    }

    obj.traverse(applyMaterial)
  }
}

const applyMaterial = (obj: Mesh<any, any>) => {
  if (!obj.material?.userData) return
  const material = obj.material

  // BPCEM
  if (!material.userData.hasBoxProjectionApplied && SceneOptions.instance.boxProjection) {
    addOBCPlugin(
      material,
      beforeMaterialCompile(
        SceneOptions.instance.bpcemOptions.bakeScale,
        SceneOptions.instance.bpcemOptions.bakePositionOffset
      )
    )
    material.userData.hasBoxProjectionApplied = true
  }

  material.envMapIntensity = SceneOptions.instance.envMapIntensity

  if (obj.receiveShadow) EngineRenderer.instance.csm?.setupMaterial(obj)
}

export default async function SceneObjectSystem(world: World) {
  SceneOptions.instance = new SceneOptions()
  if (isNode) {
    await loadDRACODecoder()
  }

  const sceneObjectQuery = defineQuery([GroupComponent])
  const updatableQuery = defineQuery([GroupComponent, UpdatableComponent, CallbackComponent])

  const xrState = getState(XRState)

  const execute = () => {
    for (const entity of sceneObjectQuery.exit()) {
      const group = getComponent(entity, GroupComponent, true)
      const layers = Object.values(Engine.instance.currentWorld.objectLayerList)
      for (const obj of group) {
        for (const layer of layers) {
          if (layer.has(obj)) layer.delete(obj)
        }
      }
    }

    /** ensure that hmd has no heavy materials */
    if (isHMD || xrState.is8thWallActive.value) {
      // this code seems to have a race condition where a small percentage of the time, materials end up being fully transparent
      world.scene.traverse((obj: Mesh<any, any>) => {
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

    if (isClient) for (const entity of sceneObjectQuery()) updateObject(entity)

    const delta = getState(EngineState).deltaSeconds.value
    for (const entity of updatableQuery()) {
      const callbacks = getComponent(entity, CallbackComponent)
      callbacks.get(UpdatableCallback)?.(delta)
    }
  }

  const cleanup = async () => {
    removeQuery(world, sceneObjectQuery)
    removeQuery(world, updatableQuery)
  }

  const subsystems = [() => import('./FogSystem')]
  if (isClient) subsystems.push(() => import('./ShadowSystem'))

  return {
    execute,
    cleanup,
    subsystems
  }
}
