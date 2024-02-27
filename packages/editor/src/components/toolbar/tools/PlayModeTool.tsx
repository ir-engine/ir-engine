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
import { getComponent, removeComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { getRandomSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/avatar/functions/receiveJoinWorld'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { WorldNetworkAction } from '@etherealengine/spatial/src/networking/functions/WorldNetworkAction'
import { ComputedTransformComponent } from '@etherealengine/spatial/src/transform/components/ComputedTransformComponent'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { BehaveGraphActions, graphQuery } from '@etherealengine/engine/src/behave-graph/systems/BehaveGraphSystem'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { useTranslation } from 'react-i18next'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const { t } = useTranslation()

  const isEditing = useHookstate(getMutableState(EngineState).isEditing)
  const authState = useHookstate(getMutableState(AuthState))
  const sceneLoaded = useHookstate(getMutableState(SceneState).sceneLoaded).value

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
      getMutableState(EngineState).isEditing.set(true)
      graphQuery().forEach((entity) => dispatchAction(BehaveGraphActions.stop({ entity })))

      SceneState.applyCurrentSnapshot(getState(SceneState).activeScene!)
      // stop all behave graph logic
    } else {
      const avatarDetails = authState.user.avatar.value

      const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)

      if (avatarDetails)
        spawnLocalAvatarInWorld({
          avatarSpawnPose,
          avatarID: avatarDetails.id!,
          name: authState.user.name.value
        })

      // todo
      // getMutableState(EngineState).isEditing.set(false)
      // run all behave graph logic
      graphQuery().forEach((entity) => dispatchAction(BehaveGraphActions.execute({ entity })))
    }
  }

  return (
    <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="preview">
      <InfoTooltip
        title={
          isEditing.value ? t('editor:toolbar.command.lbl-playPreview') : t('editor:toolbar.command.lbl-stopPreview')
        }
        info={
          isEditing.value ? t('editor:toolbar.command.info-playPreview') : t('editor:toolbar.command.info-stopPreview')
        }
      >
        <button
          disabled={!sceneLoaded}
          onClick={onTogglePlayMode}
          className={styles.toolButton + ' ' + (isEditing.value ? '' : styles.selected)}
        >
          {isEditing.value ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
        </button>
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
