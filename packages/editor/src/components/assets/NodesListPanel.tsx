import React, { useCallback } from 'react'
import AssetGrid from './AssetGrid'
import { AssetPanelContentContainer } from './AssetsPanel'
import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'
import EditorCommands from '../../constants/EditorCommands'
import { CommandManager } from '../../managers/CommandManager'
import { SceneManager } from '../../managers/SceneManager'
import { setTransformMode } from '../../systems/EditorControlSystem'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EditorControlComponent } from '../../classes/EditorControlComponent'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'

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
      if (!hasComponent(object.entity, DisableTransformTagComponent)) {
        SceneManager.instance.getSpawnPosition(getComponent(object.entity, TransformComponent).position)
      }
    }

    if (
      object.entity &&
      hasComponent(object.entity, TransformComponent) &&
      !hasComponent(object.entity, DisableTransformTagComponent)
    ) {
      setTransformMode(TransformMode.Placement, false, editorControlComponent)
    }
  }, [])

  //callback function to handle select on media source
  const onSelect = (item) => {
    let node

    // if ECS
    if (typeof item.nodeClass === 'string') {
      node = new EntityTreeNode(createEntity())

      CommandManager.instance.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, {
        prefabTypes: item.nodeClass
      })
    } else {
      node = new item.nodeClass()
    }
  }

  return (
    <AssetPanelContentContainer>
      <AssetGrid onSelect={onSelect} />
    </AssetPanelContentContainer>
  )
}

export default NodesListPanel
