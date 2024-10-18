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

// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { InviteCode } from '@ir-engine/common/src/schema.type.module'
import { EntityUUID } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Action, PeerID, dispatchAction } from '@ir-engine/hyperflux'
import { CameraActions } from '@ir-engine/spatial/src/camera/CameraState'

import { ikTargets } from '@ir-engine/engine/src/avatar/animation/Util'
import { AvatarNetworkAction } from '@ir-engine/engine/src/avatar/state/AvatarNetworkActions'

export enum AuthError {
  MISSING_ACCESS_TOKEN = 'MISSING_ACCESS_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export type AuthTask = {
  status: 'success' | 'fail' | 'pending'
  peerIndex?: number
  hostPeerID?: PeerID
  routerRtpCapabilities?: any
  cachedActions?: Required<Action>[]
  error?: AuthError
}

export type ReadyTask = {
  instanceReady: boolean
}

export type JoinWorldRequestData = {
  inviteCode?: InviteCode
}

export type JoinWorldProps = {
  peerIndex: number
  cachedActions: Required<Action>[]
}

export type SpawnInWorldProps = {
  parentUUID: EntityUUID
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
  avatarURL: string
  name: string
}

export const spawnLocalAvatarInWorld = (props: SpawnInWorldProps) => {
  const { avatarSpawnPose, avatarURL, parentUUID } = props
  console.log('SPAWN IN WORLD', avatarSpawnPose, avatarURL)
  const entityUUID = Engine.instance.userID
  dispatchAction(
    AvatarNetworkAction.spawn({
      ...avatarSpawnPose,
      parentUUID,
      avatarURL,
      entityUUID: (entityUUID + '_avatar') as EntityUUID,
      name: props.name
    })
  )
  dispatchAction(CameraActions.spawnCamera({ parentUUID, entityUUID: (entityUUID + '_camera') as EntityUUID }))

  const headUUID = (entityUUID + ikTargets.head) as EntityUUID
  const leftHandUUID = (entityUUID + ikTargets.leftHand) as EntityUUID
  const rightHandUUID = (entityUUID + ikTargets.rightHand) as EntityUUID
  const leftFootUUID = (entityUUID + ikTargets.leftFoot) as EntityUUID
  const rightFootUUID = (entityUUID + ikTargets.rightFoot) as EntityUUID

  dispatchAction(AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: headUUID, name: 'head', blendWeight: 0 }))
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: leftHandUUID, name: 'leftHand', blendWeight: 0 })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: rightHandUUID, name: 'rightHand', blendWeight: 0 })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: leftFootUUID, name: 'leftFoot', blendWeight: 0 })
  )
  dispatchAction(
    AvatarNetworkAction.spawnIKTarget({ parentUUID, entityUUID: rightFootUUID, name: 'rightFoot', blendWeight: 0 })
  )
}
