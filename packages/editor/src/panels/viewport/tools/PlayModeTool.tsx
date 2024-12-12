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

import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import { useGet } from '@ir-engine/common'
import { staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { Tooltip } from '@ir-engine/ui'
import { PauseSquareLg, PlayLg } from '@ir-engine/ui/src/icons'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const PlayModeTool: React.FC = () => {
  const { t } = useTranslation()

  const engineState = useHookstate(getMutableState(EngineState))
  const editorState = useHookstate(getMutableState(EditorState))

  const onTogglePlayMode = () => {
    engineState.isEditing.set(!engineState.isEditing.value)
  }

  const staticResource = useGet(staticResourcePath, editorState.sceneAssetID.value!)

  useEffect(() => {
    if (engineState.isEditing.value || !staticResource.data) return
    getMutableState(LocationState).currentLocation.location.sceneURL.set(staticResource.data.url)
    return () => {
      getMutableState(LocationState).currentLocation.location.sceneURL.set('')
    }
  }, [engineState.isEditing.value, staticResource.data])

  return (
    <div id="preview" className="flex items-center">
      <Tooltip
        title={
          engineState.isEditing.value
            ? t('editor:toolbar.command.lbl-playPreview')
            : t('editor:toolbar.command.lbl-stopPreview')
        }
        content={
          engineState.isEditing.value
            ? t('editor:toolbar.command.info-playPreview')
            : t('editor:toolbar.command.info-stopPreview')
        }
      >
        <button className="p-0" onClick={onTogglePlayMode}>
          {engineState.isEditing.value ? (
            <PlayLg className="text-[#9CA0AA]" />
          ) : (
            <PauseSquareLg className="text-[#9CA0AA]" />
          )}
        </button>
      </Tooltip>
    </div>
  )
}

export default PlayModeTool
