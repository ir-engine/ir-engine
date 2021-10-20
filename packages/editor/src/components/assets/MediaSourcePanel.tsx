import React, { useCallback } from 'react'
import { ControlManager } from '../../managers/ControlManager'
import AssetGrid from './AssetGrid'
import { AssetPanelContentContainer } from './AssetsPanel'
import { useAssetSearch } from './useAssetSearch'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import useUpload from './useUpload'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'

/**
 * MediaSourcePanel used to render view for AssetsPanelContainer and AssetsPanelToolbarContainer.
 *
 * @author Robert Long
 * @param       {object} source
 * @constructor
 */
export function MediaSourcePanel({ source }) {
  // initializing variables
  const { params, setParams, isLoading, loadMore, hasMore, results } = useAssetSearch(source)

  const spawnGrabbedObject = useCallback((object) => {
    if (ControlManager.instance.editorControls.transformMode === TransformMode.Placement) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    }

    if (!object.disableTransform) {
      SceneManager.instance.getSpawnPosition(object.position)
    }

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, object)

    if (!object.disableTransform) {
      ControlManager.instance.editorControls.setTransformMode(TransformMode.Placement, object.useMultiplePlacementMode)
    }
  }, [])

  //callback function to handle select on media source
  const onSelect = useCallback(
    (item) => {
      const { nodeClass, initialProps } = item
      const node = new nodeClass()

      if (initialProps) {
        Object.assign(node, initialProps)
      }

      const transformPivot = item.transformPivot || source.transformPivot

      if (transformPivot) {
        ControlManager.instance.editorControls.setTransformPivot(transformPivot)
      }

      spawnGrabbedObject(node)
    },
    [source.transformPivot]
  )

  // function to handle the upload
  const onUpload = useUpload({ source })

  //callback function to handle load more
  const onLoadMore = useCallback(() => {
    loadMore(params)
  }, [params, loadMore])

  // returning view for MediaSourcePanel
  return (
    <>
      {/* <AssetsPanelToolbar title={source.name}>
        {source.upload && (
        <FileInput
          accept={source.acceptFileTypes || "all"}
          multiple={source.uploadMultiple || false}
          onChange={onUpload}
        />
        )}
      </AssetsPanelToolbar> */}
      <AssetPanelContentContainer>
        <AssetGrid
          source={source}
          items={results}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          onSelect={onSelect}
          isLoading={isLoading}
        />
      </AssetPanelContentContainer>
    </>
  )
}

export default MediaSourcePanel
