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

import getImagePalette from 'image-palette-core'
import React, { useEffect } from 'react'
import { BackSide, Color, CompressedTexture, Mesh, MeshBasicMaterial, SphereGeometry, Texture, Vector2 } from 'three'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import createReadableTexture from '@etherealengine/engine/src/assets/functions/createReadableTexture'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { setVisibleComponent, VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import { setObjectLayers } from '@etherealengine/engine/src/scene/functions/setObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { XRUIComponent } from '@etherealengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@etherealengine/engine/src/xrui/functions/createTransitionState'
import { ObjectFitFunctions } from '@etherealengine/engine/src/xrui/functions/ObjectFitFunctions'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import type { WebLayer3D } from '@etherealengine/xrui'

import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addObjectToGroup, GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { PortalState } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { SceneID } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { TransformSystem } from '@etherealengine/engine/src/transform/systems/TransformSystem'
import { AdminClientSettingsState } from '../admin/services/Setting/ClientSettingService'
import { AppThemeState, getAppTheme } from '../common/services/AppThemeState'
import { AuthState } from '../user/services/AuthService'
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

    const meshEntity = createEntity()
    const mesh = new Mesh(
      new SphereGeometry(10),
      new MeshBasicMaterial({ side: BackSide, transparent: true, depthWrite: true, depthTest: false })
    )

    mesh.renderOrder = 1
    setObjectLayers(mesh, ObjectLayers.UI)

    setComputedTransformComponent(meshEntity, Engine.instance.cameraEntity, () => {
      getComponent(meshEntity, TransformComponent).position.copy(
        getComponent(Engine.instance.cameraEntity, TransformComponent).position
      )
    })

    setComponent(meshEntity, VisibleComponent)
    addObjectToGroup(meshEntity, mesh)

    getComponent(meshEntity, TransformComponent).scale.set(-1, 1, -1)

    return {
      ui,
      meshEntity,
      transition
    }
  }
})

/** Scene Colors */
function setDefaultPalette() {
  const uiState = getState(LoadingUISystemState).ui.state
  const colors = uiState.colors
  colors.main.set('black')
  colors.background.set('white')
  colors.alternate.set('black')
}

const setColors = (image: HTMLImageElement) => {
  const uiState = getState(LoadingUISystemState).ui.state
  const colors = uiState.colors
  const palette = getImagePalette(image)
  if (palette) {
    colors.main.set(palette.color)
    colors.background.set(palette.backgroundColor)
    colors.alternate.set(palette.alternativeColor)
  }
}

function LoadingReactor(props: { activeScene: SceneID }) {
  const loadingProgress = useHookstate(getMutableState(SceneState).scenes[props.activeScene].loadingProgress)
  const sceneLoaded = loadingProgress.value === 100
  const userReady = useHookstate(getMutableState(EngineState).userReady)
  const state = useHookstate(getMutableState(LoadingUISystemState))
  const meshEntity = state.meshEntity.value

  /** Handle loading state changes */
  useEffect(() => {
    const transition = getState(LoadingUISystemState).transition
    if (transition.state === 'OUT' && !sceneLoaded && !userReady.value) {
      console.log('TRANSITIONING IN')
      return transition.setState('IN')
    }
    if (transition.state === 'IN' && userReady.value && sceneLoaded) {
      console.log('TRANSITIONING OUT')
      return transition.setState('OUT')
    }
  }, [userReady, sceneLoaded])

  /** Scene data changes */
  useEffect(() => {
    const sceneData = SceneState.getSceneMetadata(props.activeScene)
    if (!sceneData) return
    const envmapURL = sceneData.thumbnailUrl.replace('thumbnail.ktx2', 'loadingscreen.ktx2')
    const mesh = getComponent(meshEntity, GroupComponent)[0] as any as Mesh<SphereGeometry, MeshBasicMaterial>
    if (envmapURL && mesh.userData.url !== envmapURL) {
      mesh.userData.url = envmapURL
      setDefaultPalette()

      /** Load envmap and parse colours */
      AssetLoader.load(
        envmapURL,
        {},
        (texture: Texture | CompressedTexture) => {
          mesh.material.map = texture
          const compressedTexture = texture as CompressedTexture
          if (compressedTexture.isCompressedTexture) {
            try {
              createReadableTexture(compressedTexture).then((texture: Texture) => {
                const image = texture.image
                setColors(image)
                texture.dispose()
              })
            } catch (e) {
              console.error(e)
              setDefaultPalette()
            }
          } else {
            const image = texture.image
            setColors(image)
          }
        },
        undefined,
        (error: ErrorEvent) => {
          console.error(error)
          setDefaultPalette()
        }
      )
    }
  }, [])

  useEffect(() => {
    const xrui = getComponent(state.ui.entity.value, XRUIComponent)
    const progressBar = xrui.getObjectByName('progress-container') as WebLayer3D | undefined
    if (!progressBar) return

    const percentage = loadingProgress.value
    const scaleMultiplier = 0.01
    const centerOffset = 0.05

    progressBar.onBeforeApplyLayout = () => {
      progressBar.domLayout.position.setX(percentage * scaleMultiplier * centerOffset - centerOffset)
      progressBar.domLayout.scale.setX(percentage * scaleMultiplier)
    }

    progressBar.updateMatrixWorld(true)
  }, [loadingProgress])

  return null
}

