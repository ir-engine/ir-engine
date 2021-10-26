import { createState, useState } from '@hookstate/core'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

export const state = createState({
  files: [], // as Array<FileInterface>
  updateNeeded: false
})

store.receptors.push((action: FileBrowserActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'FILES_FETCHED':
        result = action.files
        console.log('action')
        return s.merge({
          files: action.files,
          updateNeeded: true
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
    console.log('Upload project result', files)
    dispatch(FileBrowserAction.filesFetched(files))
  },
  moveContent: async (from, destination, isCopy = false, renameTo = null) => {
    console.log(from, destination, isCopy, renameTo)
    return await client.service('file-browser').update(from, { destination, isCopy, renameTo })
  },
  deleteContent: async (contentPath, type) => {
    return await client.service('file-browser').remove(contentPath, { query: { type } })
  },
  addNewFolder: async (selectedDirectory) => {
    return await client.service(`file-browser`).create({ fileName: `${selectedDirectory}NewFolder` })
  }
}

export type FileBrowserActionType = ReturnType<typeof FileBrowserAction[keyof typeof FileBrowserAction]>
