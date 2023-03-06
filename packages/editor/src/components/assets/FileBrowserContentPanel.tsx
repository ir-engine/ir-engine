import { Downgraded } from '@hookstate/core'
import React, { useEffect, useRef, useState } from 'react'
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
import { FileBrowserItem } from './FileBrowserGrid'
import { FileDataType } from './FileDataType'
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
  const [isLoading, setLoading] = useState(true)
  const [selectedDirectory, setSelectedDirectory] = useState(
    `/projects/${props.selectedFile ? props.selectedFile + '/' : ''}`
  )
  const fileState = useFileBrowserState()
  const filesValue = fileState.files.attach(Downgraded).value
  const { skip, total, retrieving, updateNeeded } = fileState.value
  const [fileProperties, setFileProperties] = useState<any>(null)
  const [openProperties, setOpenPropertiesModal] = useState(false)
  const [openCompress, setOpenCompress] = useState(false)
  const compressProperties = useHFState<KTX2EncodeArguments>(KTX2EncodeDefaultArguments)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [contentToDeletePath, setContentToDeletePath] = useState('')
  const [contentToDeleteType, setContentToDeleteType] = useState('')

  const page = skip / FILES_PAGE_LIMIT

  const breadcrumbs = selectedDirectory
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
    setLoading(false)
  }, [filesValue])

  useEffect(() => {
    if (updateNeeded) onRefreshDirectory()
  }, [updateNeeded])

  useEffect(() => {
    FileBrowserService.fetchFiles(selectedDirectory)
  }, [selectedDirectory])

  const onSelect = (params: FileDataType) => {
    if (params.type !== 'folder') {
      props.onSelectionChanged({
        resourceUrl: params.url,
        name: params.name,
        contentType: params.type
      })
    } else {
      const newPath = `${selectedDirectory}${params.name}/`
      setSelectedDirectory(newPath)
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
    await FileBrowserService.fetchFiles(selectedDirectory, newPage)
  }

  const createNewFolder = async () => {
    handleClose()

    await FileBrowserService.addNewFolder(`${selectedDirectory}New_Folder`)
    await FileBrowserService.fetchFiles(selectedDirectory)
  }

  const dropItemsOnPanel = async (data: FileDataType | DnDFileType, dropOn?: FileDataType) => {
    if (isLoading) return

    setLoading(true)
    const path = dropOn?.isFolder ? dropOn.key : selectedDirectory

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
    await FileBrowserService.fetchFiles(selectedDirectory, page)
  }

  const onBackDirectory = () => {
    const pattern = /([^\/]+)/g
    const result = selectedDirectory.match(pattern)
    if (!result) return
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    setSelectedDirectory(newPath)
  }

  const moveContent = async (
    oldName: string,
    newName: string,
    oldPath: string,
    newPath: string,
    isCopy = false
  ): Promise<void> => {
    if (isLoading) return
    setLoading(true)
    await FileBrowserService.moveContent(oldName, newName, oldPath, newPath, isCopy)
    await onRefreshDirectory()
  }

  const handleConfirmDelete = (contentPath: string, type: string) => {
    setContentToDeletePath(contentPath)
    setContentToDeleteType(type)
    setOpenConfirm(true)
  }

  const handleConfirmClose = () => {
    setContentToDeletePath('')
    setContentToDeleteType('')
    setOpenConfirm(false)
  }

  const deleteContent = async (): Promise<void> => {
    if (isLoading) return
    setLoading(true)
    setOpenConfirm(false)
    await FileBrowserService.deleteContent(contentToDeletePath, contentToDeleteType)
    props.onSelectionChanged({ resourceUrl: '', name: '', contentType: '' })
    await onRefreshDirectory()
  }

  const pasteContent = async () => {
    handleClose()

    if (isLoading) return
    setLoading(true)

    await FileBrowserService.moveContent(
      currentContentRef.current.item.fullName,
      currentContentRef.current.item.fullName,
      currentContentRef.current.item.path,
      selectedDirectory,
      currentContentRef.current.isCopy
    )

    await onRefreshDirectory()
  }

  const compressContent = async () => {
    compressProperties.src.set(fileProperties.url)
    const compressedPath = await API.instance.client.service('ktx2-encode').create(compressProperties.value)
    await onRefreshDirectory()
    setOpenCompress(false)
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
    const result = selectedDirectory.match(pattern)
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
    setSelectedDirectory(newPath)
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
              setOpenPropertiesModal={setOpenPropertiesModal}
              setFileProperties={setFileProperties}
              setOpenCompress={setOpenCompress}
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

      {openCompress && fileProperties && (
        <Dialog
          open={openCompress}
          onClose={() => setOpenCompress(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          classes={{ paper: styles.paperDialog }}
        >
          <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }} id="alert-dialog-title">
            {fileProperties?.name}
          </DialogTitle>
          <Grid container spacing={3} style={{ width: '100%', margin: '2 rem' }}>
            <Grid item xs={12} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%', textAlign: 'center' }}>
              <Typography className={styles.primatyText}>Compress</Typography>
            </Grid>

            <Grid item xs={4}>
              <Typography className={styles.secondaryText}>Mode:</Typography>
            </Grid>
            <Grid item xs={8}>
              <SelectInput
                options={[
                  { label: 'ETC1S', value: 'ETC1S' },
                  { label: 'UASTC', value: 'UASTC' }
                ]}
                value={compressProperties.mode.value}
                onChange={(val: 'ETC1S' | 'UASTC') => compressProperties.mode.set(val)}
              />
            </Grid>

            <Grid item xs={4}>
              <Typography className={styles.secondaryText}>Quality:</Typography>
            </Grid>
            <Grid item xs={8}>
              <Scrubber
                tag="div"
                value={compressProperties.quality.value}
                onChange={(val) => compressProperties.quality.set(val)}
                min={1}
                max={255}
                smallStep={1}
                mediumStep={1}
                largeStep={5}
                style={{ display: 'flex', alignItems: 'center', width: '100%' }}
              >
                Level: {compressProperties.quality.value}
              </Scrubber>
            </Grid>

            <Grid item xs={4}>
              <Typography className={styles.secondaryText}>Mipmaps:</Typography>
            </Grid>
            <Grid item xs={8}>
              <BooleanInput
                value={compressProperties.mipmaps.value}
                onChange={(val) => compressProperties.mipmaps.set(val)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button onClick={compressContent}> Compress </Button>
            </Grid>
          </Grid>
        </Dialog>
      )}

      {openProperties && fileProperties && (
        <Dialog
          open={openProperties}
          onClose={() => setOpenPropertiesModal(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          classes={{ paper: styles.paperDialog }}
        >
          <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }} id="alert-dialog-title">
            {`${fileProperties?.name} ${fileProperties?.type == 'folder' ? 'folder' : 'file'} Properties`}
          </DialogTitle>
          <Grid container spacing={3} style={{ width: '100%', margin: '0' }}>
            <Grid item xs={4} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.primatyText}>Name:</Typography>
              <Typography className={styles.primatyText}>Type:</Typography>
              <Typography className={styles.primatyText}>Size:</Typography>
              <Typography className={styles.primatyText}>URL:</Typography>
            </Grid>
            <Grid item xs={8} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.secondaryText}>{fileProperties?.name}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties?.type}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties?.size}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties?.url}</Typography>
            </Grid>
          </Grid>
        </Dialog>
      )}
      <ConfirmDialog
        open={openConfirm}
        description={`${t('editor:dialog.confirmContentDelete')} ${
          contentToDeleteType == 'folder' ? t('editor:dialog.folder') : t('editor:dialog.file')
        }?`}
        onClose={handleConfirmClose}
        onSubmit={deleteContent}
      />
    </div>
  )
}

export default FileBrowserContentPanel