const mainThemeColor = new Color()
const defaultColor = new Color()

const execute = () => {
  const { transition, ui, meshEntity } = getState(LoadingUISystemState)
  if (!transition) return

  const engineState = getState(EngineState)

  if (transition.state === 'OUT' && transition.alpha === 0) {
    removeComponent(ui.entity, ComputedTransformComponent)
    return
  }

  const xrui = getComponent(ui.entity, XRUIComponent)

  if (transition.state === 'IN' && transition.alpha === 1) {
    if (!hasComponent(ui.entity, ComputedTransformComponent))
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

  // add a slow rotation to animate on desktop, otherwise just keep it static for VR
  // getComponent(Engine.instance.cameraEntity, CameraComponent).rotateY(world.delta * 0.35)

  mainThemeColor.set(ui.state.colors.alternate.value)

  transition.update(engineState.deltaSeconds, (opacity) => {
    getMutableState(LoadingSystemState).loadingScreenOpacity.set(opacity)
  })

  const opacity = getState(LoadingSystemState).loadingScreenOpacity
  const ready = opacity > 0

  setVisibleComponent(meshEntity, ready)

  const mesh = getComponent(meshEntity, GroupComponent)[0] as any as Mesh<SphereGeometry, MeshBasicMaterial>
  mesh.material.opacity = opacity

  xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as MeshBasicMaterial
    mat.opacity = opacity
    mat.visible = ready
    layer.visible = ready
    mat.color.copy(mainThemeColor)
  })
  setVisibleComponent(ui.entity, ready)
}

const reactor = () => {
  const themeState = useHookstate(getMutableState(AppThemeState))
  const themeModes = useHookstate(getMutableState(AuthState).user?.userSetting?.ornull?.themeModes)
  const clientSettings = useHookstate(
    getMutableState(AdminClientSettingsState)?.client?.[0]?.themeSettings?.clientSettings
  )
  const activeScene = useHookstate(getMutableState(SceneState).activeScene).value
  const activePortalEntity = useHookstate(getMutableState(PortalState).activePortalEntity).value

  useEffect(() => {
    const theme = getAppTheme()
    if (theme) defaultColor.set(theme!.textColor)
  }, [themeState, themeModes, clientSettings])

  useEffect(() => {
    // return () => {
    //   const { ui, mesh } = getState(LoadingUISystemState)
    //   removeEntity(ui.entity)
    //   mesh.removeFromParent()
    //   getMutableState(LoadingUISystemState).set({
    //     ui: null!,
    //     mesh: null!,
    //     transition: null!
    //   })
    // }
  }, [])

  return <>{activeScene && !activePortalEntity && <LoadingReactor key={activeScene} activeScene={activeScene} />}</>
}

export const LoadingUISystem = defineSystem({
  uuid: 'ee.client.LoadingUISystem',
  insert: { before: TransformSystem },
  execute,
  reactor
})
