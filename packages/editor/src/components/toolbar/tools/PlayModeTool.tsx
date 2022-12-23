import React from 'react'

import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { getRandomSpawnPoint } from '@xrengine/engine/src/avatar/AvatarSpawnSystem'
import { FollowCameraComponent } from '@xrengine/engine/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@xrengine/engine/src/camera/components/TargetCameraRotationComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, removeComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { spawnLocalAvatarInWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import { ComputedTransformComponent } from '@xrengine/engine/src/transform/components/ComputedTransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

import { EditorHelperAction, useEditorHelperState } from '../../../services/EditorHelperState'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

const PlayModeTool = () => {
  const world = Engine.instance.currentWorld
  const editorHelperState = useEditorHelperState()
  const authState = useAuthState()

  const onTogglePlayMode = () => {
    if (world.localClientEntity) {
      removeEntity(world.localClientEntity)
      const cameraComputed = getComponent(world.cameraEntity, ComputedTransformComponent)
      removeEntity(cameraComputed.referenceEntity)
      removeComponent(world.cameraEntity, ComputedTransformComponent)
      removeComponent(world.cameraEntity, FollowCameraComponent)
      removeComponent(world.cameraEntity, TargetCameraRotationComponent)
      dispatchAction(EditorHelperAction.changedPlayMode({ isPlayModeEnabled: false }))
    } else {
      const avatarDetails = authState.user.avatar.value

      const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userId)

      if (avatarDetails.modelResource?.url)
        spawnLocalAvatarInWorld({
          avatarSpawnPose,
          avatarDetail: {
            avatarURL: avatarDetails.modelResource?.url!,
            thumbnailURL: avatarDetails.thumbnailResource?.url!
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
