import {
  createEntity,
  defineComponent,
  Entity,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  removeEntity,
  S,
  setComponent,
  UndefinedEntity,
  useEntityContext,
  useOptionalComponent
} from '@ir-engine/ecs'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { inFrustum } from '@ir-engine/engine/src/camera/functions/cameraFunctions'
import { createUI } from '@ir-engine/engine/src/interaction/functions/createUI'
import { getState } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { useEffect } from 'react'

// const mediaNetwork = NetworkState.mediaNetwork

// const peers = mediaNetwork.peers ? Object.values(mediaNetwork.peers) : []
// const peer = peers.find((peer) => {
//   // return peer.userId === ownerId
// })
//
// const userID = mediaNetwork.peers[peerID]?.userId
// const user = useGet(userPath, userID)

/**
 * todo switch the positioning to use avatar pos and height, make sure we have all the necessary cached vectors etc
 * use InteractableComponent as xrui example, use avataruisystem and createAvatarDetailView for the rest
 *
 * */

//from videocall.tsx, probably don't need anything other than user.data.name for username but check for any
//useful tricks or optimizations

export const XruiNameplateComponent = defineComponent({
  name: 'XruiNameplateComponent',
  schema: S.Object({
    uiEntity: S.Entity(),
    nameLabel: S.String('')
    // transition: S.Type(createTransitionState(0.25))
  }),

  reactor: () => {
    const entity = useEntityContext()
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    const networkObject = useOptionalComponent(entity, NetworkObjectComponent)

    useEffect(() => {
      if (selfAvatarEntity === entity) return //don't add nameplate to self

      const xruiEntity = createEntity()
      setComponent(xruiEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(xruiEntity, TransformComponent)

      //const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent])//, Not(NetworkObjectOwnedTag)])
      // for (const userEntity of userQuery())
      // const { ownerId } = getComponent(userEntity, NetworkObjectComponent)

      /** todo set up username here, can use networkobject */
      // const username = user.data?.name ?? 'A User'

      if (networkObject?.value) {
        const username = networkObject.ownerId.value ?? 'A User'
        addNameplateUI(entity, username)
      }

      // const user = useGet(userPath, userID)
      // const username = getUsername() as UserName
      // const nameLabel = component.nameLabel.get(NO_PROXY)
      return () => {
        if (xruiEntity !== UndefinedEntity) {
          // removeNameplateUI(entity)
          removeEntity(xruiEntity)
        }
      }
    }, [networkObject])

    return null
  }
})

const addNameplateUI = (entity: Entity, username: string) => {
  const uiEntity = createUI(entity, username, false).entity

  const uiTransform = getComponent(uiEntity, TransformComponent)
  const avatar = getOptionalComponent(entity, AvatarComponent)

  uiTransform.position.set(0, avatar?.avatarHeight ?? 1.5, 0)
  const nameplayComponent = getMutableComponent(entity, XruiNameplateComponent)
  nameplayComponent.uiEntity.set(uiEntity)

  setComponent(uiEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
  setComponent(uiEntity, ComputedTransformComponent, {
    referenceEntities: [entity, getState(EngineState).viewerEntity],
    computeFunction: () => updateNameplateUI(entity)
  })

  const transition = createTransitionState(0.25)
  transition.setState('OUT')
  // nameplayComponent.transition.set(transition)
}

const removeNameplateUI = (entity: Entity) => {
  const xruiNameplateComponent = getComponent(entity, XruiNameplateComponent)
  if (xruiNameplateComponent.uiEntity == UndefinedEntity) return //null or empty label = no ui

  removeEntity(xruiNameplateComponent.uiEntity)
  getMutableComponent(entity, XruiNameplateComponent).uiEntity.set(UndefinedEntity)
}

export const updateNameplateUI = (entity: Entity) => {
  // const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  const xruiNameplateComponent = getOptionalComponent(entity, XruiNameplateComponent)

  if (/*!selfAvatarEntity ||*/ !xruiNameplateComponent || xruiNameplateComponent.uiEntity == UndefinedEntity) return

  const avatarComponent = getOptionalComponent(entity, AvatarComponent)
  const xrui = getOptionalComponent(xruiNameplateComponent.uiEntity, XRUIComponent)
  const xruiTransform = getOptionalComponent(xruiNameplateComponent.uiEntity, TransformComponent)
  if (!xrui || !xruiTransform) return

  // const boundingBox = getOptionalComponent(entity, BoundingBoxComponent)

  // updateXrDistVec3(selfAvatarEntity)

  const hasVisibleComponent = hasComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
  if (hasVisibleComponent && avatarComponent) {
    // && boundingBox) {
    // updateBoundingBox(entity)

    // const center = boundingBox.box.getCenter(_center)
    // const size = boundingBox.box.getSize(_size)
    // if (!size.y) size.y = 1
    // const alpha = smootheLerpAlpha(0.01, getState(ECSState).deltaSeconds)
    // xruiTransform.position.x = center.x
    // xruiTransform.position.z = center.z
    xruiTransform.position.y = avatarComponent.avatarHeight * 1.1 // MathUtils.lerp(xruiTransform.position.y, center.y + 0.7 * size.y, alpha)

    const cameraTransform = getComponent(getState(EngineState).viewerEntity, TransformComponent)
    xruiTransform.rotation.copy(cameraTransform.rotation)
  }

  // const distance = xrDistVec3.distanceToSquared(xruiTransform.position)

  //slightly annoying to check this condition twice, but keeps distance calc on same frame
  // if (hasVisibleComponent) {
  //   xruiTransform.scale.setScalar(MathUtils.clamp(distance * 0.01, 1, 5))
  // }

  // const transition = xruiNameplateComponent.transition
  let activateUI = false

  const inCameraFrustum = inFrustum(xruiNameplateComponent.uiEntity)

  activateUI = inCameraFrustum

  if (/*transition.state === 'OUT' && */ activateUI) {
    //transition.setState('IN')
    setComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
  }
  if (/*transition.state === 'IN' &&*/ !activateUI) {
    //transition.setState('OUT')
    removeComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
  }
  // const deltaSeconds = getState(ECSState).deltaSeconds
  // transition.update(deltaSeconds, (opacity) => {
  //   if (opacity === 0) {
  //     removeComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
  //   }
  //   xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
  //     const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
  //     mat.opacity = opacity
  //   })
  // })
}
