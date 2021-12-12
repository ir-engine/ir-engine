import React, { useCallback } from 'react'
import AssetGrid from './AssetGrid'
import { AssetPanelContentContainer } from './AssetsPanel'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'
import { setTransformMode, setTransformPivot } from '../../systems/EditorControlSystem'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorControlComponent } from '../../classes/EditorControlComponent'
import { createNewEditorNode } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

/**
 * MediaSourcePanel used to render view for AssetsPanelContainer and AssetsPanelToolbarContainer.
 *
 * @author Robert Long
 * @param       {object} source
 * @constructor
 */
export function NodesListPanel() {
  const spawnGrabbedObject = useCallback((object: EntityTreeNode) => {
    const editorControlComponent = getComponent(SceneManager.instance.editorEntity, EditorControlComponent)
    if (editorControlComponent.transformMode === TransformMode.Placement) {
      CommandManager.instance.executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS)
    }

    // if entity
    if (object.entity) {
      const transform = getComponent(object.entity, TransformComponent)
      if (transform) SceneManager.instance.getSpawnPosition(transform.position)
    } else {
      if (!object.disableTransform) {
        SceneManager.instance.getSpawnPosition(object.position)
      }
    }

    CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, object)

    if ((object.entity && hasComponent(object.entity, TransformComponent)) || !object.disableTransform) {
      setTransformMode(TransformMode.Placement, false, editorControlComponent)
    }
  }, [])

  //callback function to handle select on media source
  const onSelect = (item) => {
    const { nodeClass, initialProps } = item
    let node

    // if ECS
    if (typeof item.nodeClass === 'string') {
      node = createNewEditorNode(nodeClass)
    } else {
      node = new item.nodeClass()
    }

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
