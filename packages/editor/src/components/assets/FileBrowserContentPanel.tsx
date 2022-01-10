import React, { useState, useEffect, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
import styles from './styles.module.scss'
import { AssetPanelContentContainer } from './AssetsPanel'
import { prefabIcons } from '../../managers/NodeManager'
import FileBrowserGrid from './FileBrowserGrid'
import { useTranslation } from 'react-i18next'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import { ToolButton } from '../toolbar/ToolButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { FileBrowserService, useFileBrowserState } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { Downgraded } from '@hookstate/core'
import { FileDataType } from './FileDataType'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

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
}

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */
const FileBrowserContentPanel: React.FC<FileBrowserContentPanelProps> = (props) => {
  const { t } = useTranslation()
  const [isLoading, setLoading] = useState(true)
  const [selectedDirectory, setSelectedDirectory] = useState('/projects/')
  const fileState = useFileBrowserState()
  const filesValue = fileState.files.attach(Downgraded).value

  const onSelect = (params: FileDataType) => {
    if (params.type !== 'folder') {
      props.onSelectionChanged({ resourceUrl: params.description, name: params.label, contentType: params.type })
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

  const addNewFolder = async () => {
    if (isLoading) return
    setLoading(true)
    await FileBrowserService.addNewFolder(`${selectedDirectory}New_Folder`)
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

  const headGrid = { display: 'grid', gridTemplateColumns: '1fr auto', gridGap: '20px' }
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
            />
          </AssetPanelContentContainer>
        </AssetsPanelContainer>
      </ContextMenuTrigger>

      <ContextMenu id={'uniqueId_current'} hideOnLeave={true}>
        <MenuItem onClick={addNewFolder}>{t('editor:layout.filebrowser.addNewFolder')}</MenuItem>
        <MenuItem onClick={pasteContent}>{t('editor:layout.filebrowser.pasteAsset')}</MenuItem>
      </ContextMenu>
    </>
  )
}

export default FileBrowserContentPanel
