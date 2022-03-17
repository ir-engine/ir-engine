import EventEmitter from 'events'

import { store } from '@xrengine/client-core/src/store'
import { getContentType } from '@xrengine/common/src/utils/getContentType'
import { AudioComponent } from '@xrengine/engine/src/audio/components/AudioComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { MappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  createEntityNode,
  getEntityNodeArrayFromEntities
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { ImageComponent } from '@xrengine/engine/src/scene/components/ImageComponent'
import { LinkComponent } from '@xrengine/engine/src/scene/components/LinkComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { VideoComponent } from '@xrengine/engine/src/scene/components/VideoComponent'
import { ScenePrefabs, ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import EditorHistory from '../classes/History'
import { ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import EditorCommands, { CommandParamsType, Commands, EditorCommandsType } from '../constants/EditorCommands'
import isInputSelected from '../functions/isInputSelected'
import { EditorErrorAction } from '../services/EditorErrorServices'
import { accessSelectionState } from '../services/SelectionServices'

export class CommandManager extends EventEmitter {
  static instance: CommandManager = new CommandManager()

  history: EditorHistory

  constructor() {
    super()

    this.history = new EditorHistory()

    window.addEventListener('copy', this.onCopy)
    window.addEventListener('paste', this.onPaste)
  }

  executeCommand = (
    command: EditorCommandsType,
    object: EntityTreeNode | EntityTreeNode[],
    params: CommandParamsType = {}
  ) => {
    if (!params) params = {}
    new Commands[command](!Array.isArray(object) ? [object] : object, params).execute()
  }

  executeCommandWithHistory = (
    command: EditorCommandsType,
    object: EntityTreeNode | EntityTreeNode[],
    params: CommandParamsType = {}
  ) => {
    params.keepHistory = true
    this.history.execute(new Commands[command](!Array.isArray(object) ? [object] : object, params))
  }

  executeCommandOnSelection = (command: EditorCommandsType, params: CommandParamsType = {}) => {
    const selection = getEntityNodeArrayFromEntities(accessSelectionState().selectedEntities.value)
    new Commands[command](selection, params).execute()
  }

  executeCommandWithHistoryOnSelection = (command: EditorCommandsType, params: CommandParamsType = {}) => {
    params.keepHistory = true
    const selection = getEntityNodeArrayFromEntities(accessSelectionState().selectedEntities.value)
    this.history.execute(new Commands[command](selection, params))
  }

  setProperty<C extends MappedComponent<any, any>>(
    affectedEntityNodes: EntityTreeNode[],
    params: ModifyPropertyCommandParams<C>,
    withHistory = true
  ) {
    if (withHistory) {
      this.executeCommandWithHistory(EditorCommands.MODIFY_PROPERTY, affectedEntityNodes, params)
    } else {
      this.executeCommand(EditorCommands.MODIFY_PROPERTY, affectedEntityNodes, params)
    }
  }

  setPropertyOnSelectionEntities<C extends MappedComponent<any, any>>(
    params: ModifyPropertyCommandParams<C>,
    withHistory = true
  ) {
    const selection = getEntityNodeArrayFromEntities(accessSelectionState().selectedEntities.value)
    this.setProperty(selection, params, withHistory)
  }

  setPropertyOnEntityNode<C extends MappedComponent<any, any>>(
    node: EntityTreeNode,
    params: ModifyPropertyCommandParams<C>,
    withHistory = true
  ) {
    this.setProperty([node], params, withHistory)
  }

  /**
   * Function revert used to revert back the recent changes on the basis of checkpoint.
   *
   * @author Robert Long
   * @param  {type} checkpointId
   */
  revert(checkpointId) {
    this.history.revert(checkpointId)
  }

  /**
   * Function undo used to undo changes using history of this component.
   *
   * @author Robert Long
   */
  undo() {
    this.history.undo()
  }

  /**
   * Function redo used to redo changes on the basis of history of component.
   *
   * @author Robert Long
   */
  redo() {
    this.history.redo()
  }

  onCopy = (event) => {
    if (isInputSelected()) return
    event.preventDefault()

    // TODO: Prevent copying objects with a disabled transform
    if (accessSelectionState().selectedEntities.length > 0) {
      event.clipboardData.setData(
        'application/vnd.editor.nodes',
        JSON.stringify({ entities: accessSelectionState().selectedEntities.value })
      )
    }
  }

  onPaste = (event) => {
    if (isInputSelected()) return
    event.preventDefault()

    let data

    if ((data = event.clipboardData.getData('application/vnd.editor.nodes')) !== '') {
      const { entities } = JSON.parse(data)

      if (!Array.isArray(entities)) return
      const nodes = entities
        .map((entity) => useWorld().entityTree.entityNodeMap.get(entity))
        .filter((entity) => entity) as EntityTreeNode[]

      if (nodes) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, nodes)
      }
    } else if ((data = event.clipboardData.getData('text')) !== '') {
      try {
        const url = new URL(data)
        this.addMedia({ url: url.href }).catch((error) => store.dispatch(EditorErrorAction.throwError(error)))
      } catch (e) {
        console.warn('Clipboard contents did not contain a valid url')
      }
    }
  }

  async addMedia({ url }, parent?: EntityTreeNode, before?: EntityTreeNode): Promise<EntityTreeNode> {
    let contentType = (await getContentType(url)) || ''
    const { hostname } = new URL(url)

    let node = createEntityNode(createEntity())
    let prefabType = '' as ScenePrefabTypes
    let updateFunc = null! as Function

    if (contentType.startsWith('model/gltf')) {
      prefabType = ScenePrefabs.model
      updateFunc = () =>
        this.setPropertyOnEntityNode(
          node,
          {
            component: ModelComponent,
            properties: { src: url }
          },
          false
        )
    } else if (contentType.startsWith('video/') || hostname === 'www.twitch.tv') {
      prefabType = ScenePrefabs.video
      updateFunc = () =>
        this.setPropertyOnEntityNode(
          node,
          {
            component: VideoComponent,
            properties: { videoSource: url }
          },
          false
        )
    } else if (contentType.startsWith('image/')) {
      prefabType = ScenePrefabs.image
      updateFunc = () =>
        this.setPropertyOnEntityNode(
          node,
          {
            component: ImageComponent,
            properties: { imageSource: url }
          },
          false
        )
    } else if (contentType.startsWith('audio/')) {
      prefabType = ScenePrefabs.audio
      updateFunc = () =>
        this.setPropertyOnEntityNode(
          node,
          {
            component: AudioComponent,
            properties: { audioSource: url }
          },
          false
        )
    } else if (url.contains('.uvol')) {
      prefabType = ScenePrefabs.volumetric
      updateFunc = () =>
        this.setPropertyOnEntityNode(
          node,
          {
            component: AudioComponent,
            properties: { audioSource: url }
          },
          false
        )
    } else {
      prefabType = ScenePrefabs.link
      updateFunc = () =>
        this.setPropertyOnEntityNode(
          node,
          {
            component: LinkComponent,
            properties: { href: url }
          },
          false
        )
    }

    if (prefabType) {
      this.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, {
        prefabTypes: prefabType,
        parents: parent,
        befores: before
      })

      updateFunc()
    }

    return node
  }
}
