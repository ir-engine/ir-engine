import { Downgraded, useState } from '@hookstate/core'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { API } from '@etherealengine/client-core/src/API'
import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import LoadingView from '@etherealengine/client-core/src/common/components/LoadingView'
import {
  FileBrowserService,
  FileBrowserServiceReceptor,
  FILES_PAGE_LIMIT,
  useFileBrowserState
} from '@etherealengine/client-core/src/common/services/FileBrowserService'
import { uploadToFeathersService } from '@etherealengine/client-core/src/util/upload'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import { KTX2EncodeArguments } from '@etherealengine/engine/src/assets/constants/CompressionParms'
import { KTX2EncodeDefaultArguments } from '@etherealengine/engine/src/assets/constants/CompressionParms'
import {
  ImageConvertDefaultParms,
  ImageConvertParms
} from '@etherealengine/engine/src/assets/constants/ImageConvertParms'
import { MediaPrefabs } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import { ScenePrefabs } from '@etherealengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import { useState as useHFState } from '@etherealengine/hyperflux'
import { addActionReceptor, removeActionReceptor } from '@etherealengine/hyperflux'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import { PopoverPosition } from '@mui/material/Popover'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'

import { prefabIcons } from '../../functions/PrefabEditors'
import { unique } from '../../functions/utils'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import Scrubber from '../inputs/Scrubber'
import SelectInput from '../inputs/SelectInput'
import { ContextMenu } from '../layout/ContextMenu'
import { ToolButton } from '../toolbar/ToolButton'
import CompressionPanel from './CompressionPanel'
import { FileBrowserItem } from './FileBrowserGrid'
import { FileDataType } from './FileDataType'
import ImageConvertPanel from './ImageConvertPanel'
import styles from './styles.module.scss'

export const PrefabFileType = {
  gltf: ScenePrefabs.model,
  'gltf-binary': ScenePrefabs.model,
  glb: ScenePrefabs.model,
  usdz: ScenePrefabs.model,
  fbx: ScenePrefabs.model,
  png: ScenePrefabs.image,
  jpeg: ScenePrefabs.image,
  jpg: ScenePrefabs.image,
  m3u8: MediaPrefabs.video,
  mp4: MediaPrefabs.video,
  mpeg: MediaPrefabs.audio,
  mp3: MediaPrefabs.audio,
  'model/gltf-binary': ScenePrefabs.model,
  'model/gltf': ScenePrefabs.model,
  'model/glb': ScenePrefabs.model,
  'model/usdz': ScenePrefabs.model,
  'model/fbx': ScenePrefabs.model,
  'image/png': ScenePrefabs.image,
  'image/jpeg': ScenePrefabs.image,
  'image/jpg': ScenePrefabs.image,
  'application/pdf': null,
  'application/vnd.apple.mpegurl': MediaPrefabs.video,
  'video/mp4': MediaPrefabs.video,
  'audio/mpeg': MediaPrefabs.audio,
  'audio/mp3': MediaPrefabs.audio
}

type FileBrowserContentPanelProps = {
  onSelectionChanged: (AssetSelectionChangePropsType) => void
  disableDnD?: boolean
  selectedFile?: string
}

type DnDFileType = {
  dataTransfer: DataTransfer
  files: File[]
  items: DataTransferItemList
}

export function isFileDataType(value: any): value is FileDataType {
  return value && value.key
}

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @constructor
 */
