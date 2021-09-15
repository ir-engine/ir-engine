import React, { useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AssetsPanelContainer } from '../layout/Flex'
import { EditorContext } from '../contexts/EditorContext'
import AssetDropZone from './AssetDropZone'
// @ts-ignore
import styles from './styles.module.scss'
import { useAssetSearch } from './useAssetSearch'
import { AssetPanelContentContainer, getSources } from './AssetsPanel'
import AssetGrid from './AssetGrid'
import SelectInput from '../inputs/SelectInput'
import InputGroup from '../inputs/InputGroup'
import { UploadFileType } from './sources/MyAssetsSource'
import { getUrlFromId } from '@xrengine/engine/src/scene/functions/getUrlFromId'
import { getContentType } from '@xrengine/engine/src/scene/functions/getContentType'

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */

export default function FileBrowserContentPanel({ onSelectionChanged }) {
  //initializing editor with EditorContext
  const editor = useContext(EditorContext)

  //initializing sources using getSources from editor
  const [sources, setSources] = useState(getSources(editor))

  //initializing selectedSource as the first element of sources array
  const [selectedSource, setSelectedSource] = useState(sources.length > 0 ? sources[1] : null)

  useEffect(() => {
    // function to set selected sources
    const onSetSource = (sourceId) => {
      setSelectedSource(sources.find((s) => s.id === sourceId))
    }

    // function to handle changes in authentication
    const onSettingsChanged = () => {
      const nextSources = getSources(editor)
      setSources(nextSources)
    }

    //adding listeners to editor component
    editor.addListener('settingsChanged', onSettingsChanged)
    editor.addListener('setSource', onSetSource)

    //removing listeners from editor component
    return () => {
      editor.removeListener('setSource', onSetSource)
    }
  }, [editor, setSelectedSource, sources, setSources, selectedSource])

  const { params, setParams, isLoading, loadMore, hasMore, results } = useAssetSearch(selectedSource)

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
    Object.assign(ownedIds, globalThis.Editor.ownedFileIds)
    Object.assign(ownedIds, globalThis.Editor.currentOwnedFileIds)
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
        const nodeEditor = editor.nodeEditors.get(nodeClass)
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
    editor.addListener('FileUploaded', onFileUploaded)
    return () => {
      editor.removeListener('FileUploaded', onFileUploaded)
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
