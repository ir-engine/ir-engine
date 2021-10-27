import { createState, useState } from '@hookstate/core'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

export const state = createState({
  files: [] as Array<FileContentType>,
  updateNeeded: false
})

store.receptors.push((action: FileBrowserActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'FILES_FETCHED':
        result = action.files
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
  }
}

export const FileBrowserService = {
  fetchFiles: async (directory) => {
    const dispatch = useDispatch()
    const files = await client.service('file-browser').get(directory)
    console.log('FileBrowserService.fetchFiles result', files)
    dispatch(FileBrowserAction.filesFetched(files))
  },
  moveContent: async (from, destination, isCopy = false, renameTo = null) => {
    console.log(from, destination, isCopy, renameTo)
    console.warn('[File Browser]: Temporarily disabled for instability. - TODO')
    // const result = await client.service('file-browser').update(from, { destination, isCopy, renameTo })
    // console.log('FileBrowserService.moveContent result', result)
  },
  deleteContent: async (contentPath, type) => {
    const result = await client.service('file-browser').remove(contentPath, { query: { type } })
    console.log('FileBrowserService.deleteContent result', result)
  },
  addNewFolder: async (folderName) => {
    const result = await client.service(`file-browser`).create(folderName)
    console.log('FileBrowserService.addNewFolder result', result)
  }
}

export type FileBrowserActionType = ReturnType<typeof FileBrowserAction[keyof typeof FileBrowserAction]>
