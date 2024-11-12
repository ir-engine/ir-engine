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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { CircleGeometry, Group, Mesh, MeshBasicMaterial, Vector3 } from 'three'

import multiLogger from '@ir-engine/common/src/logger'
import { UserID } from '@ir-engine/common/src/schema.type.module'
import { getComponent, hasComponent, removeComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { defineQuery, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { MediaSettingsState } from '@ir-engine/engine/src/audio/MediaSettingsState'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { applyVideoToTexture } from '@ir-engine/engine/src/scene/functions/applyScreenshareToTexture'
import { getMutableState, getState, none } from '@ir-engine/hyperflux'
import { NetworkObjectComponent, NetworkObjectOwnedTag, NetworkState } from '@ir-engine/network'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { easeOutElastic } from '@ir-engine/spatial/src/common/functions/MathFunctions'
import { InputPointerComponent } from '@ir-engine/spatial/src/input/components/InputPointerComponent'
import { InputState } from '@ir-engine/spatial/src/input/state/InputState'
import { Physics, RaycastArgs } from '@ir-engine/spatial/src/physics/classes/Physics'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@ir-engine/spatial/src/physics/functions/getInteractionGroups'
import { SceneQueryType } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'

import { Not } from '@ir-engine/ecs'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { PeerMediaChannelState } from '../media/PeerMediaChannelState'
import { XruiNameplateComponent } from '../social/components/XruiNameplateComponent'
import AvatarContextMenu from '../user/components/UserMenu/menus/AvatarContextMenu'
import { PopupMenuState } from '../user/components/UserMenu/PopupMenuService'
import { createAvatarDetailView } from './ui/AvatarDetailView'
import { AvatarUIContextMenuState } from './ui/UserMenuView'

const logger = multiLogger.child({ component: 'client-core:systems' })

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()
export const AvatarUITransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

export const AvatarMenus = {
  AvatarContext: 'AvatarContext'
}

export const renderAvatarContextMenu = (userId: UserID, contextMenuEntity: Entity) => {
  const userEntity = AvatarComponent.getUserAvatarEntity(userId)
  if (!userEntity) return

  const contextMenuXRUI = getComponent(contextMenuEntity, XRUIComponent)
  if (!contextMenuXRUI) return

  const userTransform = getComponent(userEntity, TransformComponent)
  const cameraPosition = getComponent(Engine.instance.cameraEntity, TransformComponent).position
  const { avatarHeight } = getComponent(userEntity, AvatarComponent)

  const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)

  contextMenuXRUI.scale.setScalar(Math.max(1, cameraPosition.distanceTo(userTransform.position) / 3))
  contextMenuXRUI.position.copy(userTransform.position)
  contextMenuXRUI.position.y += avatarHeight - 0.3
  contextMenuXRUI.position.x += 0.1
  contextMenuXRUI.position.z += contextMenuXRUI.position.z > cameraPosition.z ? -0.4 : 0.4
  contextMenuXRUI.quaternion.copy(cameraTransform.rotation)
}

const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent]) //, Not(NetworkObjectOwnedTag)])

const _vector3 = new Vector3()

let videoPreviewTimer = 0

const applyingVideo = new Map()

/** XRUI Clickaway */
const onPrimaryClick = () => {
  const state = getMutableState(AvatarUIContextMenuState)
  if (state.id.value !== '') {
    const layer = getComponent(state.ui.entity.value, XRUIComponent)
    const pointerScreenRaycaster = getState(InputState).pointerScreenRaycaster
    const hit = layer.hitTest(pointerScreenRaycaster.ray)
    if (!hit) {
      state.id.set('')
      setVisibleComponent(state.ui.entity.value, false)
    }
  }
}

const interactionGroups = getInteractionGroups(CollisionGroups.Default, CollisionGroups.Avatars)
const raycastComponentData = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(),
  maxDistance: 20,
  groups: interactionGroups
} as RaycastArgs

const onSecondaryClick = () => {
  const physicsWorld = Physics.getWorld(AvatarComponent.getSelfAvatarEntity())
  if (!physicsWorld) return
  const inputPointerEntity = InputPointerComponent.getPointersForCamera(Engine.instance.viewerEntity)[0]
  if (!inputPointerEntity) return
  const pointerPosition = getComponent(inputPointerEntity, InputPointerComponent).position
  const hits = Physics.castRayFromCamera(
    physicsWorld,
    getComponent(Engine.instance.cameraEntity, CameraComponent),
    pointerPosition,
    raycastComponentData
  )
  const state = getMutableState(AvatarUIContextMenuState)
  if (hits.length) {
    const hit = hits[0]
    const hitEntity = hit.body.entity
    if (typeof hitEntity !== 'undefined' && hitEntity !== AvatarComponent.getSelfAvatarEntity()) {
      if (hasComponent(hitEntity, NetworkObjectComponent)) {
        const userId = getComponent(hitEntity, NetworkObjectComponent).ownerId
        state.id.set(userId)
        // setVisibleComponent(state.ui.entity.value, true)
        return // successful hit
      }
    }
  }

  state.id.set('')
}

