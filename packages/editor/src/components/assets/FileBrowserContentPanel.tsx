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

import { Downgraded } from '@hookstate/core'
import React, { useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { saveAs } from 'save-as'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import {
  FileBrowserService,
  FileBrowserState,
  FILES_PAGE_LIMIT
} from '@etherealengine/client-core/src/common/services/FileBrowserService'
import { NotificationService } from '@etherealengine/client-core/src/common/services/NotificationService'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import config from '@etherealengine/common/src/config'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { DndWrapper } from '@etherealengine/editor/src/components/dnd/DndWrapper'
import {
  ImageConvertDefaultParms,
  ImageConvertParms
} from '@etherealengine/engine/src/assets/constants/ImageConvertParms'
import { getMutableState, NO_PROXY, useHookstate, useState } from '@etherealengine/hyperflux'

import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder'
import DownloadIcon from '@mui/icons-material/Download'
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual'
import VideocamIcon from '@mui/icons-material/Videocam'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import Dialog from '@etherealengine/ui/src/primitives/mui/Dialog'
import DialogTitle from '@etherealengine/ui/src/primitives/mui/DialogTitle'
import Grid from '@etherealengine/ui/src/primitives/mui/Grid'
import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { Breadcrumbs, Link, PopoverPosition, TablePagination } from '@mui/material'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { archiverPath } from '@etherealengine/engine/src/schemas/media/archiver.schema'
import { fileBrowserUploadPath } from '@etherealengine/engine/src/schemas/media/file-browser-upload.schema'
import { SupportedFileTypes } from '../../constants/AssetTypes'
import { bytesToSize, unique } from '../../functions/utils'
import { Button } from '../inputs/Button'
import StringInput from '../inputs/StringInput'
import { ToolButton } from '../toolbar/ToolButton'
import { AssetSelectionChangePropsType } from './AssetsPreviewPanel'
import CompressionPanel from './CompressionPanel'
import { FileBrowserItem } from './FileBrowserGrid'
import { FileDataType } from './FileDataType'
import ImageConvertPanel from './ImageConvertPanel'
import styles from './styles.module.scss'

export const FileIconType = {
  gltf: ViewInArIcon,
  'gltf-binary': ViewInArIcon,
  glb: ViewInArIcon,
  vrm: AccessibilityNewIcon,
  usdz: ViewInArIcon,
  fbx: ViewInArIcon,
  png: PhotoSizeSelectActualIcon,
  jpeg: PhotoSizeSelectActualIcon,
  jpg: PhotoSizeSelectActualIcon,
  ktx2: PhotoSizeSelectActualIcon,
  m3u8: VideocamIcon,
  mp4: VideocamIcon,
  mpeg: VolumeUpIcon,
  mp3: VolumeUpIcon,
  'model/gltf-binary': ViewInArIcon,
  'model/gltf': ViewInArIcon,
  'model/glb': ViewInArIcon,
  'model/vrm': AccessibilityNewIcon,
  'model/usdz': ViewInArIcon,
  'model/fbx': ViewInArIcon,
  'image/png': PhotoSizeSelectActualIcon,
  'image/jpeg': PhotoSizeSelectActualIcon,
  'image/jpg': PhotoSizeSelectActualIcon,
  'application/pdf': null,
  'application/vnd.apple.mpegurl': VideocamIcon,
  'video/mp4': VideocamIcon,
  'audio/mpeg': VolumeUpIcon,
  'audio/mp3': VolumeUpIcon
}

type FileBrowserContentPanelProps = {
  onSelectionChanged: (assetSelectionChange: AssetSelectionChangePropsType) => void
  disableDnD?: boolean
  selectedFile?: string
  folderName?: string
}

type DnDFileType = {
  dataTransfer: DataTransfer
  files: File[]
  items: DataTransferItemList
}

export type FileType = {
  fullName: string
  isFolder: boolean
  key: string
  name: string
  path: string
  size: string
  type: string
  url: string
}

export function isFileDataType(value: any): value is FileDataType {
  return value && value.key
}

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 */
const FileBrowserContentPanel: React.FC<FileBrowserContentPanelProps> = (props) => {
  const { t } = useTranslation()

  const anchorEl = useHookstate<null | HTMLElement>(null)
  const anchorPosition = useHookstate<undefined | PopoverPosition>(undefined)

  const open = Boolean(anchorEl.value)
  const isLoading = useState(true)
  const selectedDirectory = useState(
    `/${props.folderName || 'projects'}/${props.selectedFile ? props.selectedFile + '/' : ''}`
  )
  const fileProperties = useState<any>(null)

  const openProperties = useState(false)
  const openCompress = useState(false)
  const openConvert = useState(false)
  const convertProperties = useState<ImageConvertParms>(ImageConvertDefaultParms)

  const openConfirm = useState(false)
  const contentToDeletePath = useState('')

  const fileState = useHookstate(getMutableState(FileBrowserState))
  const filesValue = fileState.files.attach(Downgraded).value
  const { skip, total, retrieving } = fileState.value

  let page = skip / FILES_PAGE_LIMIT
  const files = fileState.files.value.map((file) => {
    const isFolder = file.type === 'folder'
    const fullName = isFolder ? file.name : file.name + '.' + file.type

    return {
      ...file,
      size: file.size ? bytesToSize(file.size) : '0',
      path: isFolder ? file.key.split(file.name)[0] : file.key.split(fullName)[0],
      fullName,
      isFolder,
      Icon: FileIconType[file.type]
    }
  })

  useEffect(() => {
    if (filesValue) {
      isLoading.set(false)
    }
  }, [filesValue])

  useEffect(() => {
    refreshDirectory()
  }, [selectedDirectory.value])

  const refreshDirectory = async () => {
    await FileBrowserService.fetchFiles(selectedDirectory.value, page)
  }

  const changeDirectoryByPath = (path: string) => {
    selectedDirectory.set(path)
    FileBrowserService.resetSkip()
  }

  const onSelect = (params: FileDataType) => {
    if (params.type !== 'folder') {
      props.onSelectionChanged({
        resourceUrl: params.url,
        name: params.name,
        contentType: params.type
      })
    } else {
      const newPath = `${selectedDirectory.value}${params.name}/`
      changeDirectoryByPath(newPath)
    }
  }

  const handleClose = () => {
    anchorEl.set(null)
    anchorPosition.set(undefined)
  }

  const handlePageChange = async (_event, newPage: number) => {
    await FileBrowserService.fetchFiles(selectedDirectory.value, newPage)
  }

  const createNewFolder = async () => {
    handleClose()
    await FileBrowserService.addNewFolder(`${selectedDirectory.value}New_Folder`)
    page = 0 // more efficient than requesting the files again
    await refreshDirectory()
  }

  const dropItemsOnPanel = async (data: FileDataType | DnDFileType, dropOn?: FileDataType) => {
    if (isLoading.value) return

    const path = dropOn?.isFolder ? dropOn.key : selectedDirectory.value

    if (isFileDataType(data)) {
      if (dropOn?.isFolder) {
        moveContent(data.fullName, data.fullName, data.path, path, false)
      }
    } else {
      isLoading.set(true)
      await Promise.all(
        data.files.map(async (file) => {
          const assetType = !file.type ? AssetLoader.getAssetType(file.name) : file.type
          if (!assetType) {
            // file is directory
            await FileBrowserService.addNewFolder(`${path}${file.name}`)
          } else {
            const name = processFileName(file.name)
            await uploadToFeathersService(fileBrowserUploadPath, [file], {
              fileName: name,
              path,
              contentType: file.type
            }).promise
          }
        })
      )
    }

    await refreshDirectory()
  }

  const onBackDirectory = () => {
    const pattern = /([^/]+)/g
    const result = selectedDirectory.value.match(pattern)
    if (!result) return
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
    if (isLoading.value) return
    isLoading.set(true)
    await FileBrowserService.moveContent(oldName, newName, oldPath, newPath, isCopy)
    await refreshDirectory()
  }

  const handleConfirmDelete = (contentPath: string, type: string) => {
    contentToDeletePath.set(contentPath)

    openConfirm.set(true)
  }

  const handleConfirmClose = () => {
    contentToDeletePath.set('')

    openConfirm.set(false)
  }

  const deleteContent = async (): Promise<void> => {
    if (isLoading.value) return
    isLoading.set(true)
    openConfirm.set(false)
    await FileBrowserService.deleteContent(contentToDeletePath.value)
    props.onSelectionChanged({ resourceUrl: '', name: '', contentType: '' })
    await refreshDirectory()
  }

  const currentContentRef = useRef(null! as { item: FileDataType; isCopy: boolean })

  const showDownloadButton =
    selectedDirectory.value.slice(1).startsWith('projects/') &&
    !['projects', 'projects/'].includes(selectedDirectory.value.slice(1))

  const handleDownloadProject = async () => {
    const url = selectedDirectory.value
    const data = await Engine.instance.api
      .service(archiverPath)
      .get(null, { query: { directory: url } })
      .catch((err: Error) => {
        NotificationService.dispatchNotify(err.message, { variant: 'warning' })
        return null
      })
    if (!data) return
    const blob = await (await fetch(`${config.client.fileServer}/${data}`)).blob()

    let fileName: string
    if (selectedDirectory.value[selectedDirectory.value.length - 1] === '/') {
      fileName = selectedDirectory.value.split('/').at(-2) as string
    } else {
      fileName = selectedDirectory.value.split('/').at(-1) as string
    }

    saveAs(blob, fileName + '.zip')
  }

  const BreadcrumbItems = () => {
    const handleBreadcrumbDirectoryClick = (targetFolder: string) => {
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

    return (
      <Breadcrumbs
        style={{}}
        maxItems={3}
        classes={{ separator: styles.separator, li: styles.breadcrumb, ol: styles.breadcrumbList }}
        separator="›"
      >
        {selectedDirectory.value
          .slice(1, -1)
          .split('/')
          .map((file, index, arr) =>
            arr.length - 1 == index ? (
              <Typography key={file} style={{ fontSize: '0.9rem' }}>
                {file}
              </Typography>
            ) : (
              <Link
                underline="hover"
                key={file}
                color="#5d646c"
                style={{ fontSize: '0.9rem' }}
                onClick={() => handleBreadcrumbDirectoryClick(file)}
              >
                {file}
              </Link>
            )
          )}
      </Breadcrumbs>
    )
  }

  const searchBarState = useHookstate('')

  const validFiles = useHookstate<typeof files>([])

  useEffect(() => {
    validFiles.set(files.filter((file) => file.name.toLowerCase().includes(searchBarState.value.toLowerCase())))
  }, [searchBarState.value, fileState.files])

  const DropArea = () => {
    const [{ isFileDropOver }, fileDropRef] = useDrop({
      accept: [...SupportedFileTypes],
      drop: (dropItem) => dropItemsOnPanel(dropItem as any),
      collect: (monitor) => ({ isFileDropOver: monitor.isOver() })
    })

    return (
      <div
        ref={fileDropRef}
        className={styles.panelContainer}
        style={{ border: isFileDropOver ? '3px solid #ccc' : '' }}
      >
        <div className={styles.contentContainer}>
          {unique(validFiles.get(NO_PROXY), (file) => file.key).map((file, i) => (
            <FileBrowserItem
              key={file.key}
              contextMenuId={i.toString()}
              item={file}
              disableDnD={props.disableDnD}
              onClick={onSelect}
              moveContent={moveContent}
              deleteContent={handleConfirmDelete}
              currentContent={currentContentRef}
              setOpenPropertiesModal={openProperties.set}
              setFileProperties={fileProperties.set}
              setOpenCompress={openCompress.set}
              setOpenConvert={openConvert.set}
              dropItemsOnPanel={dropItemsOnPanel}
              isFilesLoading={isLoading}
              addFolder={createNewFolder}
              refreshDirectory={refreshDirectory}
            />
          ))}

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
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.fileBrowserRoot}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}
        >
          <ToolButton
            tooltip={t('editor:layout.filebrowser.back')}
            icon={ArrowBackIcon}
            onClick={onBackDirectory}
            id="backDir"
          />
          <ToolButton
            tooltip={t('editor:layout.filebrowser.refresh')}
            icon={AutorenewIcon}
            onClick={refreshDirectory}
            id="refreshDir"
          />
        </span>
        <BreadcrumbItems />
        <span
          style={{
            display: 'flex',
            flexDirection: 'row-reverse',
            flexWrap: 'wrap'
          }}
        >
          <ToolButton
            tooltip={t('editor:layout.filebrowser.addNewFolder')}
            icon={CreateNewFolderIcon}
            onClick={createNewFolder}
            id="refreshDir"
          />
          {showDownloadButton && (
            <ToolButton
              tooltip={t('editor:layout.filebrowser.downloadProject')}
              onClick={handleDownloadProject}
              icon={DownloadIcon}
              id="downloadProject"
            />
          )}
        </span>
      </div>
      <div className={styles.headerContainer}>
        <span className={styles.searchContainer}>
          <Button onClick={() => searchBarState.set('')}>x</Button>
          <StringInput
            value={searchBarState.value}
            onChange={(e) => searchBarState.set(e?.target.value ?? '')}
            placeholder="Search"
          />
        </span>
      </div>
      {retrieving && (
        <LoadingView
          className={styles.filesLoading}
          title={t('editor:layout.filebrowser.loadingFiles')}
          variant="body2"
        />
      )}
      <div id="file-browser-panel" style={{ overflowY: 'auto', height: '100%' }}>
        <DndWrapper id="file-browser-panel">
          <DropArea />
        </DndWrapper>
      </div>

      {openConvert.value && fileProperties.value && (
        <ImageConvertPanel
          openConvert={openConvert}
          fileProperties={fileProperties}
          convertProperties={convertProperties}
          onRefreshDirectory={refreshDirectory}
        />
      )}

      {openCompress.value && fileProperties.value && (
        <CompressionPanel
          openCompress={openCompress}
          fileProperties={fileProperties as any}
          onRefreshDirectory={refreshDirectory}
        />
      )}

      {openProperties.value && fileProperties.value && (
        <Dialog
          open={openProperties.value}
          onClose={() => openProperties.set(false)}
          classes={{ paper: styles.paperDialog }}
        >
          <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }}>
            {`${fileProperties.value?.name} ${fileProperties.value?.type == 'folder' ? 'folder' : 'file'} Properties`}
          </DialogTitle>
          <Grid container spacing={1} style={{ width: '100%', margin: '0' }}>
            <Grid item xs={4} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.primaryText}>
                {t('editor:layout.filebrowser.fileProperties.name')}
              </Typography>
              <Typography className={styles.primaryText}>
                {t('editor:layout.filebrowser.fileProperties.type')}
              </Typography>
              <Typography className={styles.primaryText}>
                {t('editor:layout.filebrowser.fileProperties.size')}
              </Typography>
              <Typography className={styles.primaryText}>
                {t('editor:layout.filebrowser.fileProperties.url')}
              </Typography>
            </Grid>
            <Grid item xs={8} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.secondaryText}>{fileProperties.value?.name}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties.value?.type}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties.value?.size}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties.value?.url}</Typography>
            </Grid>
          </Grid>
        </Dialog>
      )}
      <ConfirmDialog
        open={openConfirm.value}
        description={`${t('editor:dialog.confirmContentDelete')} ${contentToDeletePath.value.split('/').at(-1)} ?`}
        onClose={handleConfirmClose}
        onSubmit={deleteContent}
      />
    </div>
  )
}

export default FileBrowserContentPanel
