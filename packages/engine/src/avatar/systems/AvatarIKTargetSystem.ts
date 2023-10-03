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

import { AxesHelper } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineActionQueue, dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { defineQuery, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../ecs/functions/EntityFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { MotionCaptureAction, MotionCaptureState } from '../../mocap/MotionCaptureState'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRAction, XRState, getCameraMode } from '../../xr/XRState'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarIKTargetComponent } from '../components/AvatarIKComponents'
import { AvatarNetworkAction } from '../state/AvatarNetworkActions'

const ikTargetSpawnQueue = defineActionQueue(AvatarNetworkAction.spawnIKTarget.matches)
const sessionChangedQueue = defineActionQueue(XRAction.sessionChanged.matches)
const mocapScopeChangedQueue = defineActionQueue(MotionCaptureAction.trackingScopeChanged.matches)

const inputSourceQuery = defineQuery([InputSourceComponent])

const execute = () => {
  const xrState = getState(XRState)

  const { localClientEntity } = Engine.instance

  for (const action of sessionChangedQueue()) {
    if (!localClientEntity || xrState.sessionActive) continue

    //todo, this needs to be optimized and scalable
    const headUUID = (Engine.instance.userID + ikTargets.head) as EntityUUID
    const leftHandUUID = (Engine.instance.userID + ikTargets.leftHand) as EntityUUID
    const rightHandUUID = (Engine.instance.userID + ikTargets.rightHand) as EntityUUID
    const leftFootUUID = (Engine.instance.userID + ikTargets.leftFoot) as EntityUUID
    const rightFootUUID = (Engine.instance.userID + ikTargets.rightFoot) as EntityUUID

    const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
    const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
    const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]
    const ikTargetLeftFoot = UUIDComponent.entitiesByUUID[leftFootUUID]
    const ikTargetRightFoot = UUIDComponent.entitiesByUUID[rightFootUUID]

    if (ikTargetHead) removeEntity(ikTargetHead)
    if (ikTargetLeftHand) removeEntity(ikTargetLeftHand)
    if (ikTargetRightHand) removeEntity(ikTargetRightHand)
    if (ikTargetLeftFoot) removeEntity(ikTargetLeftFoot)
    if (ikTargetRightFoot) removeEntity(ikTargetRightFoot)
    if (!action.active) setComponent(UUIDComponent.entitiesByUUID[action.$from], AvatarRigComponent, { ikOverride: '' })
  }

  for (const action of mocapScopeChangedQueue()) {
    const leftFootUUID = (Engine.instance.userID + ikTargets.leftFoot) as EntityUUID
    const rightFootUUID = (Engine.instance.userID + ikTargets.rightFoot) as EntityUUID
    const ikTargetLeftFoot = UUIDComponent.entitiesByUUID[leftFootUUID]
    const ikTargetRightFoot = UUIDComponent.entitiesByUUID[rightFootUUID]
    if (action.trackingLowerBody) {
      if (ikTargetLeftFoot) removeEntity(ikTargetLeftFoot)
      if (ikTargetRightFoot) removeEntity(ikTargetRightFoot)
      getMutableState(MotionCaptureState).trackingLowerBody.set(true)
    } else {
      if (!ikTargetLeftFoot)
        dispatchAction(
          AvatarNetworkAction.spawnIKTarget({ entityUUID: leftFootUUID, name: 'leftFoot', blendWeight: 1 })
        )
      if (!ikTargetRightFoot)
        dispatchAction(
          AvatarNetworkAction.spawnIKTarget({ entityUUID: rightFootUUID, name: 'rightFoot', blendWeight: 1 })
        )
      getMutableState(MotionCaptureState).trackingLowerBody.set(false)
    }
  }

  for (const action of ikTargetSpawnQueue()) {
    const entity = NetworkObjectComponent.getNetworkObject(action.$from, action.networkId)
    if (!entity) {
      console.warn('Could not find entity for networkId', action.$from, action.networkId)
      continue
    }
    setComponent(entity, NameComponent, action.$from + '_' + action.name)
    setComponent(entity, AvatarIKTargetComponent, { blendWeight: action.blendWeight })

    setComponent(UUIDComponent.entitiesByUUID[action.$from], AvatarRigComponent, { ikOverride: 'xr' })

    const helper = new AxesHelper(0.5)
    setObjectLayers(helper, ObjectLayers.Gizmos)
    addObjectToGroup(entity, helper)
    setComponent(entity, VisibleComponent)
  }

  // todo - remove ik targets when session ends
  if (xrState.sessionActive && localClientEntity) {
    const sources = inputSourceQuery().map((eid) => getComponent(eid, InputSourceComponent).source)

    const position = getComponent(localClientEntity, TransformComponent).position

    const head = getCameraMode() === 'attached'
    const leftHand = !!sources.find((s) => s.handedness === 'left')
    const rightHand = !!sources.find((s) => s.handedness === 'right')

    const headUUID = (Engine.instance.userID + ikTargets.head) as EntityUUID
    const leftHandUUID = (Engine.instance.userID + ikTargets.leftHand) as EntityUUID
    const rightHandUUID = (Engine.instance.userID + ikTargets.rightHand) as EntityUUID
    const leftFootUUID = (Engine.instance.userID + ikTargets.leftFoot) as EntityUUID
    const rightFootUUID = (Engine.instance.userID + ikTargets.rightFoot) as EntityUUID

    const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
    const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
    const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]
    const ikTargetLeftFoot = UUIDComponent.entitiesByUUID[leftFootUUID]
    const ikTargetRightFoot = UUIDComponent.entitiesByUUID[rightFootUUID]

    if (!head && ikTargetHead) removeEntity(ikTargetHead)
    if (!leftHand && ikTargetLeftHand) removeEntity(ikTargetLeftHand)
    if (!rightHand && ikTargetRightHand) removeEntity(ikTargetRightHand)

    if (head && !ikTargetHead)
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: headUUID, name: 'head', blendWeight: 1 }))
    if (leftHand && !ikTargetLeftHand)
      dispatchAction(
        AvatarNetworkAction.spawnIKTarget({ entityUUID: leftHandUUID, name: 'leftHand', position, blendWeight: 1 })
      )
    if (rightHand && !ikTargetRightHand)
      dispatchAction(
        AvatarNetworkAction.spawnIKTarget({ entityUUID: rightHandUUID, name: 'rightHand', position, blendWeight: 1 })
      )
    if (!ikTargetLeftFoot)
      dispatchAction(
        AvatarNetworkAction.spawnIKTarget({ entityUUID: leftFootUUID, name: 'leftFoot', position, blendWeight: 1 })
      )
    if (!ikTargetRightFoot)
      dispatchAction(
        AvatarNetworkAction.spawnIKTarget({ entityUUID: rightFootUUID, name: 'rightFoot', position, blendWeight: 1 })
      )
  }
}

export const AvatarIKTargetSystem = defineSystem({
  uuid: 'ee.engine.AvatarIKTargetSystem',
  execute
})
