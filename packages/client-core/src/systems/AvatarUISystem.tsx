import { Not } from 'bitecs'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { CircleBufferGeometry, DoubleSide, Mesh, MeshBasicMaterial, Object3D, Vector3, VideoTexture } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '@xrengine/engine/src/networking/components/NetworkObjectOwnedTag'
import { MediaSettingsState } from '@xrengine/engine/src/networking/MediaSettingsState'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { applyVideoToTexture } from '@xrengine/engine/src/scene/functions/applyScreenshareToTexture'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { ObjectFitFunctions } from '@xrengine/engine/src/xrui/functions/ObjectFitFunctions'
import { getState } from '@xrengine/hyperflux'

import { createAvatarDetailView } from './ui/AvatarDetailView'
import { createAvatarContextMenuView } from './ui/UserMenuView'

const logger = multiLogger.child({ component: 'client-core:systems' })

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()

export const renderAvatarContextMenu = (world: World, userId: UserId, contextMenuEntity: Entity) => {
  const userEntity = world.getUserAvatarEntity(userId)
  if (!userEntity) return

  const contextMenuXRUI = getComponent(contextMenuEntity, XRUIComponent)
  if (!contextMenuXRUI) return

  const userTransform = getComponent(userEntity, TransformComponent)
  const { avatarHeight } = getComponent(userEntity, AvatarComponent)

  contextMenuXRUI.container.scale.setScalar(
    Math.max(1, Engine.instance.currentWorld.camera.position.distanceTo(userTransform.position) / 3)
  )
  contextMenuXRUI.container.position.copy(userTransform.position)
  contextMenuXRUI.container.position.y += avatarHeight - 0.3
  contextMenuXRUI.container.position.x += 0.1
  contextMenuXRUI.container.position.z +=
    contextMenuXRUI.container.position.z > Engine.instance.currentWorld.camera.position.z ? -0.4 : 0.4
  contextMenuXRUI.container.rotation.setFromRotationMatrix(Engine.instance.currentWorld.camera.matrix)
}

export default async function AvatarUISystem(world: World) {
  const userQuery = defineQuery([
    AvatarComponent,
    TransformComponent,
    NetworkObjectComponent,
    Not(NetworkObjectOwnedTag)
  ])
  const AvatarContextMenuUI = createAvatarContextMenuView()

  const vector3 = new Vector3()

  let videoPreviewTimer = 0

  return () => {
    videoPreviewTimer += world.deltaSeconds
    if (videoPreviewTimer > 1) videoPreviewTimer = 0

    const mediaState = getState(MediaSettingsState)

    for (const userEntity of userQuery.enter()) {
      if (AvatarUI.has(userEntity)) {
        logger.info({ userEntity }, 'Entity already exists.')
        continue
      }
      const userId = getComponent(userEntity, NetworkObjectComponent).ownerId
      const ui = createAvatarDetailView(userId)
      const uiObject = getComponent(ui.entity, Object3DComponent)
      const videoPreviewMesh = new Mesh(new CircleBufferGeometry(0.25, 32), new MeshBasicMaterial())
      videoPreviewMesh.position.y += 0.3
      videoPreviewMesh.visible = false
      uiObject.value.add(videoPreviewMesh)
      uiObject.value.userData.videoPreviewMesh = videoPreviewMesh
      AvatarUI.set(userEntity, ui)
    }

    for (const userEntity of userQuery()) {
      const ui = AvatarUI.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const xrui = getComponent(ui.entity, XRUIComponent)

      const uiObject = getComponent(ui.entity, Object3DComponent)
      const videoPreviewMesh = uiObject.value.userData.videoPreviewMesh

      vector3.copy(userTransform.position).y += avatarHeight + (videoPreviewMesh.visible ? 0.1 : 0.3)
      ObjectFitFunctions.lookAtCameraFromPosition(xrui.container, vector3)

      if (
        mediaState.immersiveMediaMode.value === 'off' ||
        (mediaState.immersiveMediaMode.value === 'auto' && !mediaState.useImmersiveMedia.value)
      )
        continue

      if (videoPreviewTimer === 0) {
        const { ownerId } = getComponent(userEntity, NetworkObjectComponent)
        const elId = ownerId + '_video'
        const el = document.getElementById(elId) as HTMLVideoElement | null
        const consumer = world.mediaNetwork!.consumers.find(
          (consumer) => consumer._appData.peerId === ownerId
        ) as Consumer
        const paused = consumer && (consumer as any).producerPaused
        if (videoPreviewMesh.material.map) {
          if (!el || paused) {
            videoPreviewMesh.material.map = null!
            videoPreviewMesh.visible = false
          }
        } else {
          if (el && !paused) {
            if (!el.readyState) {
              el.onloadeddata = () => {
                applyVideoToTexture(el, videoPreviewMesh, 'fill')
                videoPreviewMesh.visible = true
              }
            } else {
              applyVideoToTexture(el, videoPreviewMesh, 'fill')
              videoPreviewMesh.visible = true
            }
          }
        }
      }
    }

    for (const userEntity of userQuery.exit()) {
      const entity = AvatarUI.get(userEntity)?.entity
      if (typeof entity !== 'undefined') removeEntity(entity)
      AvatarUI.delete(userEntity)
    }

    if (AvatarContextMenuUI.state.id.value !== '') {
      renderAvatarContextMenu(world, AvatarContextMenuUI.state.id.value, AvatarContextMenuUI.entity)
    }
  }
}
