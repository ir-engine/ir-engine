import React, { useState, useEffect, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
// @ts-ignore
import styles from './styles.module.scss'
import { useAssetSearch } from './useAssetSearch'
import { AssetPanelContentContainer } from './AssetsPanel'
import { UploadFileType } from './sources/MyAssetsSource'
import { FileBrowserContentType } from '@xrengine/engine/src/common/types/FileBrowserContentType'
import { NodeManager } from '../../managers/NodeManager'
import EditorEvents from '../../constants/EditorEvents'
import { SourceManager } from '../../managers/SourceManager'
import { CommandManager } from '../../managers/CommandManager'
import { ProjectManager } from '../../managers/ProjectManager'
import FileBrowserGrid from './FileBrowserGrid'
import { Config } from '@xrengine/common/src/config'
import { Button } from '../inputs/Button'

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */

export default function FileBrowserContentPanel({ onSelectionChanged }) {
  //initializing sources
  const [sources, setSources] = useState(SourceManager.instance.sources)

  //initializing selectedSource as the first element of sources array
  const [selectedSource, setSelectedSource] = useState(sources.length > 0 ? sources[1] : null)

  useEffect(() => {
    // function to set selected sources
    const onSetSource = (sourceId) => {
      setSelectedSource(sources.find((s) => s.id === sourceId))
    }

    // function to handle changes in authentication
    const onSettingsChanged = () => {
      const nextSources = SourceManager.instance.sources
      setSources(nextSources)
    }

    CommandManager.instance.addListener(EditorEvents.SETTINGS_CHANGED.toString(), onSettingsChanged)
    CommandManager.instance.addListener(EditorEvents.SOURCE_CHANGED.toString(), onSetSource)

    return () => {
      CommandManager.instance.removeListener(EditorEvents.SOURCE_CHANGED.toString(), onSetSource)
      CommandManager.instance.removeListener(EditorEvents.SETTINGS_CHANGED.toString(), onSettingsChanged)
    }
  }, [setSelectedSource, sources, setSources, selectedSource])

  const { loadMore, hasMore, results } = useAssetSearch(selectedSource)

  const onSelect = (props) => {
    if (props.type !== 'folder')
      onSelectionChanged({ resourceUrl: props.description, name: props.label, contentType: props.type })
    else {
      const newPath = `${selectedDirectory}${props.label}/`
      setSelectedDirectory(newPath)
    }
  }

  const [selectedDirectory, setSelectedDirectory] = useState('/ThisisTheMedia/')

  const [selectedProjectFiles, setSelectedProjectFiles] = useState([])

  const renderProjectFiles = async (directory) => {
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
        : null
      const url = Config.publicRuntimeConfig.fileserver + content.key
      const returningObject = {
        description: url,
        id: content.name + i,
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

  const onFileUploaded = (index) => {}

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.FILE_UPLOADED.toString(), onFileUploaded)
    return () => {
      CommandManager.instance.removeListener(EditorEvents.FILE_UPLOADED.toString(), onFileUploaded)
    }
  }, [])

  const addNewFolder = () => {
    ProjectManager.instance.feathersClient
      .service(`file-browser`)
      .create({ fileName: 'FileName' })
      .then((res) => {
        if (res) renderProjectFiles(selectedDirectory)
      })
      .catch(() => {
        console.log("Can't Create new Folder")
      })
  }

  const onBackDirectory = () => {
    const pattern = /([a-z 0-9]+)/gi
    const result = selectedDirectory.match(pattern)
    let newPath = '/'
    for (let i = 0; i < result.length - 1; i++) {
      newPath += result[i] + '/'
    }
    setSelectedDirectory(newPath)
  }

  return (
    <>
      {console.log('Rendering File Browser Panel CHILD')}
      <Button onClick={onBackDirectory}>Back</Button>
      <AssetsPanelContainer id="file-browser-panel" className={styles.assetsPanel}>
        <AssetPanelContentContainer>
          <FileBrowserGrid
            source={selectedSource}
            items={selectedProjectFiles}
            onLoadMore={loadMore}
            hasMore={hasMore}
            onSelect={onSelect}
            isLoading={false}
            addNewFolder={addNewFolder}
          />
        </AssetPanelContentContainer>
      </AssetsPanelContainer>
    </>
  )
}
