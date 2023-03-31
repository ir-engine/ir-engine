import React from 'react'

import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getRandomSpawnPoint } from '@etherealengine/engine/src/avatar/AvatarSpawnSystem'
import { FollowCameraComponent } from '@etherealengine/engine/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/engine/src/camera/components/TargetCameraRotationComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getEngineState, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getComponent, removeComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { ComputedTransformComponent } from '@etherealengine/engine/src/transform/components/ComputedTransformComponent'
import { dispatchAction } from '@etherealengine/hyperflux'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { EditorHelperAction, useEditorHelperState } from '../../../services/EditorHelperState'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const editorHelperState = useEditorHelperState()
  const authState = useAuthState()

  const onTogglePlayMode = () => {
    if (Engine.instance.localClientEntity) {
      removeEntity(Engine.instance.localClientEntity)
      const cameraComputed = getComponent(Engine.instance.cameraEntity, ComputedTransformComponent)
      removeEntity(cameraComputed.referenceEntity)
      removeComponent(Engine.instance.cameraEntity, ComputedTransformComponent)
      removeComponent(Engine.instance.cameraEntity, FollowCameraComponent)
      removeComponent(Engine.instance.cameraEntity, TargetCameraRotationComponent)
      dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: false }))
    } else {
      const avatarDetails = authState.user.avatar.value

      const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userId)

      if (avatarDetails.modelResource?.LOD0_url)
        spawnLocalAvatarInWorld({
          avatarSpawnPose,
          avatarDetail: {
            avatarURL: avatarDetails.modelResource?.LOD0_url!,
            thumbnailURL: avatarDetails.thumbnailResource?.LOD0_url!
          },
          name: authState.user.name.value
        })
      dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: true }))
    }
  }

  const sceneLoaded = getEngineState().sceneLoaded.value

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