const execute = () => {
  const viewerEntity = getState(EngineState).viewerEntity
  if (!viewerEntity) return

  const ecsState = getState(ECSState)

  const buttons = InputComponent.getMergedButtons(viewerEntity)

  // const buttons = InputSourceComponent.getMergedButtons()
  if (buttons.PrimaryClick?.down) onPrimaryClick()
  if (buttons.SecondaryClick?.down) onSecondaryClick()

  videoPreviewTimer += ecsState.deltaSeconds
  if (videoPreviewTimer > 1) videoPreviewTimer = 0

  for (const userEntity of userQuery.enter()) {
    if (AvatarUI.has(userEntity)) {
      logger.info({ userEntity }, 'Entity already exists.')
      continue
    }
    const userId = getComponent(userEntity, NetworkObjectComponent).ownerId
    const ui = createAvatarDetailView(userId)
    const transition = createTransitionState(1, 'IN')
    AvatarUITransitions.set(userEntity, transition)
    const root = new Group()
    root.name = `avatar-ui-root-${userEntity}`
    const mesh = ui.state.videoPreviewMesh.value as Mesh<CircleGeometry, MeshBasicMaterial>
    mesh.position.y += 0.3
    mesh.visible = false
    root.add(mesh)
    addObjectToGroup(ui.entity, root)
    AvatarUI.set(userEntity, ui)
  }

  const cameraTransform = getComponent(viewerEntity, TransformComponent)

  const immersiveMedia = getState(MediaSettingsState).immersiveMedia
  const mediaNetwork = NetworkState.mediaNetwork

  /** Render immersive media bubbles */
  for (const userEntity of userQuery()) {
    const ui = AvatarUI.get(userEntity)
    if (!ui) continue
    const transition = AvatarUITransitions.get(userEntity)!
    const { avatarHeight } = getComponent(userEntity, AvatarComponent)
    const userTransform = getComponent(userEntity, TransformComponent)
    const xruiTransform = getComponent(ui.entity, TransformComponent)

    const videoPreviewMesh = ui.state.videoPreviewMesh.value as Mesh<CircleGeometry, MeshBasicMaterial>
    _vector3.copy(userTransform.position).y += avatarHeight + (videoPreviewMesh.visible ? 0.1 : 0.3)

    const dist = cameraTransform.position.distanceTo(_vector3)

    if (dist > 25) transition.setState('OUT')
    if (dist < 20) transition.setState('IN')

    let springAlpha = transition.alpha
    const deltaSeconds = getState(ECSState).deltaSeconds

    transition.update(deltaSeconds, (alpha) => {
      springAlpha = easeOutElastic(alpha)
    })

    xruiTransform.scale.setScalar(1.3 * Math.max(1, dist / 6) * Math.max(springAlpha, 0.001))
    xruiTransform.position.copy(_vector3)
    xruiTransform.rotation.copy(cameraTransform.rotation)

    if (mediaNetwork)
      if (immersiveMedia && videoPreviewTimer === 0) {
        const { ownerId } = getComponent(userEntity, NetworkObjectComponent)
        const peers = mediaNetwork.peers ? Object.values(mediaNetwork.peers) : []
        const peer = peers.find((peer) => {
          return peer.userId === ownerId
        })
        if (peer) {
          const peerMediaState = getState(PeerMediaChannelState)[peer.peerID].cam
          const stream = peerMediaState.videoMediaStream
          if (!stream) continue
          const track = stream.getVideoTracks()[0]
          const active = !peerMediaState.videoStreamPaused
          if (videoPreviewMesh.material.map) {
            if (!active) {
              videoPreviewMesh.material.map = null!
              videoPreviewMesh.visible = false
            }
          } else {
            if (active && !applyingVideo.has(ownerId)) {
              applyingVideo.set(ownerId, true)
              const newVideoTrack = track.clone()
              const newVideo = document.createElement('video')
              newVideo.autoplay = true
              newVideo.id = `${ownerId}_video_immersive`
              newVideo.muted = true
              newVideo.setAttribute('playsinline', 'true')
              newVideo.srcObject = new MediaStream([newVideoTrack])
              newVideo.play()
              if (!newVideo.readyState) {
                newVideo.onloadeddata = () => {
                  applyVideoToTexture(newVideo, videoPreviewMesh, 'fill')
                  videoPreviewMesh.visible = true
                  applyingVideo.delete(ownerId)
                }
              } else {
                applyVideoToTexture(newVideo, videoPreviewMesh, 'fill')
                videoPreviewMesh.visible = true
                applyingVideo.delete(ownerId)
              }
            }
          }
        }
      }

    if (!immersiveMedia && videoPreviewMesh.material.map) {
      videoPreviewMesh.material.map = null!
      videoPreviewMesh.visible = false
    }
  }

  for (const userEntity of userQuery.exit()) {
    const entity = AvatarUI.get(userEntity)?.entity
    if (typeof entity !== 'undefined') removeEntity(entity) // todo - why does this cause a GroupQueryReactor unmount error?
    AvatarUI.delete(userEntity)
    AvatarUITransitions.delete(userEntity)
  }

  const state = getState(AvatarUIContextMenuState)
  if (state.id !== '') {
    renderAvatarContextMenu(state.id as UserID, state.ui.entity)
  }
}

const reactor = () => {
  useEffect(() => {
    getMutableState(PopupMenuState).menus.merge({
      [AvatarMenus.AvatarContext]: AvatarContextMenu
    })

    return () => {
      removeEntity(getState(AvatarUIContextMenuState).ui.entity)
      getMutableState(PopupMenuState).menus[AvatarMenus.AvatarContext].set(none)
    }
  }, [])

  return (
    <>
      <QueryReactor
        Components={[AvatarComponent, TransformComponent, NetworkObjectComponent, Not(NetworkObjectOwnedTag)]}
        ChildEntityReactor={AvatarInstanceReactor}
      />
    </>
  )
}

const AvatarInstanceReactor = () => {
  const avatarEntity = useEntityContext()

  useEffect(() => {
    setComponent(avatarEntity, XruiNameplateComponent)
    return () => {
      removeComponent(avatarEntity, XruiNameplateComponent)
    }
  }, [])
  return null
}

export const AvatarUISystem = defineSystem({
  uuid: 'ee.client.AvatarUISystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute,
  reactor
})
