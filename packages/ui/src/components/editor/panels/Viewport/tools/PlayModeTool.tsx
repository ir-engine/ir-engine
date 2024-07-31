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

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { UUIDComponent } from '@etherealengine/ecs'
import { getComponent, removeComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { TransformGizmoControlledComponent } from '@etherealengine/editor/src/classes/TransformGizmoControlledComponent'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { transformGizmoControlledQuery } from '@etherealengine/editor/src/systems/GizmoSystem'
import { VisualScriptActions, visualScriptQuery } from '@etherealengine/engine'
import { AvatarComponent } from '@etherealengine/engine/src/avatar/components/AvatarComponent'
import { getRandomSpawnPoint } from '@etherealengine/engine/src/avatar/functions/getSpawnPoint'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/avatar/functions/receiveJoinWorld'
import { dispatchAction, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'
import { WorldNetworkAction } from '@etherealengine/network'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { ComputedTransformComponent } from '@etherealengine/spatial/src/transform/components/ComputedTransformComponent'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePause, HiOutlinePlay } from 'react-icons/hi2'
import Button from '../../../../../primitives/tailwind/Button'
import { InfoTooltip } from '../../../layout/Tooltip'

const PlayModeTool = () => {
  const { t } = useTranslation()

  const isEditing = useHookstate(getMutableState(EngineState).isEditing)
  const authState = useHookstate(getMutableState(AuthState))

  const onTogglePlayMode = () => {
    const entity = AvatarComponent.getSelfAvatarEntity()
    if (entity) {
      dispatchAction(WorldNetworkAction.destroyEntity({ entityUUID: getComponent(entity, UUIDComponent) }))
      removeEntity(entity)
      removeComponent(Engine.instance.cameraEntity, ComputedTransformComponent)
      removeComponent(Engine.instance.cameraEntity, FollowCameraComponent)
      removeComponent(Engine.instance.cameraEntity, TargetCameraRotationComponent)
      getMutableState(EngineState).isEditing.set(true)
      visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.stop({ entity })))
      // stop all visual script logic
    } else {
      const avatarDetails = authState.user.avatar.value

      const avatarSpawnPose = getRandomSpawnPoint(Engine.instance.userID)
      const currentScene = getComponent(getState(EditorState).rootEntity, UUIDComponent)

      if (avatarDetails)
        spawnLocalAvatarInWorld({
          parentUUID: currentScene,
          avatarSpawnPose,
          avatarID: avatarDetails.id!,
          name: authState.user.name.value
        })

      // todo
      getMutableState(EngineState).isEditing.set(false)
      // run all visual script logic
      visualScriptQuery().forEach((entity) => dispatchAction(VisualScriptActions.execute({ entity })))
      transformGizmoControlledQuery().forEach((entity) => removeComponent(entity, TransformGizmoControlledComponent))
      //just remove all gizmo in the scene
    }
  }

  return (
    <div id="preview" className="flex items-center">
      <InfoTooltip
        title={
          isEditing.value ? t('editor:toolbar.command.lbl-playPreview') : t('editor:toolbar.command.lbl-stopPreview')
        }
        info={
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
      </InfoTooltip>
    </div>
  )
}

export default PlayModeTool
