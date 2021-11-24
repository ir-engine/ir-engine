import EventEmitter from 'events'
import { fetchContentType } from '../functions/fetchContentType'
import { guessContentType } from '../functions/guessContentType'
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
import RotateOnAxisCommand, { RotateOnAxisCommandParams } from '../commands/RotateOnAxisCommand'
import RotateAroundCommand, { RotateAroundCommandParams } from '../commands/RotateAroundCommand'
import ScaleCommand, { ScaleCommandParams } from '../commands/ScaleCommand'
import ModifyPropertyCommand, { ModifyPropertyCommandParams } from '../commands/ModifyPropertyCommand'
import LoadMaterialSlotCommand, { LoadMaterialSlotCommandParams } from '../commands/LoadMaterialSlotMultipleCommand'
import isInputSelected from '../functions/isInputSelected'
import ModelNode from '../nodes/ModelNode'
import ShopifyNode from '../nodes/ShopifyNode'
import VideoNode from '../nodes/VideoNode'
import ImageNode from '../nodes/ImageNode'
import VolumetricNode from '../nodes/VolumetricNode'
import LinkNode from '../nodes/LinkNode'
import { SceneManager } from './SceneManager'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import SceneNode from '../nodes/SceneNode'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { ComponentConstructor, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

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
  | RotateOnAxisCommandParams
  | RotateAroundCommandParams
  | LoadMaterialSlotCommandParams

export class CommandManager extends EventEmitter {
  static instance: CommandManager = new CommandManager()

  commands: {
    [key: string]: typeof Command
  }

  selected: any[] = []
  selectedTransformRoots: any[] = []
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
      [EditorCommands.ROTATE_ON_AXIS]: RotateOnAxisCommand,
      [EditorCommands.ROTATE_AROUND]: RotateAroundCommand,
      [EditorCommands.SCALE]: ScaleCommand,
      [EditorCommands.MODIFY_PROPERTY]: ModifyPropertyCommand,
      [EditorCommands.LOAD_MATERIAL_SLOT]: LoadMaterialSlotCommand
    }

    window.addEventListener('copy', this.onCopy)
    window.addEventListener('paste', this.onPaste)
  }

  executeCommand = (command: EditorCommandsType, affectedObject?: any, params?: CommandParamsType) => {
    if (!params) params = {}

    new this.commands[command](affectedObject, params).execute()
  }

  executeCommandWithHistory = (command: EditorCommandsType, affectedObject?: any, params?: CommandParamsType) => {
    if (!params) params = {}

    this.history.execute(new this.commands[command](affectedObject, params))
  }

  executeCommandOnSelection = (command: EditorCommandsType, params?: CommandParamsType) => {
    new this.commands[command](this.selected, params).execute()
  }

  executeCommandWithHistoryOnSelection = (command: EditorCommandsType, params?: CommandParamsType) => {
    this.history.execute(new this.commands[command](this.selected, params))
  }

  setPropertyOnSelection(name: string, value: any, withHistory = true) {
    const properties = { [name]: value }
    if (withHistory) {
      this.executeCommandWithHistory(EditorCommands.MODIFY_PROPERTY, this.selected, { properties })
    } else {
      this.executeCommand(EditorCommands.MODIFY_PROPERTY, this.selected, { properties })
    }
  }

  setPropertyOnEntity(entity: Entity, component: ComponentConstructor<any, any>, name: string, value: any, withHistory = true) {
    const comp = getComponent(entity, component)

    const properties = { [name]: value }
    if (withHistory) {
      this.executeCommandWithHistory(EditorCommands.MODIFY_PROPERTY, comp, { properties })
    } else {
      this.executeCommand(EditorCommands.MODIFY_PROPERTY, comp, { properties })
    }

    comp.dirty = true
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
  getRootObjects(objects, target = [], filterUnremovable = true, filterUntransformable = false) {
    target.length = 0

    // Recursively find the nodes in the tree with the lowest depth
    const traverse = (curObject) => {
      if (
        objects.indexOf(curObject) !== -1 &&
        !(filterUnremovable && !curObject.parent) &&
        !(filterUntransformable && curObject.disableTransform)
      ) {
        target.push(curObject)
        return
      }

      const children = curObject.children

      for (let i = 0; i < children.length; i++) {
        if (children[i].isNode) {
          traverse(children[i])
        }
      }
    }

    traverse(Engine.scene)

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
  getTransformRoots(objects, target = []) {
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
    if (isInputSelected()) {
      return
    }

    event.preventDefault()

    // TODO: Prevent copying objects with a disabled transform
    if (this.selected.length > 0) {
      event.clipboardData.setData(
        'application/vnd.editor.nodes',
        JSON.stringify({ nodeUUIDs: this.selected.map((node) => node.uuid) })
      )
    }
  }

  onPaste = (event) => {
    if (isInputSelected()) {
      return
    }

    event.preventDefault()

    let data

    if ((data = event.clipboardData.getData('application/vnd.editor.nodes')) !== '') {
      const { nodeUUIDs } = JSON.parse(data)

      if (!Array.isArray(nodeUUIDs)) {
        return
      }

      const nodes = nodeUUIDs
        .map((uuid) => (Engine.scene as any as SceneNode).getObjectByUUID(uuid))
        .filter((uuid) => uuid !== undefined)

      CommandManager.instance.executeCommandWithHistory(EditorCommands.DUPLICATE_OBJECTS, nodes)
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

    let node

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
