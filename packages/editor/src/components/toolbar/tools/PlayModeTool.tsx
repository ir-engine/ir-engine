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

import React from 'react'

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getRandomSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { FollowCameraComponent } from '@etherealengine/engine/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/engine/src/camera/components/TargetCameraRotationComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getComponent, removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { WorldNetworkAction } from '@etherealengine/engine/src/networking/functions/WorldNetworkAction'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { ComputedTransformComponent } from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { EditorHelperAction, EditorHelperState } from '../../../services/EditorHelperState'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const editorHelperState = useHookstate(getMutableState(EditorHelperState))
  const authState = useHookstate(getMutableState(AuthState))
  const sceneLoaded = useHookstate(getMutableState(EngineState).sceneLoaded).value

  const onTogglePlayMode = () => {
    if (Engine.instance.localClientEntity) {
      dispatchAction(
        WorldNetworkAction.destroyObject({ entityUUID: getComponent(Engine.instance.localClientEntity, UUIDComponent) })
      )
      const cameraComputed = getComponent(Engine.instance.cameraEntity, ComputedTransformComponent)
      removeEntity(cameraComputed.referenceEntity)
      removeComponent(Engine.instance.cameraEntity, ComputedTransformComponent)
      removeComponent(Engine.instance.cameraEntity, FollowCameraComponent)
      removeComponent(Engine.instance.cameraEntity, TargetCameraRotationComponent)
      dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: false }))
    } else {
      const avatarDetails = authState.user.avatar.value

      const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userId)

      if (avatarDetails)
        spawnLocalAvatarInWorld({
          avatarSpawnPose,
          avatarID: avatarDetails.id,
          name: authState.user.name.value
        })
      dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: true }))
    }
  }

  return (
    <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="preview">
      <InfoTooltip title={editorHelperState.isPlayModeEnabled.value ? 'Stop Previewing Scene' : 'Preview Scene'}>
        <button
          disabled={!sceneLoaded}
          onClick={onTogglePlayMode}
          className={styles.toolButton + ' ' + (editorHelperState.isPlayModeEnabled.value ? styles.selected : '')}
        >
          {editorHelperState.isPlayModeEnabled.value ? (
            <PauseIcon fontSize="small" />
          ) : (
            <PlayArrowIcon fontSize="small" />
          )}
        </button>
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
