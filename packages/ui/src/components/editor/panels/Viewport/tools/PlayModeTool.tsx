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

import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, removeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { removeEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { TransformGizmoControlledComponent } from '@ir-engine/editor/src/classes/TransformGizmoControlledComponent'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { transformGizmoControlledQuery } from '@ir-engine/editor/src/systems/GizmoSystem'
import { VisualScriptActions, visualScriptQuery } from '@ir-engine/engine'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@ir-engine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@ir-engine/engine/src/avatar/functions/receiveJoinWorld'
import { dispatchAction, getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { WorldNetworkAction } from '@ir-engine/network'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@ir-engine/spatial/src/camera/components/TargetCameraRotationComponent'
import { ComputedTransformComponent } from '@ir-engine/spatial/src/transform/components/ComputedTransformComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePause, HiOutlinePlay } from 'react-icons/hi2'
import Button from '../../../../../primitives/tailwind/Button'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'

/**
 * Returns true if we stopped play mode, false if we were not in play mode
 */
export const onStopPlayMode = (): boolean => {
  const entity = AvatarComponent.getSelfAvatarEntity()
  if (entity) {
    dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: getComponent(entity, UUIDComponent) }))
    removeEntity(entity)
    const viewerEntity = getState(EngineState).viewerEntity
    removeComponent(viewerEntity, ComputedTransformComponent)
    removeComponent(viewerEntity, FollowCameraComponent)
    removeComponent(viewerEntity, TargetCameraRotationComponent)
    visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.stop({ entity })))
    // stop all visual script logic
  }
  return !!entity
}

export const onStartPlayMode = () => {
  const authState = getState(AuthState)
  const avatarDetails = authState.user.avatar //.value

  const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)
  const currentScene = getComponent(getState(EditorState).rootEntity, UUIDComponent)

  if (avatarDetails)
    spawnLocalAvatarInWorld({
      parentUUID: currentScene,
      avatarSpawnPose,
      avatarID: avatarDetails.id!,
      name: authState.user.name //.value
    })

  // todo
  // run all visual script logic
  visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.execute({ entity })))
  transformGizmoControlledQuery().forEach((entity) => removeComponent(entity, TransformGizmoControlledComponent))
  //just remove all gizmo in the scene
}

const PlayModeTool: React.FC = () => {
  const { t } = useTranslation()

  const isEditing = useHookstate(getMutableState(EngineState).isEditing)

  const onTogglePlayMode = () => {
    getMutableState(EngineState).isEditing.set(!isEditing.value)
  }

  useEffect(() => {
    if (isEditing.value) return
    onStartPlayMode()
    return () => {
      onStopPlayMode()
    }
  }, [isEditing])

  return (
    <div id="preview" className="flex items-center">
      <Tooltip
        title={
          isEditing.value ? t('editor:toolbar.command.lbl-playPreview') : t('editor:toolbar.command.lbl-stopPreview')
        }
        content={
          isEditing.value ? t('editor:toolbar.command.info-playPreview') : t('editor:toolbar.command.info-stopPreview')
        }
      >
        <Button
          variant="transparent"
          startIcon={
            isEditing.value ? (
              <HiOutlinePlay className="text-theme-input" />
            ) : (
              <HiOutlinePause className="text-theme-input" />
            )
          }
          className="p-0"
          onClick={onTogglePlayMode}
        />
      </Tooltip>
    </div>
  )
}

export default PlayModeTool
