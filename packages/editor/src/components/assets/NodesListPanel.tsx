import React, { useCallback } from 'react'
import AssetGrid from './AssetGrid'
import { AssetPanelContentContainer } from './AssetsPanel'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'
import { setTransformMode, setTransformPivot } from '../../systems/EditorControlSystem'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorControlComponent } from '../../classes/EditorControlComponent'

/**
 * MediaSourcePanel used to render view for AssetsPanelContainer and AssetsPanelToolbarContainer.
 *
 * @author Robert Long
 * @param       {object} source
 * @constructor
 */
export function NodesListPanel() {
  const spawnGrabbedObject = useCallback((object) => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (editorControlComponent.transformMode === TransformMode.Placement) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    }

    if (!object.disableTransform) {
      SceneManager.instance.getSpawnPosition(object.position)
    }

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, object)

    if (!object.disableTransform) {
      setTransformMode(TransformMode.Placement, object.useMultiplePlacementMode, editorControlComponent)
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
      setTransformPivot(transformPivot)
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
