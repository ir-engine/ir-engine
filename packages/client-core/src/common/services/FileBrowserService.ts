import { Paginated } from '@feathersjs/feathers/lib'

import { FileContentType } from '@etherealengine/common/src/interfaces/FileContentType'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState, useState } from '@etherealengine/hyperflux'

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
/**@deprecated use getMutableState directly instead */
export const accessFileBrowserState = () => getMutableState(FileBrowserState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useFileBrowserState = () => useState(accessFileBrowserState())

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