const FileBrowserContentPanel: React.FC<FileBrowserContentPanelProps> = (props) => {
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [anchorPosition, setAnchorPosition] = React.useState<undefined | PopoverPosition>(undefined)
  const open = Boolean(anchorEl)
  const isLoading = useState(true)
  const selectedDirectory = useState(`/projects/${props.selectedFile ? props.selectedFile + '/' : ''}`)
  const fileState = useFileBrowserState()
  const filesValue = fileState.files.attach(Downgraded).value
  const { skip, total, retrieving } = fileState.value
  const fileProperties = useState<any>(null)
  const openProperties = useState(false)
  const openCompress = useState(false)
  const openConvert = useState(false)
  const compressProperties = useState<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)
  const convertProperties = useState<ImageConvertParms>(ImageConvertDefaultParms)
  const openConfirm = useState(false)
  const contentToDeletePath = useState('')
  const contentToDeleteType = useState('')

  const page = skip / FILES_PAGE_LIMIT

  const breadcrumbs = selectedDirectory.value
    .slice(1, -1)
    .split('/')
    .map((file, index, arr) => {
      if (arr.length - 1 == index) {
        return (
          <Typography key={file} style={{ fontSize: '0.9rem' }}>
            {file}
          </Typography>
        )
      } else {
        return (
          <Link
            underline="hover"
            key={file}
            color="#5d646c"
            style={{ fontSize: '0.9rem' }}
            href="#"
            onClick={() => handleClick(file)}
          >
            {file}
          </Link>
        )
      }
    })

  const files = fileState.files.value.map((file) => {
    const prefabType = PrefabFileType[file.type]
    const isFolder = file.type === 'folder'
    const fullName = isFolder ? file.name : file.name + '.' + file.type

    return {
      ...file,
      path: isFolder ? file.key.split(file.name)[0] : file.key.split(fullName)[0],
      fullName,
      isFolder,
      prefabType,
      Icon: prefabIcons[prefabType]
    }
  })

  useEffect(() => {
    addActionReceptor(FileBrowserServiceReceptor)
    return () => {
      removeActionReceptor(FileBrowserServiceReceptor)
    }
  }, [])

  useEffect(() => {
    isLoading.set(false)
  }, [filesValue])

  useEffect(() => {
    FileBrowserService.fetchFiles(selectedDirectory.value)
  }, [selectedDirectory])

  const onSelect = (params: FileDataType) => {
    if (params.type !== 'folder') {
      props.onSelectionChanged({
        resourceUrl: params.url,
        name: params.name,
        contentType: params.type
      })
    } else {
      const newPath = `${selectedDirectory.value}${params.name}/`
      selectedDirectory.set(newPath)
    }
  }

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setAnchorEl(event.currentTarget)
    setAnchorPosition({
      left: event.clientX + 2,
      top: event.clientY - 6
    })
  }

  const handleClose = () => {
    setAnchorEl(null)
    setAnchorPosition(undefined)
  }

  const handlePageChange = async (_event, newPage: number) => {
    await FileBrowserService.fetchFiles(selectedDirectory.value, newPage)
  }

  const createNewFolder = async () => {
    handleClose()

    await FileBrowserService.addNewFolder(`${selectedDirectory.value}New_Folder`)
    await FileBrowserService.fetchFiles(selectedDirectory.value)
  }

  const dropItemsOnPanel = async (data: FileDataType | DnDFileType, dropOn?: FileDataType) => {
    if (isLoading.value) return

    isLoading.set(true)
    const path = dropOn?.isFolder ? dropOn.key : selectedDirectory.value

    if (isFileDataType(data)) {
      if (dropOn?.isFolder) {
        moveContent(data.fullName, data.fullName, data.path, path, false)
      }
    } else {
      await Promise.all(
        data.files.map(async (file) => {
          // If file is directory then it's type is going to be empty string
          if (!file.type) {
            await FileBrowserService.addNewFolder(`${path}${file.name}`)
          } else {
            const name = processFileName(file.name)
            await uploadToFeathersService('file-browser/upload', [file], {
              fileName: name,
              path,
              contentType: file.type
            }).promise
          }
        })
      )
    }

    await onRefreshDirectory()
  }

  const onRefreshDirectory = async () => {
    await FileBrowserService.fetchFiles(selectedDirectory.value, page)
  }

  const onBackDirectory = () => {
    const pattern = /([^\/]+)/g
    const result = selectedDirectory.value.match(pattern)
    if (!result) return
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    selectedDirectory.set(newPath)
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
    await onRefreshDirectory()
  }

  const handleConfirmDelete = (contentPath: string, type: string) => {
    contentToDeletePath.set(contentPath)
    contentToDeleteType.set(type)
    openConfirm.set(true)
  }

  const handleConfirmClose = () => {
    contentToDeletePath.set('')
    contentToDeleteType.set('')
    openConfirm.set(false)
  }

  const deleteContent = async (): Promise<void> => {
    if (isLoading.value) return
    isLoading.set(true)
    openConfirm.set(false)
    await FileBrowserService.deleteContent(contentToDeletePath, contentToDeleteType)
    props.onSelectionChanged({ resourceUrl: '', name: '', contentType: '' })
    await onRefreshDirectory()
  }

  const pasteContent = async () => {
    handleClose()

    if (isLoading.value) return
    isLoading.set(true)

    await FileBrowserService.moveContent(
      currentContentRef.current.item.fullName,
      currentContentRef.current.item.fullName,
      currentContentRef.current.item.path,
      selectedDirectory.value,
      currentContentRef.current.isCopy
    )

    await onRefreshDirectory()
  }

  let currentContent = null! as { item: FileDataType; isCopy: boolean }
  const currentContentRef = useRef(currentContent)

  const headGrid = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px'
  }

  function handleClick(targetFolder: string) {
    const pattern = /([^\/]+)/g
    const result = selectedDirectory.value.match(pattern)
    if (!result) return
    let newPath = '/'
    for (const folder of result) {
      if (folder != targetFolder) {
        newPath += folder + '/'
      } else {
        newPath += folder + '/'
        break
      }
    }
    selectedDirectory.set(newPath)
  }

  return (
    <div className={styles.fileBrowserRoot}>
      <div style={headGrid}>
        <ToolButton
          tooltip={t('editor:layout.filebrowser.back')}
          icon={ArrowBackIcon}
          onClick={onBackDirectory}
          id="backDir"
        />
        <Breadcrumbs
          maxItems={3}
          classes={{ separator: styles.separator, li: styles.breadcrumb }}
          separator="›"
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>
        <ToolButton
          tooltip={t('editor:layout.filebrowser.refresh')}
          icon={AutorenewIcon}
          onClick={onRefreshDirectory}
          id="refreshDir"
        />
      </div>

      {retrieving && (
        <LoadingView
          className={styles.filesLoading}
          title={t('editor:layout.filebrowser.loadingFiles')}
          variant="body2"
        />
      )}

      <div onContextMenu={handleContextMenu} id="file-browser-panel" className={styles.panelContainer}>
        <div className={styles.contentContainer}>
          {unique(files, (file) => file.key).map((file, i) => (
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
            />
          ))}

          {total > 0 && fileState.files.value.length < total && (
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

      <ContextMenu open={open} anchorEl={anchorEl} anchorPosition={anchorPosition} onClose={handleClose}>
        <MenuItem onClick={createNewFolder}>{t('editor:layout.filebrowser.addNewFolder')}</MenuItem>
        <MenuItem onClick={pasteContent}>{t('editor:layout.filebrowser.pasteAsset')}</MenuItem>
      </ContextMenu>

      {openConvert.value && fileProperties.value && (
        <ImageConvertPanel
          openConvert={openConvert}
          fileProperties={fileProperties}
          convertProperties={convertProperties}
          onRefreshDirectory={onRefreshDirectory}
        />
      )}

      {openCompress.value && fileProperties.value && (
        <CompressionPanel
          openCompress={openCompress}
          fileProperties={fileProperties}
          compressProperties={compressProperties}
          onRefreshDirectory={onRefreshDirectory}
        />
      )}

      {openProperties.value && fileProperties.value && (
        <Dialog
          open={openProperties.value}
          onClose={() => openProperties.set(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          classes={{ paper: styles.paperDialog }}
        >
          <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }} id="alert-dialog-title">
            {`${fileProperties.value?.name} ${fileProperties.value?.type == 'folder' ? 'folder' : 'file'} Properties`}
          </DialogTitle>
          <Grid container spacing={3} style={{ width: '100%', margin: '0' }}>
            <Grid item xs={4} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.primatyText}>Name:</Typography>
              <Typography className={styles.primatyText}>Type:</Typography>
              <Typography className={styles.primatyText}>Size:</Typography>
              <Typography className={styles.primatyText}>URL:</Typography>
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
        description={`${t('editor:dialog.confirmContentDelete')} ${
          contentToDeleteType.value == 'folder' ? t('editor:dialog.folder') : t('editor:dialog.file')
        }?`}
        onClose={handleConfirmClose}
        onSubmit={deleteContent}
      />
    </div>
  )
}

export default FileBrowserContentPanel
