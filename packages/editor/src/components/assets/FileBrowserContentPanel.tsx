import React, { useState, useEffect, useRef, useReducer, createRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
// @ts-ignore
import styles from './styles.module.scss'
import { AssetPanelContentContainer } from './AssetsPanel'
import { UploadFileType } from './sources/MyAssetsSource'
import { FileBrowserContentType } from '@xrengine/engine/src/common/types/FileBrowserContentType'
import { NodeManager } from '../../managers/NodeManager'
import { ProjectManager } from '../../managers/ProjectManager'
import FileBrowserGrid from './FileBrowserGrid'
import { Config } from '@xrengine/common/src/config'
import { Button } from '../inputs/Button'
import { File } from '@styled-icons/fa-solid'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useTranslation } from 'react-i18next'

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */

export default function FileBrowserContentPanel({ onSelectionChanged }) {
  const isLoading = true
  const { t } = useTranslation()

  const onSelect = (props) => {
    if (props.type !== 'folder')
      onSelectionChanged({ resourceUrl: props.description, name: props.label, contentType: props.type })
    else {
      const newPath = `${selectedDirectory}${props.label}/`
      console.log('New Path for the DIrectory is:' + newPath)
      setSelectedDirectory(newPath)
    }
  }

  const [selectedDirectory, setSelectedDirectory] = useState('/')
  const [selectedProjectFiles, setSelectedProjectFiles] = useState([])

  const renderProjectFiles = async (directory) => {
    console.log('Current selected directory is:' + selectedDirectory)
    const returningObjects = []
    const resultFromThis = directory
      ? ((await ProjectManager.instance.feathersClient.service(`file-browser`).get(directory)) as any[])
      : []

    for (let i = 0; i < resultFromThis.length; i++) {
      const content = resultFromThis[i] as FileBrowserContentType
      const nodeClass = UploadFileType[content.type]
      const nodeEditor = NodeManager.instance.getEditorFromClass(nodeClass)
      const iconComponent = nodeEditor
        ? nodeEditor.WrappedComponent
          ? nodeEditor.WrappedComponent.iconComponent
          : nodeEditor.iconComponent
        : File
      const url = Config.publicRuntimeConfig.fileserver + content.key
      const returningObject = {
        description: url,
        id: content.key,
        label: content.name,
        nodeClass: nodeClass,
        url: url,
        type: content.type,
        initialProps: { src: new URL(url) },
        iconComponent
      }
      returningObjects.push(returningObject)
    }
    setSelectedProjectFiles(returningObjects)
  }

  useEffect(() => {
    renderProjectFiles(selectedDirectory)
  }, [selectedDirectory])

  const addNewFolder = () => {
    ProjectManager.instance.feathersClient
      .service(`file-browser`)
      .create({ fileName: `${selectedDirectory}NewFolder` })
      .then((res) => {
        if (res) renderProjectFiles(selectedDirectory)
      })
      .catch(() => {
        console.log("Can't Create new Folder")
      })
  }

  const onRefreshDirectory = () => {
    renderProjectFiles(selectedDirectory)
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

  const moveContent = (from, to, isCopy = false, renameTo = null) => {
    ProjectManager.instance.feathersClient
      .service('file-browser')
      .update(from, { destination: to, isCopy, renameTo })
      .then((res) => {
        if (res) renderProjectFiles(selectedDirectory)
      })
      .catch(() => console.log('Error on Moving'))
  }

  const deleteContent = ({ contentPath, type }) => {
    ProjectManager.instance.feathersClient
      .service('file-browser')
      .remove(contentPath, { query: { type } })
      .then((res) => {
        if (res) renderProjectFiles(selectedDirectory)
      })
      .catch(() => console.log('Error on Deletion'))
  }

  const pasteContent = () => {
    moveContent(currentContentRef.current.itemid, selectedDirectory, currentContentRef.current.isCopy)
  }

  let currentContent = null
  const currentContentRef = useRef(currentContent)

  return (
    <>
      {console.log('Rendering File Browser Panel CHILD')}
      <Button onClick={onBackDirectory}>Back</Button>
      <Button onClick={onRefreshDirectory}>Refresh View</Button>

      <ContextMenuTrigger id={'uniqueId.current'}>
        <AssetsPanelContainer id="file-browser-panel" className={styles.assetsPanel}>
          <AssetPanelContentContainer>
            <FileBrowserGrid
              items={selectedProjectFiles}
              onSelect={onSelect}
              isLoading={false}
              moveContent={moveContent}
              deleteContent={deleteContent}
              currentContent={currentContentRef}
            />
          </AssetPanelContentContainer>
        </AssetsPanelContainer>
      </ContextMenuTrigger>

      <ContextMenu id={'uniqueId.current'} hideOnLeave={true}>
        <MenuItem onClick={addNewFolder}>{t('editor:layout.filebrowser.addnewfolder')}</MenuItem>
        <MenuItem onClick={pasteContent}>{t('editor:layout.filebrowser.pasteAsset')}</MenuItem>
      </ContextMenu>
    </>
  )
}
