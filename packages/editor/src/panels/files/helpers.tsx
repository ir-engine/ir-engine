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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { ImmutableArray, getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { FileThumbnailJobState } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useFind, useMutation, useRealtime, useSearch } from '@ir-engine/common'
import {
  StaticResourceType,
  UserID,
  fileBrowserPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@ir-engine/common/src/utils/CommonKnownContentTypes'
import { bytesToSize } from '@ir-engine/common/src/utils/btyesToSize'
import { cleanFileNameFile } from '@ir-engine/common/src/utils/cleanFileName'
import { AssetLoader } from '@ir-engine/engine/src/assets/classes/AssetLoader'
import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'
import React, { ReactNode, createContext, useContext, useEffect, useMemo } from 'react'
import { DnDFileType, FileDataType } from '../../constants/AssetTypes'
import { filterExistingFiles, handleUploadFiles, validatedFiles } from '../../functions/assetFunctions'
import { EditorState } from '../../services/EditorServices'
import { FilesState } from '../../services/FilesState'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import { AssetCategoryNode } from '../assets/categories'

/* CONSTANTS */

export const FILES_PAGE_LIMIT = 100 as const

export const availableTableColumns = ['name', 'type', 'author', 'createdAt', 'statistics', 'size'] as const

/* HOOKS */

const FilesQueryContext = createContext({
  filesQuery: null as null | ReturnType<typeof useFind<'file-browser'>>,
  files: [] as FileDataType[],
  categories: [] as any,
  changeDirectoryByPath: (_path: string) => {},
  backDirectory: () => {},
  refreshDirectory: async () => {},
  createNewFolder: () => {}
})

export const CurrentFilesQueryProvider = ({ children }: { children?: ReactNode }) => {
  const filesState = useMutableState(FilesState)
  const categories = useHookstate<any>([])
  const directory = (
    filesState.selectedDirectory.value !== ''
      ? filesState.selectedDirectory.value
      : '/projects/' + filesState.projectName.value
  ).replace(/^\/+/, '')

  const projectName = useMutableState(EditorState).projectName.value

  const filesQuery = useFind(fileBrowserPath, {
    query: {
      $limit: FILES_PAGE_LIMIT,
      directory,
      recursive: !!filesState.searchText.value
    }
  })

  const foldersQuery = useFind(fileBrowserPath, {
    query: {
      $limit: FILES_PAGE_LIMIT,
      directory: `/projects/${projectName}/public/**`
    }
  })

  const fileService = useMutation(fileBrowserPath)

  useSearch(
    filesQuery,
    {
      name: {
        $like: `%${filesState.searchText.value}%`
      }
    },
    filesState.searchText.value
  )

  const changeDirectoryByPath = (path: string) => {
    filesState.merge({ selectedDirectory: path })
    filesQuery.setPage(0)
  }

  const backDirectory = () => {
    const pattern = /([^/]+)/g
    const result = filesState.selectedDirectory.value.match(pattern)
    if (!result || result.length === 1) return
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    changeDirectoryByPath(newPath)
  }

  const refreshDirectory = async () => {
    filesQuery.refetch()
    foldersQuery.refetch()
  }

  useEffect(() => {
    refreshDirectory()
  }, [filesState.selectedDirectory])

  const createNewFolder = () => {
    let currentDirectory = filesState.selectedDirectory.value
    const projectName = getMutableState(FilesState).projectName.get(NO_PROXY)
    const importFolder = getMutableState(ImportSettingsState).importFolder.get(NO_PROXY)
    if (currentDirectory.startsWith(`/projects/${projectName}${importFolder}`)) {
      currentDirectory = currentDirectory.replace(importFolder, '/public/')
    }
    fileService.create(`${currentDirectory}New-Folder`)
  }

  const files = useMemo(() => {
    return filesQuery.data.map((file) => {
      const isFolder = file.type === 'folder'
      const fullName = isFolder ? file.name : file.name + '.' + file.type

      return {
        ...file,
        size: file.size ? bytesToSize(file.size) : '0',
        path: isFolder ? file.key.split(file.name)[0] : file.key.split(fullName)[0],
        fullName,
        isFolder
      }
    })
  }, [filesQuery.data])

  useRealtime(staticResourcePath, filesQuery.refetch)
  FileThumbnailJobState.useGenerateThumbnails(filesQuery.data)
  FileThumbnailJobState.useGenerateDimensions(filesQuery.data)

  function buildHierarchy(paths: { key: string; name: string }[]): AssetCategoryNode[] {
    const map = new Map<string, AssetCategoryNode>()
    const roots: AssetCategoryNode[] = []

    for (const { key: path } of paths) {
      const parts = path
        .split('/')
        .slice(`/projects/${projectName}/public/**`.split('/').length - 2)
        .filter(Boolean)
      let currentPath = ''
      let parentNode: AssetCategoryNode | null = null

      for (let i = 0; i < parts.length; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i]

        if (!map.has(currentPath)) {
          const newNode: AssetCategoryNode = {
            name: parts[i],
            path: `/${path}`,
            depth: currentPath.split('/').length - 1,
            children: []
          }
          map.set(currentPath, newNode)

          if (parentNode) {
            parentNode.children.push(newNode)
          } else {
            roots.push(newNode)
          }
        }

        parentNode = map.get(currentPath)!
      }
    }

    return roots
  }

  const folders = React.useMemo(() => foldersQuery.data.filter((file) => file.type === 'folder'), [foldersQuery.data])

  useEffect(() => {
    if (foldersQuery.status === 'success') {
      categories.set(buildHierarchy(folders))
    }
  }, [foldersQuery.data])

  return (
    <FilesQueryContext.Provider
      value={{
        categories,
        filesQuery,
        files,
        changeDirectoryByPath,
        backDirectory,
        refreshDirectory,
        createNewFolder
      }}
    >
      {children}
    </FilesQueryContext.Provider>
  )
}

