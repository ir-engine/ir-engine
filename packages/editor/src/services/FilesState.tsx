import { fileBrowserPath } from '@etherealengine/common/src/schema.type.module'
import { defineState, syncStateWithLocalStorage, useMutableState } from '@etherealengine/hyperflux'
import { useFind, useMutation, useSearch } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import React, { ReactNode, createContext, useContext } from 'react'

export const FilesViewModeState = defineState({
  name: 'FilesViewModeState',
  initial: {
    viewMode: 'icons' as 'icons' | 'list'
  },
  extension: syncStateWithLocalStorage(['viewMode'])
})

export const availableTableColumns = ['name', 'type', 'dateModified', 'size'] as const

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
        type: true,
        dateModified: true,
        size: true
      }
    }
  },
  extension: syncStateWithLocalStorage(['icons', 'list'])
})

export const FILES_PAGE_LIMIT = 100

export const FilesState = defineState({
  name: 'FilesState',
  initial: () => ({
    selectedDirectory: '',
    projectName: '',
    orgName: '',
    searchText: ''
  })
})

const FilesQueryContext = createContext({
  filesQuery: null as null | ReturnType<typeof useFind<'file-browser'>>,
  onChangeDirectoryByPath: (_path: string) => {},
  onBackDirectory: () => {},
  onRefreshDirectory: () => {},
  onCreateNewFolder: () => {}
})

export const FilesQueryProvider = ({ children }: { children?: ReactNode }) => {
  const filesState = useMutableState(FilesState)

  const filesQuery = useFind(fileBrowserPath, {
    query: {
      $limit: FILES_PAGE_LIMIT * 100,
      directory: filesState.selectedDirectory.value
    }
  })

  useSearch(
    filesQuery,
    {
      key: {
        $like: `%${filesState.searchText.value}%`
      }
    },
    filesState.searchText.value
  )

  const onChangeDirectoryByPath = (path: string) => {
    filesState.merge({ selectedDirectory: path })
    filesQuery.setPage(0)
  }

  const onBackDirectory = () => {
    const pattern = /([^/]+)/g
    const result = filesState.selectedDirectory.value.match(pattern)
    if (!result || result.length === 1 || (filesState.orgName && result.length === 2)) return
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    onChangeDirectoryByPath(newPath)
  }

  const onRefreshDirectory = async () => {
    await filesQuery.refetch()
  }

  const onCreateNewFolder = () => useMutation(fileBrowserPath).create(`${filesState.selectedDirectory.value}New_Folder`)

  return (
    <FilesQueryContext.Provider
      value={{ filesQuery, onChangeDirectoryByPath, onBackDirectory, onRefreshDirectory, onCreateNewFolder }}
    >
      {children}
    </FilesQueryContext.Provider>
  )
}

export const useFilesQuery = () => useContext(FilesQueryContext)
