import React, { useState, useEffect, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
import styles from './styles.module.scss'
import { AssetPanelContentContainer } from './AssetsPanel'
import AudioNode from '../../nodes/AudioNode'
import ImageNode from '../../nodes/ImageNode'
import ModelNode from '../../nodes/ModelNode'
import VideoNode from '../../nodes/VideoNode'
import { NodeManager } from '../../managers/NodeManager'
import FileBrowserGrid from './FileBrowserGrid'
import { useTranslation } from 'react-i18next'
import { ContextMenu, ContextMenuTrigger, MenuItem } from '../layout/ContextMenu'
import { ToolButton } from '../toolbar/ToolButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import { FileBrowserService, useFileBrowserState } from '@xrengine/client-core/src/common/services/FileBrowserService'
import useElementResize from 'element-resize-event'
import { Downgraded } from '@hookstate/core'
import { FileDataType } from './FileDataType'

/**
 * @author Abhishek Pathak
 */

export const UploadFileType = {
  gltf: ModelNode,
  'gltf-binary': ModelNode,
  glb: ModelNode,
  png: ImageNode,
  jpeg: ImageNode,
  mp4: VideoNode,
  mpeg: AudioNode,
  mp3: AudioNode,
  'model/gltf-binary': ModelNode,
  'model/gltf': ModelNode,
  'model/glb': ModelNode,
  'image/png': ImageNode,
  'image/jpeg': ImageNode,
  'application/pdf': null,
  'video/mp4': VideoNode,
  'audio/mpeg': AudioNode,
  'audio/mp3': AudioNode
}
/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */

export default function FileBrowserContentPanel({ onSelectionChanged }) {
  const { t } = useTranslation()
  const panelRef = useRef(null)
  // const [scrollWindowWidth, setScrollWindowWidth] = useState(0)
  const [scrollWindowHeight, setScrollWindowHeight] = useState(750)
  const [isLoading, setLoading] = useState(true)
  const [selectedDirectory, setSelectedDirectory] = useState('/projects/')
  const fileState = useFileBrowserState()
  const filesValue = fileState.files.attach(Downgraded).value

  useEffect(() => {
    useElementResize(panelRef.current, () => {
      // setScrollWindowWidth(panelRef.current.clientWidth)
      setScrollWindowHeight(panelRef.current.clientHeight)
    })
  }, [panelRef.current])

  const onSelect = (props) => {
    if (props.type !== 'folder') {
      onSelectionChanged({ resourceUrl: props.description, name: props.label, contentType: props.type })
    } else {
      const newPath = `${selectedDirectory}${props.label}/`
      console.log('New Path for the DIrectory is:' + newPath)
      setSelectedDirectory(newPath)
    }
  }

  const files = fileState.files.value.map((file): FileDataType => {
    const nodeClass = UploadFileType[file.type]
    const nodeEditor = NodeManager.instance.getEditorFromClass(nodeClass)
    const iconComponent = nodeEditor.iconComponent
    const url = file.url
    return {
      description: url,
      id: file.key,
      label: file.name,
      nodeClass: nodeClass,
      url: url,
      type: file.type,
      initialProps: { src: new URL(url) },
      iconComponent
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

  const moveContent = async (from, to, isCopy = false, renameTo = null) => {
    if (isLoading) return
    setLoading(true)
    await FileBrowserService.moveContent(from, to, isCopy, renameTo)
    onRefreshDirectory()
  }

  const deleteContent = async ({ contentPath, type }) => {
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

  let currentContent = null
  const currentContentRef = useRef(currentContent)

  const headGrid = { display: 'grid', gridTemplateColumns: '1fr auto', gridGap: '20px' }
  return (
    <>
      <div style={headGrid}>
        <ToolButton icon={ArrowBackIcon} onClick={onBackDirectory} id="backDir" iconHeight="100%" iconWidth="100%" />
        <ToolButton
          icon={AutorenewIcon}
          onClick={onRefreshDirectory}
          id="refreshDir"
          iconHeight="100%"
          iconWidth="100%"
        />
      </div>

      <ContextMenuTrigger id={'uniqueId_current'} holdToDisplay={-1}>
        <AssetsPanelContainer ref={panelRef} id="file-browser-panel" className={styles.assetsPanel}>
          <AssetPanelContentContainer>
            <FileBrowserGrid
              items={files}
              scrollWindowHeight={scrollWindowHeight}
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
