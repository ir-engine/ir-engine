import React, { useState, useEffect, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
// @ts-ignore
import styles from './styles.module.scss'
import { useAssetSearch } from './useAssetSearch'
import { AssetPanelContentContainer } from './AssetsPanel'
import AssetGrid from './AssetGrid'
import SelectInput from '../inputs/SelectInput'
import InputGroup from '../inputs/InputGroup'
import { UploadFileType } from './sources/MyAssetsSource'
import { getUrlFromId } from '../../functions/getUrlFromId'
import { getContentType } from '@xrengine/engine/src/scene/functions/getContentType'
import { NodeManager } from '../../managers/NodeManager'
import EditorEvents from '../../constants/EditorEvents'
import { SourceManager } from '../../managers/SourceManager'
import { CommandManager } from '../../managers/CommandManager'
import { ProjectManager } from '../../managers/ProjectManager'

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

  const currentProject = {
    name: 'Current',
    sid: '',
    ownedFileIds: {}
  }

  const projects = []
  projects.push(currentProject)
  results.forEach((element) => {
    projects.push(element.project)
  })

  const onSelect = (props) => {
    onSelectionChanged({ resourceUrl: props.description, name: props.id, contentType: props.contentType })
  }

  const createProject = (projects) => {
    const selectType = []
    projects.forEach((element, index) => {
      if (element.sid !== globalThis.currentProjectID)
        selectType.push({
          label: element.name,
          value: index
        })
    })

    return selectType
  }
  const projectSelectTypes = createProject(projects)

  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0)

  const [selectedProjectFiles, setSelectedProjectFiles] = useState([])

  const projectIDRef = useRef(selectedProjectIndex)

  const renderProjectFiles = async (index) => {
    const ownedIds = {}
    Object.assign(ownedIds, ProjectManager.instance.ownedFileIds)
    Object.assign(ownedIds, ProjectManager.instance.currentOwnedFileIds)
    projects[0].ownedFileIds = JSON.stringify(ownedIds)
    projects[0].sid = globalThis.currentProjectID
    const ownedFileIdsString = projects[index]?.ownedFileIds
    const ownedFileIds = !!ownedFileIdsString ? JSON.parse(ownedFileIdsString) : {}
    const returningObjects = []
    for (let element of Object.keys(ownedFileIds)) {
      if (element !== 'thumbnailOwnedFileId') {
        const fileId = ownedFileIds[element]
        const { url } = await getUrlFromId(fileId)
        if (!url) continue
        const contentType = await getContentType(new URL(url))
        const nodeClass = UploadFileType[contentType]
        const nodeEditor = NodeManager.instance.getEditorFromClass(nodeClass)
        const returningObject = {
          description: url,
          fileId: fileId,
          projectId: projects[index].sid,
          id: element,
          label: element,
          nodeClass: nodeClass,
          url: url,
          type: 'Element',
          contentType: contentType,
          initialProps: { src: new URL(url) },
          iconComponent: nodeEditor.WrappedComponent
            ? nodeEditor.WrappedComponent.iconComponent
            : nodeEditor.iconComponent
        }
        returningObjects.push(returningObject)
      }
    }
    setSelectedProjectFiles(returningObjects)
  }

  const onChangeSelectedProject = (index) => {
    projectIDRef.current = index
    setSelectedProjectIndex(index)
  }

  useEffect(() => {
    renderProjectFiles(selectedProjectIndex)
  }, [selectedProjectIndex])

  const onFileUploaded = (index) => {
    if (projectIDRef.current === 0) {
      renderProjectFiles(selectedProjectIndex)
    }
  }

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.FILE_UPLOADED.toString(), onFileUploaded)
    return () => {
      CommandManager.instance.removeListener(EditorEvents.FILE_UPLOADED.toString(), onFileUploaded)
    }
  }, [])

  return (
    <>
      {/* @ts-ignore */}
      <InputGroup name="Project Name" label="Project Name">
        {/* @ts-ignore */}
        <SelectInput options={projectSelectTypes} onChange={onChangeSelectedProject} value={selectedProjectIndex} />
      </InputGroup>

      <AssetsPanelContainer id="file-browser-panel" className={styles.assetsPanel}>
        <AssetPanelContentContainer>
          <AssetGrid
            source={selectedSource}
            items={selectedProjectFiles}
            onLoadMore={loadMore}
            hasMore={hasMore}
            onSelect={onSelect}
            isLoading={false}
          />
        </AssetPanelContentContainer>
      </AssetsPanelContainer>
    </>
  )
}
