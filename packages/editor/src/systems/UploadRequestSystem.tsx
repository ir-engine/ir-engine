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

import { useEffect } from 'react'

import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { UploadRequestState } from '@etherealengine/engine/src/assets/state/UploadRequestState'
import { getMutableState, getState, NO_PROXY, useState } from '@etherealengine/hyperflux'

import { uploadProjectFiles } from '../functions/assetFunctions'
import { EditorState } from '../services/EditorServices'
import { ImportSettingsState } from '../services/ImportSettingsState'

export const UploadRequestSystem = defineSystem({
  uuid: 'ee.editor.UploadRequestSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => {
    const uploadRequestState = useState(getMutableState(UploadRequestState))
    useEffect(() => {
      const uploadRequests = uploadRequestState.queue.get(NO_PROXY)
      if (uploadRequests.length === 0) return

      const importSettings = getState(ImportSettingsState)
      const projectName = getState(EditorState).projectName
      const uploadPromises = uploadRequests.map((uploadRequest) => {
        return Promise.all(
          uploadProjectFiles(
            uploadRequest.projectName,
            [uploadRequest.file],
            [`projects/${projectName}${importSettings.importFolder}`]
          ).promises
        ).then(uploadRequest.callback)
      })
      uploadRequestState.queue.set([])
    }, [uploadRequestState.queue.length])
    return null
  }
})
