import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'
import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

export const FileBrowserState = defineState({
  name: 'FileBrowserState',
  initial: () => ({
    files: [] as Array<FileContentType>
  })
})

export const FileBrowserServiceReceptor = (action) => {
  getState(FileBrowserState).batch((s) => {
    matches(action).when(FileBrowserAction.filesFetched.matches, (action) => {
      return s.merge({
        files: action.files
      })
    })
  })
}

export const accessFileBrowserState = () => getState(FileBrowserState)

export const useFileBrowserState = () => useState(accessFileBrowserState())

export class FileBrowserAction {
  static filesFetched = defineAction({
    type: 'FILES_FETCHED' as const,
    files: matches.any
  })

  static filesDeleted = defineAction({
    type: 'FILES_DELETED' as const,
    contentPath: matches.any
  })
}

let _lastDir = null! as string

export const FileBrowserService = {
  fetchFiles: async (directory: string = _lastDir) => {
    _lastDir = directory
    const files = await API.instance.client.service('file-browser').get(directory)
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
