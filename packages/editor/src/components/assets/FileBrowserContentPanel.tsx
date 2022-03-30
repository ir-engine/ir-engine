import { Downgraded } from '@speigg/hookstate'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmModal from '@xrengine/client-core/src/admin/common/ConfirmModal'
import { FileBrowserService, useFileBrowserState } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

import { prefabIcons } from '../../functions/PrefabEditors'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import { ToolButton } from '../toolbar/ToolButton'
import FileBrowserGrid from './FileBrowserGrid'
import { FileDataType } from './FileDataType'
import styles from './styles.module.scss'

/**
 * @author Abhishek Pathak
 */
export const PrefabFileType = {
  gltf: ScenePrefabs.model,
  'gltf-binary': ScenePrefabs.model,
  glb: ScenePrefabs.model,
  png: ScenePrefabs.image,
  jpeg: ScenePrefabs.image,
  jpg: ScenePrefabs.image,
  mp4: ScenePrefabs.video,
  mpeg: ScenePrefabs.audio,
  mp3: ScenePrefabs.audio,
  'model/gltf-binary': ScenePrefabs.model,
  'model/gltf': ScenePrefabs.model,
  'model/glb': ScenePrefabs.model,
  'image/png': ScenePrefabs.image,
  'image/jpeg': ScenePrefabs.image,
  'image/jpg': ScenePrefabs.image,
  'application/pdf': null,
  'video/mp4': ScenePrefabs.video,
  'audio/mpeg': ScenePrefabs.audio,
  'audio/mp3': ScenePrefabs.audio
}

