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

import { Paginated } from '@feathersjs/feathers/lib'

import { FileContentType } from '@etherealengine/common/src/interfaces/FileContentType'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'

export const FILES_PAGE_LIMIT = 100

export const FileBrowserState = defineState({
  name: 'FileBrowserState',
  initial: () => ({
    files: [] as Array<FileContentType>,
    skip: 0,
    limit: FILES_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  })
})

export const FileBrowserServiceReceptor = (action) => {
  const s = getMutableState(FileBrowserState)
  matches(action)
    .when(FileBrowserAction.filesFetched.matches, (action) => {
      return s.merge({
        files: action.files.data,
        skip: action.files.skip,
        limit: action.files.limit,
        total: action.files.total,
        retrieving: false,
        fetched: true,
        updateNeeded: false,
        lastFetched: Date.now()
      })
    })
    .when(FileBrowserAction.filesFetching.matches, () => {
      return s.merge({
        retrieving: true
      })
    })
    .when(FileBrowserAction.setUpdateNeeded.matches, (action) => {
      return s.merge({
        updateNeeded: action.updateNeeded
      })
    })
}

export class FileBrowserAction {
  static filesFetching = defineAction({
    type: 'ee.client.FileBrowser.FILES_FETCHING' as const
  })

  static filesFetched = defineAction({
    type: 'ee.client.FileBrowser.FILES_FETCHED' as const,
    files: matches.object as Validator<unknown, Paginated<FileContentType>>
  })

  static filesDeleted = defineAction({
    type: 'ee.client.FileBrowser.FILES_DELETED' as const,
    contentPath: matches.any
  })

  static setUpdateNeeded = defineAction({
    type: 'ee.editor.FileBrowser.SET_UPDATE_NEEDED' as const,
    updateNeeded: matches.boolean
  })
}

let _lastDir = null! as string

export const FileBrowserService = {
  fetchFiles: async (directory: string = _lastDir, skip = 0) => {
    _lastDir = directory

    const params = {
      query: {
        $skip: skip * FILES_PAGE_LIMIT,
        $limit: FILES_PAGE_LIMIT
      }
    }

    dispatchAction(FileBrowserAction.filesFetching({}))
    const files = (await API.instance.client
      .service('file-browser')
      .get(directory, params)) as Paginated<FileContentType>
    dispatchAction(FileBrowserAction.filesFetched({ files }))
  },
  moveContent: async (oldName: string, newName: string, oldPath: string, newPath: string, isCopy = false) => {
    return API.instance.client.service('file-browser').update(null, { oldName, newName, oldPath, newPath, isCopy })
  },
  deleteContent: async (contentPath, type) => {
    await API.instance.client.service('file-browser').remove(contentPath, { query: { type } })
    dispatchAction(FileBrowserAction.filesDeleted({ contentPath }))
  },
  addNewFolder: (folderName: string) => {
    return API.instance.client.service(`file-browser`).create(folderName)
  }
}
