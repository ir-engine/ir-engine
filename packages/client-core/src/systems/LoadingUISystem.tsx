import getImagePalette from 'image-palette-core'
import { useEffect } from 'react'
import React from 'react'
import {
  CompressedTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Texture,
  Vector2,
  Vector3
} from 'three'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@etherealengine/engine/src/assets/functions/createReadableTexture'
import { AppLoadingState, AppLoadingStates } from '@etherealengine/engine/src/common/AppLoadingService'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  addComponent,
  getComponent,
  removeComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { setObjectLayers } from '@etherealengine/engine/src/scene/functions/setObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { XRUIComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@etherealengine/engine/src/xrui/functions/createTransitionState'
import { ObjectFitFunctions } from '@etherealengine/engine/src/xrui/functions/ObjectFitFunctions'
import { defineActionQueue, defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import type { WebLayer3D } from '@etherealengine/xrui'

import { LoadingSystemState } from './state/LoadingState'
import { createLoaderDetailView } from './ui/LoadingDetailView'

const SCREEN_SIZE = new Vector2()

const transitionPeriodSeconds = 1

const LoadingUISystemState = defineState({
  name: 'LoadingUISystemState',
  initial: () => {
    const transition = createTransitionState(transitionPeriodSeconds, 'IN')
    const ui = createLoaderDetailView()
    addComponent(ui.entity, NameComponent, 'Loading XRUI')

    const mesh = new Mesh(
      new SphereGeometry(10),
      new MeshBasicMaterial({ side: DoubleSide, transparent: true, depthWrite: true, depthTest: false })
    )
    mesh.visible = false

    // flip inside out
    mesh.scale.set(-1, 1, 1)
    mesh.renderOrder = 1
    Engine.instance.camera.add(mesh)
    setObjectLayers(mesh, ObjectLayers.UI)

    return {
      ui,
      mesh,
      transition
    }
  }
})

function SceneDataReactor() {
  const sceneData = useHookstate(getMutableState(SceneState).sceneData)
  const state = useHookstate(getMutableState(LoadingUISystemState))
  const mesh = state.mesh.value

  function setDefaultPalette() {
    const uiState = getState(LoadingUISystemState).ui.state
    const colors = uiState.colors
    colors.main.set('black')
    colors.background.set('white')
    colors.alternate.set('black')
  }

  const setColors = (texture: Texture) => {
    const image = texture.image as HTMLImageElement
    const uiState = getState(LoadingUISystemState).ui.state
    const colors = uiState.colors
    const palette = getImagePalette(image)
    if (palette) {
      colors.main.set(palette.color)
      colors.background.set(palette.backgroundColor)
      colors.alternate.set(palette.alternativeColor)
    }
  }

  useEffect(() => {
    if (!sceneData.value) return
    const thumbnailUrl = sceneData.value.thumbnailUrl
      .replace('thumbnail.jpeg', 'envmap.png')
      .replace('thumbnail.ktx2', 'envmap.ktx2')
    if (thumbnailUrl && mesh.userData.url !== thumbnailUrl) {
      mesh.userData.url = thumbnailUrl
      setDefaultPalette()
      AssetLoader.load(thumbnailUrl, {}, (texture: Texture | CompressedTexture) => {
        const compressedTexture = texture as CompressedTexture
        if (compressedTexture.isCompressedTexture) {
          createReadableTexture(compressedTexture).then((texture: Texture) => {
            setColors(texture)
          })
          if (texture) mesh.material.map = texture
          mesh.visible = true
        } else {
          setColors(texture)
          if (texture) mesh.material.map = texture
          mesh.visible = true
        }
      })
    }
  }, [sceneData])

  return null
}

const avatarModelChangedQueue = defineActionQueue(EngineActions.avatarModelChanged.matches)
const spectateUserQueue = defineActionQueue(EngineActions.spectateUser.matches)

function LoadingReactor() {
  const loadingState = useHookstate(getMutableState(AppLoadingState))

  useEffect(() => {
    if (loadingState.state.value === AppLoadingStates.SCENE_LOADING) {
      getState(LoadingUISystemState).transition.setState('IN')
    }
    if (loadingState.state.value === AppLoadingStates.FAIL) {
      getState(LoadingUISystemState).transition.setState('OUT')
    }
  }, [loadingState.state])

  return null
}

const execute = () => {
  const { transition, ui, mesh } = getState(LoadingUISystemState)
  if (!transition) return

  const appLoadingState = getState(AppLoadingState)
  const engineState = getState(EngineState)

  for (const action of spectateUserQueue()) {
    if (appLoadingState.state === AppLoadingStates.SUCCESS && engineState.sceneLoaded) transition.setState('OUT')
  }

  for (const action of avatarModelChangedQueue()) {
    if (
      (action.entity === Engine.instance.localClientEntity || engineState.spectating) &&
      appLoadingState.state === AppLoadingStates.SUCCESS &&
      engineState.sceneLoaded
    )
      transition.setState('OUT')
  }

  if (transition.state === 'OUT' && transition.alpha === 0) {
    removeComponent(ui.entity, ComputedTransformComponent)
    return
  }

  const xrui = getComponent(ui.entity, XRUIComponent)

  if (transition.state === 'IN' && transition.alpha === 1) {
    setComputedTransformComponent(ui.entity, Engine.instance.cameraEntity, () => {
      const distance = 0.1
      const uiContainer = ui.container.rootLayer.querySelector('#loading-ui')
      if (!uiContainer) return
      const uiSize = uiContainer.domSize
      const screenSize = EngineRenderer.instance.renderer.getSize(SCREEN_SIZE)
      const aspectRatio = screenSize.x / screenSize.y
      const scaleMultiplier = aspectRatio < 1 ? 1 / aspectRatio : 1
      const scale =
        ObjectFitFunctions.computeContentFitScaleForCamera(distance, uiSize.x, uiSize.y, 'contain') *
        0.25 *
        scaleMultiplier
      ObjectFitFunctions.attachObjectInFrontOfCamera(ui.entity, scale, distance)
    })
  }

  mesh.quaternion.copy(Engine.instance.camera.quaternion).invert()

  // add a slow rotation to animate on desktop, otherwise just keep it static for VR
  // if (!getState(EngineState).joinedWorld) {
  //   Engine.instance.camera.rotateY(world.delta * 0.35)
  // } else {
  //   // todo: figure out how to make this work properly for VR #7256
  // }

  const loadingState = getState(LoadingSystemState).loadingScreenOpacity

  transition.update(Engine.instance.deltaSeconds, (opacity) => {
    if (opacity !== loadingState) getMutableState(LoadingSystemState).loadingScreenOpacity.set(opacity)
    mesh.material.opacity = opacity
    mesh.visible = opacity > 0 && !!mesh.material.map
    xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = opacity
      mat.visible = opacity > 0
      layer.visible = opacity > 0
    })
    if (opacity < 0.001) setVisibleComponent(ui.entity, false)
  })
}

const reactor = () => {
  useEffect(() => {
    return () => {
      const { ui, mesh } = getState(LoadingUISystemState)

      removeEntity(ui.entity)
      mesh.removeFromParent()

      getMutableState(LoadingUISystemState).set({
        ui: null!,
        mesh: null!,
        transition: null!
      })
    }
  }, [])

  return (
    <>
      <SceneDataReactor />
      <LoadingReactor />
    </>
  )
}

export const LoadingUISystem = defineSystem({
  uuid: 'ee.client.LoadingUISystem',
  execute,
  reactor
})
