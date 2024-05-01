/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { BackSide, Color, Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from 'three'

import { Entity } from '@etherealengine/ecs'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { useTexture } from '@etherealengine/engine/src/assets/functions/resourceHooks'
import { GLTFComponent } from '@etherealengine/engine/src/gltf/GLTFComponent'
import { SceneSettingsComponent } from '@etherealengine/engine/src/scene/components/SceneSettingsComponent'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createTransitionState } from '@etherealengine/spatial/src/common/functions/createTransitionState'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { GroupComponent, addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { setObjectLayers } from '@etherealengine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent, setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '@etherealengine/spatial/src/transform/components/ComputedTransformComponent'
import { EntityTreeComponent, useChildWithComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/spatial/src/transform/systems/TransformSystem'
import { XRUIComponent } from '@etherealengine/spatial/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@etherealengine/spatial/src/xrui/functions/ObjectFitFunctions'
import type { WebLayer3D } from '@etherealengine/xrui'
import { AdminClientSettingsState } from '../admin/services/Setting/ClientSettingService'
import { AppThemeState, getAppTheme } from '../common/services/AppThemeState'
import { useRemoveEngineCanvas } from '../hooks/useRemoveEngineCanvas'
import { LocationSceneState, LocationState } from '../social/services/LocationService'
import { AuthState } from '../user/services/AuthService'
import { LoadingSystemState } from './state/LoadingState'
import { createLoaderDetailView } from './ui/LoadingDetailView'

const SCREEN_SIZE = new Vector2()

const transitionPeriodSeconds = 1

export const LoadingUISystemState = defineState({
  name: 'LoadingUISystemState',
  initial: () => {
    const transition = createTransitionState(transitionPeriodSeconds, 'IN')
    const ui = createLoaderDetailView()
    getMutableComponent(ui.entity, InputComponent).grow.set(false)
    setComponent(ui.entity, NameComponent, 'Loading XRUI')

    const meshEntity = createEntity()
    const mesh = new Mesh(
      new SphereGeometry(10),
      new MeshBasicMaterial({ side: BackSide, transparent: true, depthWrite: true, depthTest: false, fog: false })
    )
    mesh.frustumCulled = false

    setComponent(meshEntity, NameComponent, 'Loading XRUI Mesh')

    setComputedTransformComponent(meshEntity, Engine.instance.cameraEntity, () => {
      getComponent(meshEntity, TransformComponent).position.copy(
        getComponent(Engine.instance.cameraEntity, TransformComponent).position
      )
    })

    setComponent(ui.entity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    setComponent(meshEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })

    setComponent(meshEntity, VisibleComponent)
    addObjectToGroup(meshEntity, mesh)
    mesh.renderOrder = 1
    setObjectLayers(mesh, ObjectLayers.UI)

    getComponent(meshEntity, TransformComponent).scale.set(-1, 1, -1)

    return {
      ui,
      meshEntity,
      transition,
      ready: false
    }
  }
})

const LoadingReactor = (props: { sceneEntity: Entity }) => {
  const { sceneEntity } = props
  const loadingProgress = useComponent(props.sceneEntity, GLTFComponent).progress.value
  const sceneLoaded = loadingProgress === 100
  const locationState = useHookstate(getMutableState(LocationState))
  const state = useHookstate(getMutableState(LoadingUISystemState))

  /** Scene is loading */
  useEffect(() => {
    const transition = getState(LoadingUISystemState).transition
    if (transition.state === 'OUT' && state.ready.value && !sceneLoaded) return transition.setState('IN')
  }, [state.ready])

  /** Scene has loaded */
  useEffect(() => {
    if (sceneLoaded && !state.ready.value) state.ready.set(true)
    const transition = getState(LoadingUISystemState).transition
    if (transition.state === 'IN' && sceneLoaded) return transition.setState('OUT')
  }, [sceneLoaded])

  useEffect(() => {
    const xrui = getComponent(state.ui.entity.value, XRUIComponent)
    const progressBar = xrui.getObjectByName('progress-container') as WebLayer3D | undefined
    if (!progressBar) return

    const scaleMultiplier = 0.01
    const centerOffset = 0.05

    progressBar.onBeforeApplyLayout = () => {
      progressBar.domLayout.position.setX(loadingProgress * scaleMultiplier * centerOffset - centerOffset)
      progressBar.domLayout.scale.setX(loadingProgress * scaleMultiplier)
    }

    progressBar.updateMatrixWorld(true)
  }, [loadingProgress])

  useEffect(() => {
    if (locationState.invalidLocation.value || locationState.currentLocation.selfNotAuthorized.value) {
      state.ready.set(true)
      const transition = getState(LoadingUISystemState).transition
      transition.setState('OUT')
      return
    }
  }, [locationState.invalidLocation, locationState.currentLocation.selfNotAuthorized])

  return (
    <>
      {/* {!state.ready.value && <HideCanvas />} */}
      <SceneSettingsReactor sceneEntity={sceneEntity} key={sceneEntity} />
    </>
  )
}

const SceneSettingsReactor = (props: { sceneEntity: Entity }) => {
  const sceneSettingsEntity = useChildWithComponent(props.sceneEntity, SceneSettingsComponent)
  if (!sceneSettingsEntity) return null
  return <SceneSettingsChildReactor entity={sceneSettingsEntity} key={sceneSettingsEntity} />
}

const SceneSettingsChildReactor = (props: { entity: Entity }) => {
  const state = useHookstate(getMutableState(LoadingUISystemState))
  const meshEntity = state.meshEntity.value

  const sceneComponent = useComponent(props.entity, SceneSettingsComponent)
  const [loadingTexture, error] = useTexture(sceneComponent.loadingScreenURL.value, props.entity)

  useEffect(() => {
    if (!loadingTexture) return

    const mesh = getComponent(meshEntity, GroupComponent)[0] as any as Mesh<SphereGeometry, MeshBasicMaterial>
    if (sceneComponent && sceneComponent.loadingScreenURL && mesh.userData.url !== sceneComponent.loadingScreenURL) {
      mesh.userData.url = sceneComponent.loadingScreenURL
    }

    mesh.material.map = loadingTexture
    mesh.material.needsUpdate = true
    mesh.material.map.needsUpdate = true
    getComponent(Engine.instance.viewerEntity, RendererComponent)
      .renderer.compileAsync(mesh, getComponent(Engine.instance.viewerEntity, CameraComponent))
      .then(() => {
        state.ready.set(true)
      })
      .catch((error) => {
        console.error(error)
        state.ready.set(true)
      })
  }, [loadingTexture])

  useEffect(() => {
    if (!error) return

    console.error(error)
    state.ready.set(true)
  }, [error])

  /** Scene data changes */
  useEffect(() => {
    const colors = getState(LoadingUISystemState).ui.state.colors
    colors.main.set(sceneComponent.primaryColor.value)
    colors.background.set(sceneComponent.backgroundColor.value)
    colors.alternate.set(sceneComponent.alternativeColor.value)

    return () => {
      colors.main.set('black')
      colors.background.set('white')
      colors.alternate.set('black')
    }
  }, [sceneComponent])

  return null
}

const HideCanvas = () => {
  useRemoveEngineCanvas()
  return null
}

const mainThemeColor = new Color()
const defaultColor = new Color()

const execute = () => {
  const { transition, ui, meshEntity, ready } = getState(LoadingUISystemState)
  if (!transition) return

  const ecsState = getState(ECSState)

  if (transition.state === 'OUT' && transition.alpha === 0) {
    removeComponent(ui.entity, ComputedTransformComponent)
    return
  }

  const xrui = getComponent(ui.entity, XRUIComponent)

  if (transition.state === 'IN' && transition.alpha === 1) {
    if (!hasComponent(ui.entity, ComputedTransformComponent))
      setComputedTransformComponent(ui.entity, Engine.instance.cameraEntity, () => {
        const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
        const distance = camera.near * 1.1 // 10% in front of camera
        const uiContainer = ui.container.rootLayer.querySelector('#loading-ui')
        if (!uiContainer) return
        const uiSize = uiContainer.domSize
        const screenSize = getComponent(Engine.instance.viewerEntity, RendererComponent).renderer.getSize(SCREEN_SIZE)
        const aspectRatio = screenSize.x / screenSize.y
        const scaleMultiplier = aspectRatio < 1 ? 1 / aspectRatio : 1
        const scale =
          ObjectFitFunctions.computeContentFitScaleForCamera(distance, uiSize.x, uiSize.y, 'contain') *
          0.25 *
          scaleMultiplier
        ObjectFitFunctions.attachObjectInFrontOfCamera(ui.entity, scale, distance)
      })
  }

  // add a slow rotation to animate on desktop, otherwise just keep it static for VR
  // getComponent(Engine.instance.cameraEntity, CameraComponent).rotateY(world.delta * 0.35)

  mainThemeColor.set(ui.state.colors.alternate.value)

  transition.update(ecsState.deltaSeconds, (opacity) => {
    console.log('transition', opacity)
    getMutableState(LoadingSystemState).loadingScreenOpacity.set(opacity)
  })

  const opacity = getState(LoadingSystemState).loadingScreenOpacity
  const isReady = opacity > 0 && true //ready

  setVisibleComponent(meshEntity, isReady)

  const mesh = getComponent(meshEntity, GroupComponent)[0] as any as Mesh<SphereGeometry, MeshBasicMaterial>
  mesh.material.opacity = opacity

  xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as MeshBasicMaterial
    mat.opacity = opacity
    mat.visible = isReady
    layer.visible = isReady
    // mat.color.lerpColors(defaultColor, mainThemeColor, engineState.loadingProgress * 0.01)
    mat.color.copy(mainThemeColor)
  })
  setVisibleComponent(ui.entity, isReady)
}

const reactor = () => {
  const themeState = useHookstate(getMutableState(AppThemeState))
  const themeModes = useHookstate(getMutableState(AuthState).user?.userSetting?.ornull?.themeModes)
  const clientSettings = useHookstate(
    getMutableState(AdminClientSettingsState)?.client?.[0]?.themeSettings?.clientSettings
  )
  const locationSceneID = useHookstate(getMutableState(LocationState).currentLocation.location.sceneId).value
  const sceneEntity = LocationSceneState.useScene(locationSceneID)

  useEffect(() => {
    const theme = getAppTheme()
    if (theme) defaultColor.set(theme!.textColor)
  }, [themeState, themeModes, clientSettings])

  if (!sceneEntity) return null

  return (
    <>
      <LoadingReactor sceneEntity={sceneEntity} key={sceneEntity} />
    </>
  )
}

export const LoadingUISystem = defineSystem({
  uuid: 'ee.client.LoadingUISystem',
  insert: { before: TransformSystem },
  execute,
  reactor
})
