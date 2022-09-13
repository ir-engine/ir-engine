import { Not } from 'bitecs'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { Group, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { AvatarComponent } from '@xrengine/engine/src/avatar/components/AvatarComponent'
import { easeOutElastic } from '@xrengine/engine/src/common/functions/MathFunctions'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { NetworkObjectOwnedTag } from '@xrengine/engine/src/networking/components/NetworkObjectOwnedTag'
import { shouldUseImmersiveMedia } from '@xrengine/engine/src/networking/MediaSettingsState'
import { addObjectToGroup } from '@xrengine/engine/src/scene/components/GroupComponent'
import { applyVideoToTexture } from '@xrengine/engine/src/scene/functions/applyScreenshareToTexture'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { createTransitionState } from '@xrengine/engine/src/xrui/functions/createTransitionState'

import { createAvatarDetailView } from './ui/AvatarDetailView'
import { createAvatarContextMenuView } from './ui/UserMenuView'

const logger = multiLogger.child({ component: 'client-core:systems' })

export const AvatarUI = new Map<Entity, ReturnType<typeof createAvatarDetailView>>()
export const AvatarUITransitions = new Map<Entity, ReturnType<typeof createTransitionState>>()

export const renderAvatarContextMenu = (world: World, userId: UserId, contextMenuEntity: Entity) => {
  const userEntity = world.getUserAvatarEntity(userId)
  if (!userEntity) return

  const contextMenuXRUI = getComponent(contextMenuEntity, XRUIComponent)
  if (!contextMenuXRUI) return

  const userTransform = getComponent(userEntity, TransformComponent)
  const cameraPosition = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).position
  const { avatarHeight } = getComponent(userEntity, AvatarComponent)

  contextMenuXRUI.container.scale.setScalar(Math.max(1, cameraPosition.distanceTo(userTransform.position) / 3))
  contextMenuXRUI.container.position.copy(userTransform.position)
  contextMenuXRUI.container.position.y += avatarHeight - 0.3
  contextMenuXRUI.container.position.x += 0.1
  contextMenuXRUI.container.position.z += contextMenuXRUI.container.position.z > cameraPosition.z ? -0.4 : 0.4
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

  const _vector3 = new Vector3()

  let videoPreviewTimer = 0

  const applyingVideo = new Map()

  return () => {
    videoPreviewTimer += world.deltaSeconds
    if (videoPreviewTimer > 1) videoPreviewTimer = 0

    const immersiveMedia = shouldUseImmersiveMedia()

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
      ui.state.videoPreviewMesh.value.position.y += 0.3
      ui.state.videoPreviewMesh.value.visible = false
      root.add(ui.state.videoPreviewMesh.value)
      addObjectToGroup(ui.entity, root)
      AvatarUI.set(userEntity, ui)
    }

    for (const userEntity of userQuery()) {
      const ui = AvatarUI.get(userEntity)!
      const transition = AvatarUITransitions.get(userEntity)!
      const { avatarHeight } = getComponent(userEntity, AvatarComponent)
      const userTransform = getComponent(userEntity, TransformComponent)
      const xrui = getComponent(ui.entity, XRUIComponent)

      const videoPreviewMesh = ui.state.videoPreviewMesh.value
      _vector3.copy(userTransform.position).y += avatarHeight + (videoPreviewMesh.visible ? 0.1 : 0.3)

      const cameraPosition = getComponent(Engine.instance.currentWorld.cameraEntity, TransformComponent).position
      const dist = cameraPosition.distanceTo(_vector3)

      if (dist > 25) transition.setState('OUT')
      if (dist < 20) transition.setState('IN')

      let springAlpha = transition.alpha

      transition.update(world.deltaSeconds, (alpha) => {
        springAlpha = easeOutElastic(alpha)
      })

      xrui.container.scale.setScalar(1.3 * Math.max(1, dist / 6) * Math.max(springAlpha, 0.001))
      xrui.container.position.copy(_vector3)
      xrui.container.rotation.setFromRotationMatrix(Engine.instance.currentWorld.camera.matrix)

      if (immersiveMedia && videoPreviewTimer === 0) {
        const { ownerId } = getComponent(userEntity, NetworkObjectComponent)
        const consumer = world.mediaNetwork!.consumers.find(
          (consumer) => consumer._appData.peerId === ownerId && consumer._appData.mediaTag === 'cam-video'
        ) as Consumer
        const paused = consumer && (consumer as any).producerPaused
        if (videoPreviewMesh.material.map) {
          if (!consumer || paused) {
            videoPreviewMesh.material.map = null!
            videoPreviewMesh.visible = false
          }
        } else {
          if (consumer && !paused && !applyingVideo.has(ownerId)) {
            applyingVideo.set(ownerId, true)
            const track = (consumer as any).track
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

      if (!immersiveMedia && videoPreviewMesh.material.map) {
        videoPreviewMesh.material.map = null!
        videoPreviewMesh.visible = false
      }
    }

    for (const userEntity of userQuery.exit()) {
      const entity = AvatarUI.get(userEntity)?.entity
      if (typeof entity !== 'undefined') removeEntity(entity)
      AvatarUI.delete(userEntity)
      AvatarUITransitions.delete(userEntity)
    }

    if (AvatarContextMenuUI.state.id.value !== '') {
      renderAvatarContextMenu(world, AvatarContextMenuUI.state.id.value, AvatarContextMenuUI.entity)
    }
  }
}
