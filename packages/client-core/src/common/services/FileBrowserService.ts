import { createState, useState } from '@speigg/hookstate'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

export const state = createState({
  files: [] as Array<FileContentType>
})

store.receptors.push((action: FileBrowserActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'FILES_FETCHED':
        return s.merge({
          files: action.files
        })
    }
  }, action.type)
})

export const accessFileBrowserState = () => state

export const useFileBrowserState = () => useState(state) as any as typeof state

export const FileBrowserAction = {
  filesFetched: (files) => {
    return {
      type: 'FILES_FETCHED' as const,
      files
    }
  },
  filesDeleted: (contentPath) => {
    return {
      type: 'FILES_DELETED' as const,
      contentPath
    }
  }
}

let _lastDir = null! as string

export const FileBrowserService = {
  fetchFiles: async (directory: string = _lastDir) => {
    _lastDir = directory
    const files = await client.service('file-browser').get(directory)
    useDispatch()(FileBrowserAction.filesFetched(files))
  },
  putContent: async (fileName: string, path: string, body: Buffer, contentType: string) => {
    return client.service('file-browser').patch(null, { fileName, path, body, contentType })
  },
  moveContent: async (oldName: string, newName: string, oldPath: string, newPath: string, isCopy = false) => {
    return client.service('file-browser').update(null, { oldName, newName, oldPath, newPath, isCopy })
  },
  deleteContent: async (contentPath, type) => {
    await client.service('file-browser').remove(contentPath, { query: { type } })
    useDispatch()(FileBrowserAction.filesDeleted(contentPath))
  },
  addNewFolder: (folderName: string) => {
    return client.service(`file-browser`).create(folderName)
  }
}

export type FileBrowserActionType = ReturnType<typeof FileBrowserAction[keyof typeof FileBrowserAction]>
