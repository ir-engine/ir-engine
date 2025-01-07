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

import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'
import { FileDataType } from '../constants/AssetTypes'

export const FilesViewModeState = defineState({
  name: 'FilesViewModeState',
  initial: {
    viewMode: 'icons' as 'icons' | 'list'
  },
  extension: syncStateWithLocalStorage(['viewMode'])
})

export const FilesViewModeSettings = defineState({
  name: 'FilesViewModeSettings',
  initial: {
    icons: {
      iconSize: 90
    },
    list: {
      fontSize: 15,
      selectedTableColumns: {
        name: true,
        author: true,
        statistics: true,
        type: true,
        createdAt: true,
        size: true
      }
    }
  },
  extension: syncStateWithLocalStorage(['icons', 'list'])
})

export const FilesState = defineState({
  name: 'FilesState',
  initial: () => ({
    selectedDirectory: '',
    projectName: '',
    clipboardFiles: { files: [] } as { isCopy?: boolean; files: FileDataType[] },
    searchText: ''
  })
})

export const SelectedFilesState = defineState({
  name: 'FilesSelectedFilesState',
  initial: [] as FileDataType[]
})
