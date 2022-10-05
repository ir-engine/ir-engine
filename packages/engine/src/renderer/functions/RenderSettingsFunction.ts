import { DirectionalLight, Light, LinearToneMapping, Mesh, PCFSoftShadowMap, PerspectiveCamera, Vector3 } from 'three'

import { getState } from '@xrengine/hyperflux'

import { DEFAULT_LOD_DISTANCES } from '../../assets/constants/LoaderConstants'
import { CSM } from '../../assets/csm/CSM'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../common/constants/PrefabFunctionType'
import { isClient } from '../../common/functions/isClient'
import { isHMD } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions, getEngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { DirectionalLightComponent } from '../../scene/components/DirectionalLightComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { EngineRenderer } from '../WebGLRendererSystem'

export const updateShadowMapOnSceneLoad = (enable: boolean, shadowMapType?: number) => {
  if (isHMD) return
  if (getEngineState().sceneLoaded.value) updateShadowMap(enable, shadowMapType)
  else
    matchActionOnce(EngineActions.sceneLoaded.matches, () => {
      updateShadowMap(enable, shadowMapType)
    })
}

export const updateShadowMap = (enable: boolean, shadowMapType?: number) => {
  if (enable) {
    EngineRenderer.instance.renderer.shadowMap.enabled = true
    EngineRenderer.instance.renderer.shadowMap.needsUpdate = true
    if (typeof shadowMapType !== 'undefined') EngineRenderer.instance.renderer.shadowMap.type = shadowMapType
  } else {
    EngineRenderer.instance.renderer.shadowMap.enabled = false
  }

  Engine.instance.currentWorld.scene.traverse((node: Light) => {
    if (node.isLight && node.shadow) {
      node.shadow.map?.dispose()
      node.castShadow = enable
    }
  })
}

export const enableCSM = () => {
  if (!EngineRenderer.instance.csm && EngineRenderer.instance.renderer.shadowMap.enabled) {
    if (getEngineState().sceneLoaded.value) initializeCSM()
    else matchActionOnce(EngineActions.sceneLoaded.matches, initializeCSM)
  }
}

export const initializeCSM = () => {
  if (!isHMD) {
    let activeCSMLight: DirectionalLight | undefined
    if (EngineRenderer.instance.activeCSMLightEntity) {
      activeCSMLight = getComponent(EngineRenderer.instance.activeCSMLightEntity, DirectionalLightComponent).light

      if (hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent))
        removeComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)
    }

    for (const entity of EngineRenderer.instance.directionalLightEntities) {
      const light = getComponent(entity, DirectionalLightComponent)?.light
      if (light) light.castShadow = false
    }

    EngineRenderer.instance.csm = new CSM({
      camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
      parent: Engine.instance.currentWorld.scene,
      light: activeCSMLight
    })

    if (activeCSMLight) {
      activeCSMLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    }

    Engine.instance.currentWorld.scene.traverse((obj: Mesh) => {
      if (typeof obj.material !== 'undefined' && obj.receiveShadow) EngineRenderer.instance.csm.setupMaterial(obj)
    })
    EngineRenderer.instance.isCSMEnabled = true
  }
}

export const disposeCSM = () => {
  if (!EngineRenderer.instance.csm) return

  EngineRenderer.instance.csm.remove()
  EngineRenderer.instance.csm.dispose()
  EngineRenderer.instance.csm = undefined!

  if (EngineRenderer.instance.activeCSMLightEntity) {
    if (!hasComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent)) {
      addComponent(EngineRenderer.instance.activeCSMLightEntity, VisibleComponent, true)
    }
  }

  for (const entity of EngineRenderer.instance.directionalLightEntities) {
    const light = getComponent(entity, DirectionalLightComponent)?.light
    if (light) light.castShadow = getComponent(entity, DirectionalLightComponent).castShadow
  }

  EngineRenderer.instance.isCSMEnabled = false
}