type FileBrowserContentPanelProps = {
  onSelectionChanged: (AssetSelectionChangePropsType) => void
  selectedFile?: string
}

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */
const FileBrowserContentPanel: React.FC<FileBrowserContentPanelProps> = (props) => {
  const { t } = useTranslation()
  const [isLoading, setLoading] = useState(true)
  const [selectedDirectory, setSelectedDirectory] = useState(
    `/projects/${props.selectedFile ? props.selectedFile + '/' : ''}`
  )
  const fileState = useFileBrowserState()
  const filesValue = fileState.files.attach(Downgraded).value
  const [fileProperties, setFileProperties] = useState<any>(null)
  const [openPropertiesConfirmModal, setOpenPropertiesModal] = useState(false)
  const [openConfirmModal, setConfirmModal] = useState(false)
  const [contentToDeletePath, setContentToDeletePath] = useState('')
  const [contentToDeleteType, setContentToDeleteType] = useState('')

  const breadcrumbs = selectedDirectory
    .slice(1, -1)
    .split('/')
    .map((file, index, arr) => {
      if (arr.length - 1 == index) {
        return (
          <Typography key={file} style={{ color: '#fff', fontSize: '0.9rem' }}>
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

  const onSelect = (params: FileDataType) => {
    if (params.type !== 'folder') {
      props.onSelectionChanged({
        resourceUrl: params.description,
        name: params.label,
        contentType: params.type
      })
    } else {
      const newPath = `${selectedDirectory}${params.label}/`
      setSelectedDirectory(newPath)
    }
  }

  const files: FileDataType[] = fileState.files.value.map((file) => {
    const prefabType = PrefabFileType[file.type]

    return {
      description: file.url,
      id: file.key,
      label: file.name,
      size: file.size,
      nodeClass: prefabType,
      prefabType,
      url: file.url,
      type: file.type,
      Icon: prefabIcons[prefabType]
    }
  })

  useEffect(() => {
    setLoading(false)
  }, [filesValue])

  useEffect(() => {
    onRefreshDirectory()
  }, [selectedDirectory])

  const addNewFolder = async (folder: any, item: any) => {
    if (isLoading) return
    setLoading(true)
    if (!folder) {
      await FileBrowserService.addNewFolder(`${selectedDirectory}New_Folder`)
    } else {
      folder?.files.forEach(async (file) => {
        let path = selectedDirectory
        if (item.type == 'folder') {
          path =
            selectedDirectory.split('/')[-1] == item.label ? selectedDirectory : selectedDirectory + item.label + '/'
        }
        if (!file.type) {
          await FileBrowserService.addNewFolder(`${path}${file.name}`)
        } else {
          await FileBrowserService.putContent(`${path}${file.name}`, file, file.type)
        }
      })
    }
    onRefreshDirectory()
  }

  const onRefreshDirectory = () => {
    FileBrowserService.fetchFiles(selectedDirectory)
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

  const moveContent = async (from: string, to: string, isCopy = false, renameTo = null! as string): Promise<void> => {
    if (isLoading) return
    setLoading(true)
    await FileBrowserService.moveContent(from, to, isCopy, renameTo)
    onRefreshDirectory()
  }

  const handleConfirmDelete = (contentPath: string, type: string) => {
    setConfirmModal(true)
    setContentToDeletePath(contentPath)
    setContentToDeleteType(type)
  }

  const handleCloseModal = () => {
    setConfirmModal(false)
    setContentToDeletePath('')
    setContentToDeleteType('')
  }

  const deleteContent = async (): Promise<void> => {
    if (isLoading) return
    setLoading(true)
    setConfirmModal(false)
    await FileBrowserService.deleteContent(contentToDeletePath, contentToDeleteType)
    onRefreshDirectory()
  }

  const pasteContent = async () => {
    if (isLoading) return
    setLoading(true)
    await FileBrowserService.moveContent(
      currentContentRef.current.itemid,
      selectedDirectory,
      currentContentRef.current.isCopy
    )
    onRefreshDirectory()
  }

  let currentContent = null! as any
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
    <>
      <div style={headGrid}>
        <ToolButton icon={ArrowBackIcon} onClick={onBackDirectory} id="backDir" />
        <Breadcrumbs maxItems={3} classes={{ separator: styles.separator }} separator="›" aria-label="breadcrumb">
          {breadcrumbs}
        </Breadcrumbs>
        <ToolButton icon={AutorenewIcon} onClick={onRefreshDirectory} id="refreshDir" />
      </div>

      <ContextMenuTrigger id={'uniqueId_current'} holdToDisplay={-1}>
        <div id="file-browser-panel" className={styles.panelContainer}>
          <div className={styles.contentContainer}>
            <FileBrowserGrid
              items={files}
              onSelect={onSelect}
              isLoading={isLoading}
              moveContent={moveContent}
              deleteContent={handleConfirmDelete}
              currentContent={currentContentRef}
              setOpenPropertiesModal={setOpenPropertiesModal}
              setFileProperties={setFileProperties}
              addNewFolder={addNewFolder}
            />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenu id={'uniqueId_current'} hideOnLeave={true}>
        <MenuItem onClick={() => addNewFolder(null, null)}>{t('editor:layout.filebrowser.addNewFolder')}</MenuItem>
        <MenuItem onClick={pasteContent}>{t('editor:layout.filebrowser.pasteAsset')}</MenuItem>
      </ContextMenu>
      {openPropertiesConfirmModal && fileProperties && (
        <Dialog
          open={openPropertiesConfirmModal}
          onClose={() => setOpenPropertiesModal(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          classes={{ paper: styles.paperDialog }}
        >
          <DialogTitle style={{ padding: '0', textTransform: 'capitalize' }} id="alert-dialog-title">
            {`${fileProperties?.label} ${fileProperties?.type == 'folder' ? 'folder' : 'file'} Properties`}
          </DialogTitle>
          <Grid container spacing={3} style={{ width: '100%', margin: '0' }}>
            <Grid item xs={4} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.primatyText}>Name:</Typography>
              <Typography className={styles.primatyText}>Type:</Typography>
              <Typography className={styles.primatyText}>Size:</Typography>
              <Typography className={styles.primatyText}>URL:</Typography>
            </Grid>
            <Grid item xs={8} style={{ paddingLeft: '10px', paddingTop: '10px', width: '100%' }}>
              <Typography className={styles.secondaryText}>{fileProperties?.label}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties?.type}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties?.size}</Typography>
              <Typography className={styles.secondaryText}>{fileProperties?.url}</Typography>
            </Grid>
          </Grid>
        </Dialog>
      )}
      <ConfirmModal
        popConfirmOpen={openConfirmModal}
        handleCloseModal={handleCloseModal}
        submit={deleteContent}
        name={''}
        label={`this ${contentToDeleteType == 'folder' ? 'folder' : 'file'}`}
      />
    </>
  )
}

export default FileBrowserContentPanel
