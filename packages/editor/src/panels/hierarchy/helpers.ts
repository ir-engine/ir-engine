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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { Entity, getComponent, UUIDComponent } from '@ir-engine/ecs'
import { AllFileTypes } from '@ir-engine/engine/src/assets/constants/fileTypes'
import { getState } from '@ir-engine/hyperflux'
import { t } from 'i18next'
import { CopyPasteFunctions } from '../../functions/CopyPasteFunctions'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { SelectionState } from '../../services/SelectionServices'

/* COMMON */

export const uploadOptions = {
  multiple: true,
  accepts: AllFileTypes
}

/** UTILITIES **/

const getSelectedEntities = (entity?: Entity) => {
  const selected = entity
    ? getState(SelectionState).selectedEntities.includes(getComponent(entity, UUIDComponent))
    : true
  const selectedEntities = selected ? SelectionState.getSelectedEntities() : [entity!]
  return selectedEntities
}

export const deleteNode = (entity: Entity) => {
  EditorControlFunctions.removeObject(getSelectedEntities(entity))
}

export const duplicateNode = (entity?: Entity) => {
  EditorControlFunctions.duplicateObject(getSelectedEntities(entity))
}

export const groupNodes = (entity?: Entity) => {
  EditorControlFunctions.groupObjects(getSelectedEntities(entity))
}

export const copyNodes = (entity?: Entity) => {
  CopyPasteFunctions.copyEntities(getSelectedEntities(entity))
}

export const pasteNodes = (entity?: Entity) => {
  CopyPasteFunctions.getPastedEntities()
    .then((nodeComponentJSONs) => {
      nodeComponentJSONs.forEach((componentJSONs) => {
        EditorControlFunctions.createObjectFromSceneElement(componentJSONs, undefined, getSelectedEntities(entity)[0])
      })
    })
    .catch(() => {
      NotificationService.dispatchNotify(t('editor:hierarchy.copy-paste.no-hierarchy-nodes') as string, {
        variant: 'error'
      })
    })
}
