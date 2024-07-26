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
import { FileThumbnailJobState } from '@etherealengine/client-core/src/common/services/FileThumbnailJobState'
import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import config from '@etherealengine/common/src/config'
import {
  FileBrowserContentType,
  StaticResourceType,
  UserID,
  archiverPath,
  fileBrowserPath,
  fileBrowserUploadPath,
  projectPath,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { Engine } from '@etherealengine/ecs'
import { AssetSelectionChangePropsType } from '@etherealengine/editor/src/components/assets/AssetsPreviewPanel'
import {
  FilesViewModeSettings,
  FilesViewModeState,
  availableTableColumns
} from '@etherealengine/editor/src/components/assets/FileBrowser/FileBrowserState'
import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import ImageCompressionPanel from '@etherealengine/editor/src/components/assets/ImageCompressionPanel'
import ModelCompressionPanel from '@etherealengine/editor/src/components/assets/ModelCompressionPanel'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import { SupportedFileTypes } from '@etherealengine/editor/src/constants/AssetTypes'
import { downloadBlobAsZip, inputFileWithAddToScene } from '@etherealengine/editor/src/functions/assetFunctions'
import { bytesToSize, unique } from '@etherealengine/editor/src/functions/utils'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { ClickPlacementState } from '@etherealengine/editor/src/systems/ClickPlacementSystem'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { ImmutableArray, NO_PROXY, getMutableState, useHookstate, useMutableState } from '@etherealengine/hyperflux'
import {
  useFind,
  useMutation,
  useRealtime,
  useSearch
} from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import React, { Fragment, useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { FaList } from 'react-icons/fa'
import { FiDownload, FiGrid, FiRefreshCcw } from 'react-icons/fi'
import { HiOutlinePlusCircle } from 'react-icons/hi'
import { HiMagnifyingGlass } from 'react-icons/hi2'
import { IoArrowBack, IoSettingsSharp } from 'react-icons/io5'
import { PiFolderPlusBold } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import LoadingView from '../../../../../primitives/tailwind/LoadingView'
import Slider from '../../../../../primitives/tailwind/Slider'
import Tooltip from '../../../../../primitives/tailwind/Tooltip'
import { Popup } from '../../../../tailwind/Popup'
import BooleanInput from '../../../input/Boolean'
import InputGroup from '../../../input/Group'
import { FileBrowserItem, FileTableWrapper, canDropItemOverFolder } from '../browserGrid'
import DeleteFileModal from '../browserGrid/DeleteFileModal'
import FilePropertiesModal from '../browserGrid/FilePropertiesModal'

type FileBrowserContentPanelProps = {
  projectName?: string
  onSelectionChanged: (assetSelectionChange: AssetSelectionChangePropsType) => void
  disableDnD?: boolean
  originalPath: string
  folderName?: string
  nestingDirectory?: string
}

export type DnDFileType = {
  dataTransfer: DataTransfer
  files: File[]
  items: DataTransferItemList
}

export const FILES_PAGE_LIMIT = 100

export type FileType = FileDataType

export const createFileDigest = (files: ImmutableArray<FileType>): FileType => {
  const digest: FileType = {
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
    // stats: '',
    thumbnailKey: '',
    thumbnailMode: '',
    createdAt: '',
    updatedAt: '',

    url: '',
    userId: '' as UserID
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

export const filesConsistOfContentType = function (files: ImmutableArray<FileType>, contentType: string): boolean {
  return files.every((file) => {
    if (file.isFolder) {
      return contentType.startsWith('image')
    } else {
      const guessedType: string = CommonKnownContentTypes[file.type]
      return guessedType?.startsWith(contentType)
    }
  })
}

export function isFileDataType(value: any): value is FileDataType {
  return value && value.key
}

const viewModes = [
  { mode: 'list', icon: <FaList /> },
  { mode: 'icons', icon: <FiGrid /> }
]

function extractDirectoryWithoutOrgName(directory: string, orgName: string) {
  if (!orgName) return directory

  return directory.replace(`projects/${orgName}`, 'projects/')
}

/**
 * Gets the project name that may or may not have a single slash it in from a list of valid project names
 * @todo will be optimized away once orgname is fully supported
 */
export const useValidProjectForFileBrowser = (path: string) => {
  const [orgName, projectName] = path.split('/').slice(2, 4)
  const projects = useFind(projectPath, {
    query: {
      $or: [
        {
          name: `${orgName}/${projectName}`
        },
        {
          name: orgName
        }
      ],
      action: 'studio',
      allowed: true
    }
  })
  return (
    projects.data.find((project) => project.name === orgName || project.name === `${orgName}/${projectName}`)?.name ??
    ''
  )
}

function GeneratingThumbnailsProgress() {
  const { t } = useTranslation()
  const thumbnailJobState = useMutableState(FileThumbnailJobState)

  if (!thumbnailJobState.length) return null

  return (
    <LoadingView
      titleClassname="mt-0"
      containerClassname="flex-row mt-1"
      className="mx-2 my-auto h-6 w-6"
      title={t('editor:layout.filebrowser.generatingThumbnails', { count: thumbnailJobState.length })}
    />
  )
}

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 */
const FileBrowserContentPanel: React.FC<FileBrowserContentPanelProps> = (props) => {
  const { t } = useTranslation()

  const selectedDirectory = useHookstate(props.originalPath)

  const projectName = useValidProjectForFileBrowser(selectedDirectory.value)
  const orgName = projectName.includes('/') ? projectName.split('/')[0] : ''

  const fileProperties = useHookstate<FileType[]>([])
  const anchorEl = useHookstate<HTMLButtonElement | null>(null)

  const filesViewMode = useMutableState(FilesViewModeState).viewMode

  const page = useHookstate(0)

  const fileQuery = useFind(fileBrowserPath, {
    query: {
      $skip: page.value,
      $limit: FILES_PAGE_LIMIT * 100,
      directory: selectedDirectory.value
    }
  })
  const isLoading = fileQuery.status === 'pending'
  const searchText = useHookstate('')
  useSearch(
    fileQuery,
    {
      key: {
        $like: `%${searchText.value}%`
      }
    },
    searchText.value
  )
  const files = fileQuery.data.map((file: FileBrowserContentType) => {
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

  useRealtime(staticResourcePath, fileQuery.refetch)

  FileThumbnailJobState.useGenerateThumbnails(fileQuery.data)

  const fileService = useMutation(fileBrowserPath)

  useEffect(() => {
    refreshDirectory()
  }, [selectedDirectory])

  const refreshDirectory = async () => {
    await fileQuery.refetch()
  }

  const changeDirectoryByPath = (path: string) => {
    selectedDirectory.set(path)
    fileQuery.setPage(0)
  }

  const onSelect = (params: FileDataType) => {
    if (params.isFolder) {
      if (!fileProperties.value.some((file) => file.key === params.key)) {
        const newPath = `${selectedDirectory.value}${params.name}/`
        changeDirectoryByPath(newPath)
      }
    } else {
      props.onSelectionChanged({
        resourceUrl: params.url,
        name: params.name,
        contentType: params.type,
        size: params.size
      })

      ClickPlacementState.setSelectedAsset(params.url)
    }
  }

  const createNewFolder = async () => {
    fileService.create(`${selectedDirectory.value}New_Folder`)
  }

  const dropItemsOnPanel = async (
    data: FileDataType | DnDFileType,
    dropOn?: FileDataType,
    selectedFileKeys?: string[]
  ) => {
    if (isLoading) return
    const destinationPath = dropOn?.isFolder ? `${dropOn.key}/` : selectedDirectory.value

    if (selectedFileKeys && selectedFileKeys.length > 0) {
      await Promise.all(
        selectedFileKeys.map(async (fileKey) => {
          const file = files.find((f) => f.key === fileKey)
          if (file) {
            const newName = file.isFolder ? file.name : `${file.name}${file.type ? '.' + file.type : ''}`
            await moveContent(file.fullName, newName, file.path, destinationPath, false)
          }
        })
      )
    } else if (isFileDataType(data)) {
      if (dropOn?.isFolder) {
        const newName = data.isFolder ? data.name : `${data.name}${data.type ? '.' + data.type : ''}`
        await moveContent(data.fullName, newName, data.path, destinationPath, false)
      }
    } else {
      // handle drops from user's local file system by creating/uploading dropped files
      const folder = destinationPath.substring(0, destinationPath.lastIndexOf('/') + 1)
      const projectName = folder.split('/')[1]
      const relativePath = folder.replace('projects/' + projectName + '/', '')

      await Promise.all(
        data.files.map(async (file) => {
          const assetType = !file.type ? AssetLoader.getAssetType(file.name) : file.type
          if (!assetType) {
            // creating directory
            await fileService.create(`${destinationPath}${file.name}`)
          } else {
            try {
              const name = processFileName(file.name)
              await uploadToFeathersService(fileBrowserUploadPath, [file], {
                args: [
                  {
                    project: projectName,
                    path: relativePath + name,
                    contentType: file.type
                  }
                ]
              }).promise
            } catch (err) {
              NotificationService.dispatchNotify(err.message, { variant: 'error' })
            }
          }
        })
      )
    }

    await refreshDirectory()
  }

  const onBackDirectory = () => {
    const pattern = /([^/]+)/g
    const result = selectedDirectory.value.match(pattern)
    if (!result || result.length === 1 || (orgName && result.length === 2)) return
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    changeDirectoryByPath(newPath)
  }

  const moveContent = async (
    oldName: string,
    newName: string,
    oldPath: string,
    newPath: string,
    isCopy = false
  ): Promise<void> => {
    if (isLoading) return
    try {
      await fileService.update(null, {
        oldProject: projectName,
        newProject: projectName,
        oldName,
        newName,
        oldPath,
        newPath,
        isCopy
      })

      await refreshDirectory()
    } catch (error) {
      console.error('Error moving file:', error)
      NotificationService.dispatchNotify((error as Error).message, { variant: 'error' })
    }
  }

  const currentContentRef = useRef(null! as { item: FileDataType; isCopy: boolean })

  const showDownloadButtons = selectedDirectory.value.startsWith('/projects/' + projectName + '/')
  const showUploadButtons =
    selectedDirectory.value.startsWith('/projects/' + projectName + '/public/') ||
    selectedDirectory.value.startsWith('/projects/' + projectName + '/assets/')
  const showBackButton = selectedDirectory.value.split('/').length > props.originalPath.split('/').length

  const handleDownloadProject = async () => {
    const data = await Engine.instance.api
      .service(archiverPath)
      .get(null, { query: { project: projectName } })
      .catch((err: Error) => {
        NotificationService.dispatchNotify(err.message, { variant: 'warning' })
        return null
      })
    if (!data) return
    const blob = await (await fetch(`${config.client.fileServer}/${data}`)).blob()

    let fileName: string
    if (selectedDirectory.value.at(-1) === '/') {
      fileName = selectedDirectory.value.split('/').at(-2) as string
    } else {
      fileName = selectedDirectory.value.split('/').at(-1) as string
    }

    downloadBlobAsZip(blob, fileName)
  }

  const BreadcrumbItems = () => {
    const handleBreadcrumbDirectoryClick = (targetFolder: string) => {
      if (orgName && targetFolder === 'projects') return
      const pattern = /([^/]+)/g
      const result = selectedDirectory.value.match(pattern)
      if (!result) return
      let newPath = '/'
      for (const folder of result) {
        newPath += folder + '/'
        if (folder === targetFolder) {
          break
        }
      }
      changeDirectoryByPath(newPath)
    }
    let breadcrumbDirectoryFiles = extractDirectoryWithoutOrgName(selectedDirectory.value, orgName)
      .slice(1, -1)
      .split('/')

    const nestedIndex = breadcrumbDirectoryFiles.indexOf('projects')

    breadcrumbDirectoryFiles = breadcrumbDirectoryFiles.filter((_, idx) => idx >= nestedIndex)

    return (
      <nav
        className="flex h-full w-full rounded-[4px] border border-theme-primary bg-theme-primary text-xs text-[#A3A3A3]"
        aria-label="Breadcrumb"
      >
        <span className="flex h-full w-full items-center justify-center space-x-2 overflow-x-auto whitespace-nowrap px-4">
          {breadcrumbDirectoryFiles.map((file, index, arr) => (
            <Fragment key={index}>
              {index !== 0 && ( // Add separator for all but the first item
                <span className="cursor-default align-middle text-xs">{'>'}</span>
              )}
              {index === arr.length - 1 || (orgName && index === 0) ? (
                <span className="overflow-hidden">
                  <span className="inline-block w-full cursor-default overflow-hidden overflow-ellipsis whitespace-nowrap text-right align-middle">
                    {file}
                  </span>
                </span>
              ) : (
                <a
                  className="cursor-pointer overflow-hidden align-middle text-xs text-[#A3A3A3] hover:text-theme-highlight hover:underline focus:text-theme-highlight"
                  onClick={() => handleBreadcrumbDirectoryClick(file)}
                >
                  <span className="inline-block w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-right align-middle">
                    {file}
                  </span>
                </a>
              )}
            </Fragment>
          ))}
        </span>
      </nav>
    )
  }

  const DropArea = () => {
    const [{ isFileDropOver }, fileDropRef] = useDrop({
      accept: [...SupportedFileTypes],
      canDrop: (item: Record<string, unknown>) => 'key' in item || canDropItemOverFolder(selectedDirectory.value),
      drop: (dropItem) => dropItemsOnPanel(dropItem as any),
      collect: (monitor) => ({ isFileDropOver: monitor.canDrop() && monitor.isOver() })
    })

    const isListView = filesViewMode.value === 'list'
    const staticResourceData = useFind(staticResourcePath, {
      query: {
        key: {
          $in: isListView ? files.map((file) => file.key) : []
        },
        project: props.projectName,
        $select: ['key', 'updatedAt'] as any,
        $limit: FILES_PAGE_LIMIT
      }
    })
    const staticResourceModifiedDates = useHookstate<Record<string, string>>({})

    useEffect(() => {
      if (staticResourceData.status !== 'success') return
      const modifiedDates: Record<string, string> = {}
      staticResourceData.data.forEach((data) => {
        modifiedDates[data.key] = new Date(data.updatedAt).toLocaleString()
      })
      staticResourceModifiedDates.set(modifiedDates)
    }, [staticResourceData.status])

    const handleFileBrowserItemClick = (e: React.MouseEvent, currentFile: FileDataType) => {
      e.stopPropagation()
      if (e.ctrlKey || e.metaKey) {
        fileProperties.set((prevFileProperties) =>
          prevFileProperties.some((file) => file.key === currentFile.key)
            ? prevFileProperties.filter((file) => file.key !== currentFile.key)
            : [...prevFileProperties, currentFile]
        )
      } else if (e.shiftKey) {
        const lastIndex = files.findIndex((file) => file.key === fileProperties.value.at(-1)?.key)
        const clickedIndex = files.findIndex((file) => file.key === currentFile.key)
        const newSelectedFiles = files.slice(Math.min(lastIndex, clickedIndex), Math.max(lastIndex, clickedIndex) + 1)
        fileProperties.set((prevFileProperties) => [
          ...prevFileProperties,
          ...newSelectedFiles.filter((newFile) => !prevFileProperties.some((file) => newFile.key === file.key))
        ])
      } else {
        if (currentFile.isFolder) {
          onSelect(currentFile)
        } else {
          fileProperties.set([currentFile])
        }
      }
    }

    return (
      <div
        ref={fileDropRef}
        className={twMerge(
          'mb-2 h-auto p-6 px-4 text-gray-400 ',
          isListView ? '' : 'flex py-8',
          isFileDropOver ? 'border-2 border-gray-300' : ''
        )}
        onClick={(event) => {
          event.stopPropagation()
          fileProperties.set([])
          ClickPlacementState.resetSelectedAsset()
        }}
      >
        <div className={twMerge(!isListView && 'flex flex-wrap gap-2')}>
          <FileTableWrapper wrap={isListView}>
            <>
              {unique(files, (file) => file.key).map((file) => (
                <FileBrowserItem
                  key={file.key}
                  item={file}
                  disableDnD={props.disableDnD}
                  projectName={projectName}
                  onClick={(event, currentFile) => {
                    handleFileBrowserItemClick(event, currentFile)
                  }}
                  currentContent={currentContentRef}
                  handleDropItemsOnPanel={(data, dropOn) =>
                    dropItemsOnPanel(
                      data,
                      dropOn,
                      fileProperties.value.map((file) => file.key)
                    )
                  }
                  openFileProperties={() => {
                    PopoverState.showPopupover(
                      <FilePropertiesModal projectName={projectName} files={fileProperties.value} />
                    )
                  }}
                  openDeleteFileModal={() => {
                    PopoverState.showPopupover(<DeleteFileModal files={fileProperties.value as FileDataType[]} />)
                  }}
                  openImageCompress={() => {
                    if (filesConsistOfContentType(fileProperties.value, 'image')) {
                      PopoverState.showPopupover(
                        <ImageCompressionPanel
                          selectedFiles={fileProperties.value}
                          refreshDirectory={refreshDirectory}
                        />
                      )
                    }
                  }}
                  openModelCompress={() => {
                    if (filesConsistOfContentType(fileProperties.value, 'model')) {
                      PopoverState.showPopupover(
                        <ModelCompressionPanel
                          selectedFiles={fileProperties.value}
                          refreshDirectory={refreshDirectory}
                        />
                      )
                    }
                  }}
                  isFilesLoading={isLoading}
                  addFolder={createNewFolder}
                  isListView={isListView}
                  staticResourceModifiedDates={staticResourceModifiedDates.value}
                  isSelected={fileProperties.value.some(({ key }) => key === file.key)}
                  refreshDirectory={refreshDirectory}
                />
              ))}
            </>
          </FileTableWrapper>
          {/*   
            {total > 0 && validFiles.value.length < total && (
            <TablePagination
              className={styles.pagination}
              component="div"
              count={total}
              page={page}
              rowsPerPage={FILES_PAGE_LIMIT}
              rowsPerPageOptions={[]}
              onPageChange={handlePageChange}
            />
          )}*/}
        </div>
      </div>
    )
  }

  const ViewModeSettings = () => {
    const viewModeSettings = useHookstate(getMutableState(FilesViewModeSettings))
    return (
      <Popup
        contentStyle={{ background: '#15171b', border: 'solid', borderColor: '#5d646c' }}
        position={'bottom left'}
        trigger={
          <Tooltip title={t('editor:layout.filebrowser.view-mode.settings.name')}>
            <Button variant="transparent" startIcon={<IoSettingsSharp />} className="p-0" />
          </Tooltip>
        }
      >
        {filesViewMode.value === 'icons' ? (
          <InputGroup label={t('editor:layout.filebrowser.view-mode.settings.iconSize')}>
            <Slider
              min={10}
              max={100}
              step={0.5}
              value={viewModeSettings.icons.iconSize.value}
              onChange={viewModeSettings.icons.iconSize.set}
              onRelease={viewModeSettings.icons.iconSize.set}
            />
          </InputGroup>
        ) : (
          <>
            <InputGroup label={t('editor:layout.filebrowser.view-mode.settings.fontSize')}>
              <Slider
                min={10}
                max={100}
                step={0.5}
                value={viewModeSettings.list.fontSize.value}
                onChange={viewModeSettings.list.fontSize.set}
                onRelease={viewModeSettings.list.fontSize.set}
              />
            </InputGroup>

            <div>
              <div className="mt-1 flex flex-auto text-white">
                <label>{t('editor:layout.filebrowser.view-mode.settings.select-listColumns')}</label>
              </div>
              <div className="flex-col">
                {availableTableColumns.map((column) => (
                  <InputGroup label={t(`editor:layout.filebrowser.table-list.headers.${column}`)}>
                    <BooleanInput
                      value={viewModeSettings.list.selectedTableColumns[column].value}
                      onChange={(value) => viewModeSettings.list.selectedTableColumns[column].set(value)}
                    />
                  </InputGroup>
                ))}
              </div>
            </div>
          </>
        )}
      </Popup>
    )
  }

  return (
    <>
      <div className="mb-1 flex h-8 items-center gap-2 bg-theme-surface-main">
        <div
          id="backDir"
          className={`flex items-center ${
            showBackButton ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <Tooltip title={t('editor:layout.filebrowser.back')} className="left-1">
            <Button variant="transparent" startIcon={<IoArrowBack />} className={`p-0`} onClick={onBackDirectory} />
          </Tooltip>
        </div>

        <div id="refreshDir" className="flex items-center">
          <Tooltip title={t('editor:layout.filebrowser.refresh')}>
            <Button variant="transparent" startIcon={<FiRefreshCcw />} className="p-0" onClick={refreshDirectory} />
          </Tooltip>
        </div>

        <ViewModeSettings />

        <div className="w-30 flex h-7 flex-row items-center gap-1 rounded bg-theme-surfaceInput px-2 py-1">
          {viewModes.map(({ mode, icon }) => (
            <Button
              key={mode}
              variant="transparent"
              startIcon={icon}
              className={`p-0 ${filesViewMode.value !== mode ? 'opacity-50' : ''}`}
              onClick={() => filesViewMode.set(mode as 'icons' | 'list')}
            />
          ))}
        </div>

        <div className="align-center flex h-7 w-full justify-center gap-2 sm:px-2 md:px-4 lg:px-6 xl:px-10">
          <div className="hidden h-full lg:block lg:w-1/2 xl:w-[400px]">
            <BreadcrumbItems />
          </div>
          <Input
            placeholder={t('editor:layout.filebrowser.search-placeholder')}
            value={searchText.value}
            onChange={(e) => {
              searchText.set(e.target.value)
            }}
            labelClassname="text-sm text-red-500"
            containerClassname="flex h-full bg-theme-primary rounded-[4px] w-full"
            className="h-7 w-full rounded-[4px] bg-theme-primary py-0 text-xs text-[#A3A3A3] placeholder:text-[#A3A3A3] focus-visible:ring-0"
            startComponent={<HiMagnifyingGlass className="h-[14px] w-[14px] text-[#A3A3A3]" />}
          />
        </div>

        <div id="downloadProject" className="flex items-center">
          <Tooltip title={t('editor:layout.filebrowser.downloadProject')}>
            <Button
              variant="transparent"
              startIcon={<FiDownload />}
              className="p-0"
              onClick={handleDownloadProject}
              disabled={!showDownloadButtons}
            />
          </Tooltip>
        </div>

        <div id="newFolder" className="flex items-center">
          <Tooltip title={t('editor:layout.filebrowser.addNewFolder')}>
            <Button variant="transparent" startIcon={<PiFolderPlusBold />} className="p-0" onClick={createNewFolder} />
          </Tooltip>
        </div>

        <Button
          id="uploadFiles"
          startIcon={<HiOutlinePlusCircle />}
          variant="transparent"
          disabled={!showUploadButtons}
          rounded="none"
          className="h-full whitespace-nowrap bg-theme-highlight px-2"
          size="small"
          onClick={() =>
            inputFileWithAddToScene({ projectName, directoryPath: selectedDirectory.get(NO_PROXY).slice(1) })
              .then(refreshDirectory)
              .catch((err) => {
                NotificationService.dispatchNotify(err.message, { variant: 'error' })
              })
          }
        >
          {t('editor:layout.filebrowser.uploadFiles')}
        </Button>
        <Button
          id="uploadFiles"
          startIcon={<HiOutlinePlusCircle />}
          variant="transparent"
          disabled={!showUploadButtons}
          rounded="none"
          className="h-full whitespace-nowrap bg-theme-highlight px-2"
          size="small"
          onClick={() =>
            inputFileWithAddToScene({
              projectName,
              directoryPath: selectedDirectory.get(NO_PROXY).slice(1),
              preserveDirectory: true
            })
              .then(refreshDirectory)
              .catch((err) => {
                NotificationService.dispatchNotify(err.message, { variant: 'error' })
              })
          }
        >
          {t('editor:layout.filebrowser.uploadFolder')}
        </Button>
      </div>
      {isLoading && <LoadingView title={t('editor:layout.filebrowser.loadingFiles')} className="h-6 w-6" />}
      <GeneratingThumbnailsProgress />
      <div id="file-browser-panel" className="h-full overflow-auto">
        <DndWrapper id="file-browser-panel">
          <DropArea />
        </DndWrapper>
      </div>
    </>
  )
}

export default function FilesPanelContainer() {
  const assetsPreviewPanelRef = React.useRef()
  const originalPath = useMutableState(EditorState).projectName.value

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.(props)
  }

  return (
    <FileBrowserContentPanel
      originalPath={'/projects/' + originalPath + '/assets/'}
      onSelectionChanged={onSelectionChanged}
    />
  )
}