export const useCurrentFiles = () => useContext(FilesQueryContext)

function isFileDataType(value: any): value is FileDataType {
  return value && value.key
}

export function useFileBrowserDrop() {
  const filesState = useMutableState(FilesState)
  const currentFiles = useCurrentFiles()
  const fileService = useMutation(fileBrowserPath)
  const isLoading = currentFiles.filesQuery?.status === 'pending'

  const moveContent = async (
    oldName: string,
    newName: string,
    oldPath: string,
    newPath: string,
    isCopy = false
  ): Promise<void> => {
    if (isLoading) return
    if (!isCopy && newPath.startsWith(`${oldPath}/`)) return
    try {
      await fileService.update(null, {
        oldProject: filesState.projectName.value,
        newProject: filesState.projectName.value,
        oldName,
        newName,
        oldPath,
        newPath,
        isCopy
      })

      await currentFiles.refreshDirectory()
    } catch (error) {
      console.error('Error moving file:', error)
      NotificationService.dispatchNotify((error as Error).message, { variant: 'error' })
    }
  }

  const dropItemsOnFileBrowser = async (
    data: FileDataType | DnDFileType,
    dropOn?: FileDataType,
    selectedFileKeys?: string[]
  ) => {
    const destinationPath = dropOn?.isFolder ? `${dropOn.key}` : filesState.selectedDirectory.value

    if (isFileDataType(data)) {
      if (dropOn?.isFolder) {
        const newName = data.isFolder ? data.name : `${data.name}${data.type ? '.' + data.type : ''}`
        await moveContent(data.fullName, newName, data.path, destinationPath, false)
      }
    } else if (selectedFileKeys && selectedFileKeys.length > 0) {
      await Promise.all(
        selectedFileKeys.map(async (fileKey) => {
          const file = currentFiles.files.find((f) => f.key === fileKey)
          if (file) {
            const newName = file.isFolder ? file.name : `${file.name}${file.type ? '.' + file.type : ''}`
            await moveContent(file.fullName, newName, file.path, destinationPath, false)
          }
        })
      )
    } else {
      const path = filesState.selectedDirectory.get(NO_PROXY).slice(1)
      const filesToUpload = [] as File[]

      await Promise.all(
        data.files.map(async (file) => {
          file = cleanFileNameFile(file)
          const assetType = !file.type || file.type.length === 0 ? AssetLoader.getAssetType(file.name) : file.type
          if (!assetType || assetType === file.name) {
            await fileService.create(`${destinationPath}${file.name}`)
          } else {
            filesToUpload.push(file)
          }
        })
      )

      if (filesToUpload.length) {
        try {
          const uniqueFiles = await filterExistingFiles(filesState.projectName.value, path, filesToUpload)
          const sanitizedFiles = validatedFiles(uniqueFiles)
          await handleUploadFiles(filesState.projectName.value, path, sanitizedFiles)
        } catch (err) {
          NotificationService.dispatchNotify(err.message, { variant: 'error' })
        }
      }
    }

    await currentFiles.refreshDirectory()
  }

  return dropItemsOnFileBrowser
}

/* UTILITIES */

export const createFileDigest = (files: ImmutableArray<FileDataType>): FileDataType => {
  const digest: FileDataType = {
    key: '',
    path: '',
    name: '',
    fullName: '',
    url: '',
    type: '',
    isFolder: false
  }
  for (const key in digest) {
    const allValues = new Set(files.map((file) => file[key]))
    if (allValues.size === 1) {
      digest[key] = Array.from(allValues).pop()
    }
  }
  return digest
}

export const createStaticResourceDigest = (staticResources: ImmutableArray<StaticResourceType>): StaticResourceType => {
  const digest: StaticResourceType = {
    id: '',
    key: '',
    mimeType: '',
    hash: '',
    type: '',
    project: '',
    // dependencies: '',
    attribution: '',
    licensing: '',
    description: '',
    name: '',
    // stats: '',
    thumbnailKey: '',
    thumbnailMode: '',
    updatedBy: '' as UserID,
    createdAt: '',
    updatedAt: '',

    url: '',
    userId: '' as UserID,
    width: null,
    height: null,
    depth: null
  }
  for (const key in digest) {
    const allValues = new Set(staticResources.map((resource) => resource[key]))
    if (allValues.size === 1) {
      digest[key] = Array.from(allValues).pop()
    }
  }
  const allTags: string[] = Array.from(new Set(staticResources.flatMap((resource) => resource.tags))).filter(
    (tag) => tag != null
  ) as string[]
  const commonTags = allTags.filter((tag) => staticResources.every((resource) => resource.tags?.includes(tag)))
  digest.tags = commonTags
  return digest
}

export function fileConsistsOfContentType(files: readonly FileDataType[], contentType: string): boolean {
  return (
    files.length > 0 &&
    files.every((file) => {
      if (file.isFolder) {
        return contentType.startsWith('image')
      } else {
        const guessedType: string = CommonKnownContentTypes[file.type]
        return guessedType?.startsWith(contentType)
      }
    })
  )
}

export const canDropOnFileBrowser = (folderName: string) =>
  folderName.endsWith('/assets') ||
  folderName.indexOf('/assets/') !== -1 ||
  folderName.endsWith('/public') ||
  folderName.indexOf('/public/') !== -1
