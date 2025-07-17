/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'

import { Entity, useChildrenWithComponents, useComponent, useOptionalComponent } from '@ir-engine/ecs'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { defineState, getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { EngineState } from '@ir-engine/ecs'
import { AvatarRigComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { CameraSettingsComponent } from '@ir-engine/engine/src/scene/components/CameraSettingsComponent'
import { ReferenceSpaceState } from '@ir-engine/spatial'
import { SpectateEntityState } from '@ir-engine/spatial/src/camera/systems/SpectateSystem'
import { CameraMode } from '@ir-engine/spatial/src/camera/types/CameraMode'
import { useRemoveEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import { useLoadedSceneEntity } from '../hooks/useLoadedSceneEntity'
import { LocationState } from '../social/services/LocationService'
import { LoadingSystemState } from './state/LoadingState'

export const LoadingUISystemState = defineState({
  name: 'LoadingUISystemState',
  initial: () => ({
    ready: false,
    progress: 0
  })
})

const LoadingReactor = (props: { sceneEntity: Entity }) => {
  const { sceneEntity } = props
  const loadingProgress = useComponent(sceneEntity, GLTFComponent).progress.value
  const sceneLoaded = GLTFComponent.useSceneLoaded(sceneEntity)
  const avatarEntity = AvatarComponent.useSelfAvatarEntity()
  const avatarLoaded = AvatarRigComponent.useAvatarLoaded(avatarEntity)
  const userID = useMutableState(EngineState).userID.value
  const spectatorLoaded = !!useMutableState(SpectateEntityState).value[userID]
  const [cameraSettingsEntity] = useChildrenWithComponents(sceneEntity, [CameraSettingsComponent])
  const cameraSettings = useOptionalComponent(cameraSettingsEntity, CameraSettingsComponent)
  const followMode = cameraSettings && cameraSettings?.cameraMode.value === CameraMode.FOLLOW
  const cameraReady = followMode ? avatarLoaded || spectatorLoaded : true
  const viewerReady = cameraReady && sceneLoaded
  const locationState = useMutableState(LocationState)
  const state = useMutableState(LoadingUISystemState)

  useEffect(() => {
    if (!state.ready.value) {
      const sceneProgress = loadingProgress * 0.8
      const avatarProgress = followMode ? (avatarLoaded ? 20 : 0) : 20
      const totalProgress = Math.min(sceneProgress + avatarProgress, 100)

      // Ensure progress never goes backwards
      const currentProgress = state.progress.value
      const newProgress = Math.max(currentProgress, Math.round(totalProgress))

      state.progress.set(newProgress)
    }
  }, [loadingProgress, avatarLoaded, followMode, state.ready.value])

  useEffect(() => {
    if (viewerReady && !state.ready.value) {
      state.progress.set(100)

      setTimeout(() => {
        state.ready.set(true)
        getMutableState(LoadingSystemState).loadingScreenVisible.set(false)
        /** used by the PWA service worker */
        /** @TODO find a better place for this */
        window.dispatchEvent(new Event('load'))
      }, 500) // 500ms delay to ensure camera is properly positioned
    }
  }, [viewerReady])

  useEffect(() => {
    if (locationState.invalidLocation.value || locationState.currentLocation.selfNotAuthorized.value) {
      state.ready.set(true)
      getMutableState(LoadingSystemState).loadingScreenVisible.set(false)
      return
    }
  }, [locationState.invalidLocation, locationState.currentLocation.selfNotAuthorized])

  useEffect(() => {
    getMutableState(LoadingSystemState).loadingScreenVisible.set(!state.ready.value)
  }, [state.ready.value])

  useEffect(() => {
    const container = document.getElementById('location-container')
    if (!container) return

    if (state.ready.value) {
      container.style.transition = 'opacity 0.5s ease-in-out'
      container.style.opacity = '1'
    } else {
      container.style.transition = 'none'
      container.style.opacity = '0'
    }
  }, [state.ready.value])

  useEffect(() => {
    const container = document.getElementById('location-container')
    if (container) {
      container.style.opacity = '0'
    }
  }, [])

  return <>{!state.ready.value && <HideCanvas />}</>
}

const HideCanvas = () => {
  useRemoveEngineCanvas()
  return null
}

const execute = () => {}

const Reactor = () => {
  const locationSceneURL = useHookstate(getMutableState(LocationState).currentLocation.location.sceneURL).value
  const sceneEntity = useLoadedSceneEntity(locationSceneURL)

  if (!sceneEntity) return null

  return (
    <>
      <LoadingReactor sceneEntity={sceneEntity} key={sceneEntity} />
    </>
  )
}

export const LoadingUISystem = defineSystem({
  uuid: 'ee.client.LoadingUISystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute,
  reactor: () => {
    const viewerEntity = useMutableState(ReferenceSpaceState).viewerEntity.value

    if (!viewerEntity) return null
    return <Reactor key={viewerEntity} />
  }
})
