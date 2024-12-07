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
  ECSState,
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
import { createUI } from '@ir-engine/engine/src/interaction/functions/createUI'
import { getState } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import { TransformComponent } from '@ir-engine/spatial'
import { inFrustum } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { createTransitionState } from '@ir-engine/spatial/src/common/functions/createTransitionState'
import { smootheLerpAlpha } from '@ir-engine/spatial/src/common/functions/MathLerpFunctions'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { XRUIComponent } from '@ir-engine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@ir-engine/xrui'
import { useEffect } from 'react'
import { MathUtils, Vector3 } from 'three'
import { XruiNameplateState } from '../XruiNameplateState'

const xrDistVec3 = new Vector3()

function updateXrDistVec3(selfAvatarEntity: Entity): void {
  //TODO change from using rigidbody to use the transform position (+ height of avatar)
  const selfAvatarRigidBodyComponent = getOptionalComponent(selfAvatarEntity, RigidBodyComponent)
  const avatar = getComponent(selfAvatarEntity, AvatarComponent)
  if (!selfAvatarRigidBodyComponent) return
  xrDistVec3.copy(selfAvatarRigidBodyComponent!.position)
  xrDistVec3.y += avatar.avatarHeight
}

export const XruiNameplateComponent = defineComponent({
  name: 'XruiNameplateComponent',
  schema: S.Object({
    uiEntity: T.Entity(),
    nameLabel: S.String('')
  }),

  Transitions: new Map<Entity, ReturnType<typeof createTransitionState>>(),

  reactor: () => {
    const entity = useEntityContext()
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    const networkObject = useComponent(entity, NetworkObjectComponent)
    const user = useGet(userPath, networkObject.ownerId.value)

    useEffect(() => {
      if (selfAvatarEntity === entity || getState(XruiNameplateState).isVisible === false) return //don't add nameplate to self
      const userName = user.data?.name ?? 'A User'
      addNameplateUI(entity, userName)

      const xruiEntity = getComponent(entity, XruiNameplateComponent).uiEntity
      return () => {
        XruiNameplateComponent.Transitions.delete(entity)
        removeEntity(xruiEntity)
      }
    }, [user?.data?.name])

    return null
  }
})

const addNameplateUI = (entity: Entity, username: string) => {
  const xruiNamePlateParams = getState(XruiNameplateState)
  const uiEntity = createUI(
    entity,
    username,
    xruiNamePlateParams.isInteractable,
    xruiNamePlateParams.uiParams.borderRadiusPx,
    xruiNamePlateParams.uiParams.bgPaddingPx,
    xruiNamePlateParams.uiParams.verticalContentPaddingPx,
    xruiNamePlateParams.uiParams.horizontalContentPaddingPx
  ).entity

  const uiTransform = getComponent(uiEntity, TransformComponent)
  const avatar = getOptionalComponent(entity, AvatarComponent)

  uiTransform.position.set(0, avatar?.avatarHeight ?? xruiNamePlateParams.defaultNamePlateHeight, 0)
  const nameplateComponent = getMutableComponent(entity, XruiNameplateComponent)

  nameplateComponent.uiEntity.set(uiEntity)

  setComponent(uiEntity, EntityTreeComponent, { parentEntity: getState(EngineState).originEntity })
  setComponent(uiEntity, ComputedTransformComponent, {
    referenceEntities: [entity, getState(EngineState).viewerEntity],
    computeFunction: () => updateNameplateUI(entity)
  })

  const transition = createTransitionState(xruiNamePlateParams.transitionTime)
  transition.setState('OUT')
  XruiNameplateComponent.Transitions.set(entity, transition)
}

export const updateNameplateUI = (entity: Entity) => {
  const xruiNameplateComponent = getOptionalComponent(entity, XruiNameplateComponent)
  const avatarTransform = getOptionalComponent(entity, TransformComponent)
  const xruiNamePlateParams = getState(XruiNameplateState)
  if (
    !xruiNameplateComponent ||
    xruiNameplateComponent.uiEntity == UndefinedEntity ||
    xruiNamePlateParams.isVisible === false
  )
    return

  const avatarComponent = getOptionalComponent(entity, AvatarComponent)
  const xrui = getOptionalComponent(xruiNameplateComponent.uiEntity, XRUIComponent)

  const xruiTransform = getOptionalComponent(xruiNameplateComponent.uiEntity, TransformComponent)
  if (!xrui || !xruiTransform) return
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
  updateXrDistVec3(selfAvatarEntity)

  const hasVisibleComponent = hasComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
  if (hasVisibleComponent && avatarComponent && avatarTransform) {
    const alpha = smootheLerpAlpha(0.01, getState(ECSState).deltaSeconds)

    xruiTransform.position.set(
      avatarTransform?.matrix.elements[12] ?? 0,
      MathUtils.lerp(
        xruiTransform.position.y,
        //between 66% avatar height and ~110% avatar height
        avatarTransform.position.y +
          avatarComponent.avatarHeight * 0.66 +
          avatarComponent.avatarHeight * 0.33 * 1.32 * xruiTransform.scale.x,
        alpha
      ),
      avatarTransform?.matrix.elements[14] ?? 0
    )

    const cameraTransform = getComponent(getState(EngineState).viewerEntity, TransformComponent)
    xruiTransform.rotation.copy(cameraTransform.rotation)
  }

  const distance = xrDistVec3.distanceTo(xruiTransform.position)

  const transition = XruiNameplateComponent.Transitions.get(entity)

  const inCameraFrustum = inFrustum(xruiNameplateComponent.uiEntity)

  const activateUI = inCameraFrustum && distance < xruiNamePlateParams.triggerDistance

  if (transition) {
    if (transition.state === 'OUT' && activateUI) {
      transition.setState('IN')
      setComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
    }
    if (transition.state === 'IN' && !activateUI) {
      transition.setState('OUT')
    }
    const deltaSeconds = getState(ECSState).deltaSeconds
    transition.update(deltaSeconds, (opacity) => {
      if (opacity === 0) {
        removeComponent(xruiNameplateComponent.uiEntity, VisibleComponent)
      }
      if (hasVisibleComponent) {
        xruiTransform.scale.setScalar(MathUtils.clamp(opacity * opacity * 1.2, 0.01, 1)) //scale changes slightly faster than f(n^2)
      }
      xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
        const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
        mat.opacity = opacity
      })
    })
  }
}
