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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { API } from '@ir-engine/common'
import { projectPath } from '@ir-engine/common/src/schema.type.module'
import { useMutableState } from '@ir-engine/hyperflux'
import { canDropItemOverFolder } from '@ir-engine/ui/src/components/editor/panels/Files/browserGrid'
import React, { useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { SupportedFileTypes } from '../../constants/AssetTypes'
import { EditorState } from '../../services/EditorServices'
import { FilesQueryProvider, FilesState } from '../../services/FilesState'
import FilesLoaders from './loaders'
import FilesToolbar from './toolbar'

const getValidProjectForFileBrowser = async (path: string) => {
  const [orgName, projectName] = path.split('/').slice(2, 4)
  const projects = await API.instance.service(projectPath).find({
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

function Browser() {
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
      if (fileProperties.value.some((file) => file.key === currentFile.key)) {
        fileProperties.set([])
      } else {
        fileProperties.set([currentFile])
      }
    }
  }

  const resetSelection = () => {
    fileProperties.set([])
    ClickPlacementState.resetSelectedAsset()
  }

  const [anchorEvent, setAnchorEvent] = React.useState<undefined | React.MouseEvent<HTMLDivElement>>(undefined)
  const handleClose = () => {
    setAnchorEvent(undefined)
  }

  const pasteContent = async () => {
    handleClose()
    if (isLoading) return

    fileService.update(null, {
      oldProject: projectName,
      newProject: projectName,
      oldName: currentContentRef.current.item.fullName,
      newName: currentContentRef.current.item.fullName,
      oldPath: currentContentRef.current.item.path,
      newPath: currentContentRef.current.item.path,
      isCopy: currentContentRef.current.isCopy
    })
  }

  return (
    <div
      className="h-full"
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setAnchorEvent(event)
      }}
    >
      <div
        ref={fileDropRef}
        className={twMerge(
          'mb-2 h-auto px-3 pb-6 text-gray-400 ',
          isListView ? '' : 'flex py-8',
          isFileDropOver ? 'border-2 border-gray-300' : ''
        )}
        onClick={(event) => {
          event.stopPropagation()
          resetSelection()
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
                  onClick={(event) => {
                    handleFileBrowserItemClick(event, file)
                    onSelect(event, file)
                  }}
                  onContextMenu={(event, currentFile) => {
                    if (!fileProperties.value.length) {
                      fileProperties.set([file])
                    }
                  }}
                  currentContent={currentContentRef}
                  handleDropItemsOnPanel={(data, dropOn) =>
                    dropItemsOnPanel(
                      data,
                      dropOn,
                      fileProperties.value.map((file) => file.key)
                    )
                  }
                  openFileProperties={(item) => {
                    /** If the file is not in the list of files, add it */
                    if (!(fileProperties.get(NO_PROXY) as FileDataType[]).includes(item)) {
                      if (fileProperties.value.length > 1) {
                        fileProperties.merge([item])
                      } else {
                        fileProperties.set([item])
                      }
                    }
                    PopoverState.showPopupover(
                      <FilePropertiesModal projectName={projectName} files={fileProperties.value} />
                    )
                  }}
                  openDeleteFileModal={() => {
                    PopoverState.showPopupover(
                      <DeleteFileModal
                        files={fileProperties.value as FileDataType[]}
                        onComplete={(err) => {
                          resetSelection()
                        }}
                      />
                    )
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
                  selectedFileKeys={fileProperties.value.map((file) => file.key)}
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

        <ContextMenu anchorEvent={anchorEvent} onClose={handleClose}>
          <Button variant="outline" size="small" fullWidth onClick={() => createNewFolder()}>
            {t('editor:layout.filebrowser.addNewFolder')}
          </Button>
          <Button variant="outline" size="small" fullWidth disabled={!currentContentRef.current} onClick={pasteContent}>
            {t('editor:layout.filebrowser.pasteAsset')}
          </Button>
        </ContextMenu>
      </div>
    </div>
  )
}

export default function FileBrowser() {
  const { t } = useTranslation()
  const filesState = useMutableState(FilesState)

  const originalPath = useMutableState(EditorState).projectName.value
  useEffect(() => {
    if (originalPath) filesState.selectedDirectory.set(originalPath)
  }, [originalPath])

  useEffect(() => {
    getValidProjectForFileBrowser(filesState.selectedDirectory.value).then((projectName) => {
      const orgName = projectName.includes('/') ? projectName.split('/')[0] : ''
      filesState.merge({ projectName, orgName })
    })
  }, [filesState.selectedDirectory])

  return (
    <FilesQueryProvider>
      <FilesToolbar />
      <FilesLoaders />
    </FilesQueryProvider>
  )
}
