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

import { useGet } from '@ir-engine/common'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import {
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
  useComponent,
  useEntityContext
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
    const networkObject = useComponent(entity, NetworkObjectComponent)
    const user = useGet(userPath, networkObject.ownerId.value)

    useEffect(() => {
      if (selfAvatarEntity === entity) return //don't add nameplate to self

      // const xruiEntity = createEntity()
      // setComponent(xruiEntity, EntityTreeComponent, { parentEntity: entity })
      // setComponent(xruiEntity, TransformComponent)

      //const userQuery = defineQuery([AvatarComponent, TransformComponent, NetworkObjectComponent])//, Not(NetworkObjectOwnedTag)])
      // for (const userEntity of userQuery())
      // const { ownerId } = getComponent(userEntity, NetworkObjectComponent)

      /** todo set up username here, can use networkobject */
      // const username = user.data?.name ?? 'A User'

      const userName = user.data?.name ?? 'A User'
      addNameplateUI(entity, userName)

      const xruiEntity = getComponent(entity, XruiNameplateComponent).uiEntity
      return () => {
        removeEntity(xruiEntity)
      }
    }, [user?.data?.name])

    return null
  }
})

const addNameplateUI = (entity: Entity, username: string) => {
  const uiEntity = createUI(entity, username, false).entity

  const uiTransform = getComponent(uiEntity, TransformComponent)
  const avatar = getOptionalComponent(entity, AvatarComponent)

  uiTransform.position.set(0, avatar?.avatarHeight ?? 1.5, 0)
  const nameplateComponent = getMutableComponent(entity, XruiNameplateComponent)

  nameplateComponent.uiEntity.set(uiEntity)

  setComponent(uiEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
  setComponent(uiEntity, ComputedTransformComponent, {
    referenceEntities: [entity, getState(EngineState).viewerEntity],
    computeFunction: () => updateNameplateUI(entity)
  })

  const transition = createTransitionState(0.25)
  transition.setState('OUT')
  // nameplayComponent.transition.set(transition)
}

export const updateNameplateUI = (entity: Entity) => {
  const xruiNameplateComponent = getOptionalComponent(entity, XruiNameplateComponent)
  const avatarTransform = getOptionalComponent(entity, TransformComponent)
  if (!xruiNameplateComponent || xruiNameplateComponent.uiEntity == UndefinedEntity) return

  const avatarComponent = getOptionalComponent(entity, AvatarComponent)
  const xrui = getOptionalComponent(xruiNameplateComponent.uiEntity, XRUIComponent)

  const xruiTransform = getOptionalComponent(xruiNameplateComponent.uiEntity, TransformComponent) //xrui!.entity!, TransformComponent)//
  if (!xrui || !xruiTransform) return

  // updateXrDistVec3(selfAvatarEntity)

  const hasVisibleComponent = hasComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
  if (hasVisibleComponent && avatarComponent) {
    // const alpha = smootheLerpAlpha(0.01, getState(ECSState).deltaSeconds)

    xruiTransform.position.set(
      avatarTransform?.matrix.elements[12] ?? 0,
      avatarComponent.avatarHeight * 1.1,
      avatarTransform?.matrix.elements[14] ?? 0
    )

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
