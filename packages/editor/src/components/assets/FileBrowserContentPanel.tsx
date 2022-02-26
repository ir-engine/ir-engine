import { Downgraded } from '@speigg/hookstate'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FileBrowserService, useFileBrowserState } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { prefabIcons } from '../../functions/PrefabEditors'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import { AssetsPanelContainer } from '../layout/Flex'
import { ToolButton } from '../toolbar/ToolButton'
import { AssetPanelContentContainer } from './AssetsPanel'
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
  mp4: ScenePrefabs.video,
  mpeg: ScenePrefabs.audio,
  mp3: ScenePrefabs.audio,
  'model/gltf-binary': ScenePrefabs.model,
  'model/gltf': ScenePrefabs.model,
  'model/glb': ScenePrefabs.model,
  'image/png': ScenePrefabs.image,
  'image/jpeg': ScenePrefabs.image,
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
  const [openPropertiesModel, setOpenPropertiesModel] = useState(false)

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
      url: file.url,
      type: file.type,
      initialProps: { src: new URL(file.url) },
      iconComponent: prefabIcons[prefabType]
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

  const deleteContent = async (contentPath: string, type: string): Promise<void> => {
    if (isLoading) return
    setLoading(true)
    await FileBrowserService.deleteContent(contentPath, type)
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
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridGap: '20px',
    marginTop: props.selectedFile ? '20px' : 0
  }
  return (
    <>
      <div style={headGrid}>
        <ToolButton icon={ArrowBackIcon} onClick={onBackDirectory} id="backDir" />
        <ToolButton icon={AutorenewIcon} onClick={onRefreshDirectory} id="refreshDir" />
      </div>

      <ContextMenuTrigger id={'uniqueId_current'} holdToDisplay={-1}>
        <AssetsPanelContainer id="file-browser-panel" className={styles.assetsPanel}>
          <AssetPanelContentContainer>
            <FileBrowserGrid
              items={files}
              onSelect={onSelect}
              isLoading={isLoading}
              moveContent={moveContent}
              deleteContent={deleteContent}
              currentContent={currentContentRef}
              setOpenPropertiesModel={setOpenPropertiesModel}
              setFileProperties={setFileProperties}
              addNewFolder={addNewFolder}
            />
          </AssetPanelContentContainer>
        </AssetsPanelContainer>
      </ContextMenuTrigger>

      <ContextMenu id={'uniqueId_current'} hideOnLeave={true}>
        <MenuItem onClick={() => addNewFolder(null, null)}>{t('editor:layout.filebrowser.addNewFolder')}</MenuItem>
        <MenuItem onClick={pasteContent}>{t('editor:layout.filebrowser.pasteAsset')}</MenuItem>
      </ContextMenu>
      {openPropertiesModel && fileProperties && (
        <Dialog
          open={openPropertiesModel}
          onClose={() => setOpenPropertiesModel(false)}
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
    </>
  )
}

export default FileBrowserContentPanel
