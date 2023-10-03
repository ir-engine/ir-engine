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

// spawnPose is temporary - just so portals work for now - will be removed in favor of instanceserver-instanceserver communication
import { Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'
import { Action } from '@etherealengine/hyperflux/functions/ActionFunctions'

import { AvatarNetworkAction } from '../../avatar/state/AvatarNetworkActions'
import { Engine } from '../../ecs/classes/Engine'
import { WorldState } from '../interfaces/WorldState'
import { WorldNetworkAction } from './WorldNetworkAction'

export enum AuthError {
  MISSING_ACCESS_TOKEN = 'MISSING_ACCESS_TOKEN',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_NOT_AUTHORIZED = 'USER_NOT_AUTHORIZED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export type AuthTask = {
  status: 'success' | 'fail' | 'pending'
  routerRtpCapabilities?: any
  cachedActions?: Required<Action>[]
  error?: AuthError
}

export type JoinWorldRequestData = {
  inviteCode?: string
}

export type JoinWorldProps = {
  peerIndex: number
  cachedActions: Required<Action>[]
}

export type SpawnInWorldProps = {
  avatarSpawnPose: { position: Vector3; rotation: Quaternion }
  avatarID: string
  name: string
}

export const spawnLocalAvatarInWorld = (props: SpawnInWorldProps) => {
  const { avatarSpawnPose, avatarID, name } = props
  console.log('SPAWN IN WORLD', avatarSpawnPose, avatarID, name)
  const worldState = getMutableState(WorldState)
  const entityUUID = Engine.instance.userID as string as EntityUUID
  worldState.userNames[Engine.instance.userID].set(name)
  dispatchAction(AvatarNetworkAction.spawn({ ...avatarSpawnPose, entityUUID }))
  dispatchAction(AvatarNetworkAction.setAvatarID({ avatarID, entityUUID }))
  dispatchAction(
    WorldNetworkAction.spawnCamera({
      entityUUID: ('camera_' + entityUUID) as EntityUUID
    })
  )
}
