import React, { useCallback } from 'react'
import { ControlManager } from '../../managers/ControlManager'
import AssetGrid from './AssetGrid'
import { AssetPanelContentContainer } from './AssetsPanel'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
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
export function NodesListPanel() {
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
  const onSelect = (item) => {
    const { nodeClass, initialProps } = item
    const node = new nodeClass()

    if (initialProps) {
      Object.assign(node, initialProps)
    }

    const transformPivot = item.transformPivot

    if (transformPivot) {
      ControlManager.instance.editorControls.setTransformPivot(transformPivot)
    }

    spawnGrabbedObject(node)
  }

  return (
    <AssetPanelContentContainer>
      <AssetGrid onSelect={onSelect} />
    </AssetPanelContentContainer>
  )
}

export default NodesListPanel
