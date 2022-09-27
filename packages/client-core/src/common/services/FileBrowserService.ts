import { Paginated } from '@feathersjs/feathers/lib'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

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
  const s = getState(FileBrowserState)
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
}

export const accessFileBrowserState = () => getState(FileBrowserState)

export const useFileBrowserState = () => useState(accessFileBrowserState())

export class FileBrowserAction {
  static filesFetching = defineAction({
    type: 'xre.client.FileBrowser.FILES_FETCHING' as const
  })

  static filesFetched = defineAction({
    type: 'xre.client.FileBrowser.FILES_FETCHED' as const,
    files: matches.object as Validator<unknown, Paginated<FileContentType>>
  })

  static filesDeleted = defineAction({
    type: 'xre.client.FileBrowser.FILES_DELETED' as const,
    contentPath: matches.any
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
  putContent: async (fileName: string, path: string, body: Buffer, contentType: string) => {
    return API.instance.client.service('file-browser').patch(null, { fileName, path, body, contentType })
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
