import EventEmitter from 'events'
import { fetchContentType } from '@xrengine/common/src/utils/fetchContentType'
import { guessContentType } from '@xrengine/common/src/utils/guessContentType'
import History from '../classes/History'
import EditorCommands, { EditorCommandsType } from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import AddObjectCommand, { AddObjectCommandParams } from '../commands/AddObjectCommand'
import AddToSelectionCommand from '../commands/AddToSelectionCommand'
import Command from '../commands/Command'
import DuplicateObjectCommand, { DuplicateObjectCommandParams } from '../commands/DuplicateObjectCommand'
import RemoveFromSelectionCommand from '../commands/RemoveFromSelectionCommand'
import RemoveObjectsCommand, { RemoveObjectCommandParams } from '../commands/RemoveObjectsCommand'
import ReparentCommand, { ReparentCommandParams } from '../commands/ReparentCommand'
import ReplaceSelectionCommand from '../commands/ReplaceSelectionCommand'
import ToggleSelectionCommand from '../commands/ToggleSelectionCommand'
import GroupCommand, { GroupCommandParams } from '../commands/GroupCommand'
import PositionCommand, { PositionCommandParams } from '../commands/PositionCommand'
import RotationCommand, { RotationCommandParams } from '../commands/RotationCommand'
import RotateAroundCommand, { RotateAroundCommandParams } from '../commands/RotateAroundCommand'
import ScaleCommand, { ScaleCommandParams } from '../commands/ScaleCommand'
import ModifyPropertyCommand, { ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import isInputSelected from '../functions/isInputSelected'
import ModelNode from '../nodes/ModelNode'
import VideoNode from '../nodes/VideoNode'
import ImageNode from '../nodes/ImageNode'
import VolumetricNode from '../nodes/VolumetricNode'
import LinkNode from '../nodes/LinkNode'
import { SceneManager } from './SceneManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from '../nodes/SceneNode'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import TagComponentCommand, { TagComponentCommandParams } from '../commands/TagComponentCommand'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'

export type CommandParamsType =
  | AddObjectCommandParams
  | RemoveObjectCommandParams
  | DuplicateObjectCommandParams
  | ModifyPropertyCommandParams
  | ReparentCommandParams
  | GroupCommandParams
  | PositionCommandParams
  | RotationCommandParams
  | ScaleCommandParams
  | RotateAroundCommandParams
  | TagComponentCommandParams

export class CommandManager extends EventEmitter {
  static instance: CommandManager = new CommandManager()

  commands: {
    [key: string]: typeof Command
  }

  selected: EntityTreeNode[] = []
  selectedTransformRoots: EntityTreeNode[] = []
  history: History

  constructor() {
    super()

    this.history = new History()

    this.commands = {
      [EditorCommands.ADD_OBJECTS]: AddObjectCommand,
      [EditorCommands.DUPLICATE_OBJECTS]: DuplicateObjectCommand,
      [EditorCommands.REMOVE_OBJECTS]: RemoveObjectsCommand,
      [EditorCommands.ADD_TO_SELECTION]: AddToSelectionCommand,
      [EditorCommands.REMOVE_FROM_SELECTION]: RemoveFromSelectionCommand,
      [EditorCommands.TOGGLE_SELECTION]: ToggleSelectionCommand,
      [EditorCommands.REPLACE_SELECTION]: ReplaceSelectionCommand,
      [EditorCommands.REPARENT]: ReparentCommand,
      [EditorCommands.GROUP]: GroupCommand,
      [EditorCommands.POSITION]: PositionCommand,
      [EditorCommands.ROTATION]: RotationCommand,
      [EditorCommands.ROTATE_AROUND]: RotateAroundCommand,
      [EditorCommands.SCALE]: ScaleCommand,
      [EditorCommands.MODIFY_PROPERTY]: ModifyPropertyCommand,
      [EditorCommands.TAG_COMPONENT]: TagComponentCommand
    }

    window.addEventListener('copy', this.onCopy)
    window.addEventListener('paste', this.onPaste)
  }

  executeCommand = (
    command: EditorCommandsType,
    object: EntityTreeNode | EntityTreeNode[],
    params: CommandParamsType = {}
  ) => {
    if (!params) params = {}
    new this.commands[command](!Array.isArray(object) ? [object] : object, params).execute()
  }

  executeCommandWithHistory = (
    command: EditorCommandsType,
    object: EntityTreeNode | EntityTreeNode[],
    params: CommandParamsType = {}
  ) => {
    params.keepHistory = true
    this.history.execute(new this.commands[command](!Array.isArray(object) ? [object] : object, params))
  }

  executeCommandOnSelection = (command: EditorCommandsType, params: CommandParamsType = {}) => {
    new this.commands[command](this.selected, params).execute()
  }

  executeCommandWithHistoryOnSelection = (command: EditorCommandsType, params: CommandParamsType = {}) => {
    params.keepHistory = true
    this.history.execute(new this.commands[command](this.selected, params))
  }

  setProperty(affectedEntityNodes: EntityTreeNode[], params: ModifyPropertyCommandParams, withHistory = true) {
    if (withHistory) {
      this.executeCommandWithHistory(EditorCommands.MODIFY_PROPERTY, affectedEntityNodes, params)
    } else {
      this.executeCommand(EditorCommands.MODIFY_PROPERTY, affectedEntityNodes, params)
    }
  }

  setPropertyOnSelection(name: string, value: any, withHistory = true) {
    this.setProperty(this.selected, name, value, withHistory)
  }

  setPropertyOnSelectionEntities(params: ModifyPropertyCommandParams, withHistory = true) {
    this.setProperty(this.selected, params, withHistory)
  }

  setPropertyOnEntityNode(node: EntityTreeNode, params: ModifyPropertyCommandParams, withHistory = true) {
    this.setProperty([node], params, withHistory)
  }

  emitEvent = (event: EditorEvents, ...args: any[]): void => {
    this.emit(event.toString(), ...args)
  }

  /**
   * Function getRootObjects used to find root objects.
   *
   * @author Robert Long
   * @param  {any}  objects
   * @param  {Array}   [target=[]]
   * @param  {Boolean} [filterUnremovable=true]
   * @param  {Boolean} [filterUntransformable=false]
   * @return {any}
   */
  getRootObjects(objects, target: EntityTreeNode[] = [], filterUnremovable = true, filterUntransformable = false) {
    target.length = 0

    // Recursively find the nodes in the tree with the lowest depth
    const traverse = (curObject: EntityTreeNode) => {
      if (
        objects.indexOf(curObject) !== -1 &&
        !(filterUnremovable && !curObject.parentNode) &&
        !(filterUntransformable && hasComponent(curObject.entity, DisableTransformTagComponent))
      ) {
        target.push(curObject)
        return
      }

      if (curObject.children) {
        for (let i = 0; i < curObject.children.length; i++) {
          traverse(curObject.children[i])
        }
      }
    }

    const world = useWorld()
    traverse(world.entityTree.rootNode)

    return target
  }

  /**
   * Function getTransformRoots provides root objects
   *
   * @author Robert Long
   * @param objects
   * @param target
   * @returns
   */
  getTransformRoots(objects, target: EntityTreeNode[] = []) {
    return this.getRootObjects(objects, target, true, true)
  }

  /**
   * Function to update transform roots.
   *
   * @author Robert Long
   */
  updateTransformRoots() {
    this.getTransformRoots(this.selected, this.selectedTransformRoots)
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
    if (this.selected.length > 0) {
      event.clipboardData.setData(
        'application/vnd.editor.nodes',
        JSON.stringify({ entities: this.selected.map((node) => node.entity) })
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
        .map((entity) => useWorld().entityTree.findNodeFromEid(entity))
        .filter((entity) => entity) as EntityTreeNode[]

      if (nodes) {
        CommandManager.instance.executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, nodes)
      }
    } else if ((data = event.clipboardData.getData('text')) !== '') {
      try {
        const url = new URL(data)
        this.addMedia({ url: url.href }).catch((error) => this.emitEvent(EditorEvents.ERROR, error))
      } catch (e) {
        console.warn('Clipboard contents did not contain a valid url')
      }
    }
  }

  async addMedia({ url }, parent?: any, before?: any) {
    let contentType = ''
    const { hostname } = new URL(url)

    try {
      contentType = (await guessContentType(url)) || (await fetchContentType(url)) || ''
    } catch (error) {
      console.warn(`Couldn't fetch content type for url ${url}. Using LinkNode instead.`)
    }

    let node: EntityTreeNode

    if (contentType.startsWith('model/gltf')) {
      node = new ModelNode()
      node.initialScale = 'fit'
      await node.load(url)
    }

    // else if (contentType.startsWith('shopify/gltf')) {
    //   node = new ShopifyNode()
    //   node.initialScale = 'fit'
    //   await node.load(url)
    // }
    else if (contentType.startsWith('video/') || hostname === 'www.twitch.tv') {
      node = new VideoNode()
      await node.load(url)
    } else if (contentType.startsWith('image/')) {
      node = new ImageNode()
      await node.load(url)
    } else if (contentType.startsWith('audio/')) {
      node = new AudioNode()
      await node.load(url)
    } else if (url.contains('.uvol')) {
      node = new VolumetricNode()
    } else {
      node = new LinkNode()
      node.href = url
    }

    SceneManager.instance.getSpawnPosition(node.position)
    this.executeCommandWithHistory(EditorCommands.ADD_OBJECTS, node, { parents: parent, befores: before })

    CommandManager.instance.emitEvent(EditorEvents.FILE_UPLOADED)
    return node
  }
}
