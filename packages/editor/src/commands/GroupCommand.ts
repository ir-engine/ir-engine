import Command, { CommandParams } from './Command'
import { serializeObject3DArray, serializeObject3D } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Object3D } from 'three'
import { TreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { TransformComponent, TransformData } from '@xrengine/engine/src/transform/components/TransformComponent'

export interface GroupCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: any

  /** Child object before which all objects will be added */
  befores?: any
}

export default class GroupCommand extends Command {
  undoObjects: any[]

  groupParent: any

  groupBefore: any

  oldParents: any[]

  oldBefores: any[]

  groupNode: TreeNode

  constructor(objects?: any | any[], params?: GroupCommandParams) {
    super(objects, params)

    this.affectedObjects = Array.isArray(objects) ? objects : [objects]
    this.undoObjects = []
    this.groupParent = params.parents
    this.groupBefore = params.befores
    this.oldParents = []
    this.oldBefores = []
    this.oldSelection = CommandManager.instance.selected.slice(0)

    for (let i = this.affectedObjects.length - 1; i >= 0; i--) {
      const object = this.affectedObjects[i]
      this.undoObjects.push(object)
      this.oldParents.push(object.parentNode)
      this.oldBefores.push(object.parentNode.children[object.parentNode.children.indexOf(object) + 1])
    }
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const groupEntity = createEntity()
    addComponent(groupEntity, NameComponent, { name: 'Group' })
    const obj3d = addComponent(groupEntity, Object3DComponent, { value: new Object3D() })
    addComponent<TransformData, {}>(groupEntity, TransformComponent, new TransformData(obj3d.value))

    this.groupNode = new TreeNode(groupEntity)

    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.groupNode, {
      parents: this.groupParent,
      befores: this.groupBefore,
      shouldEmitEvent: false,
      isObjectSelected: false
    })

    CommandManager.instance.executeCommand(EditorCommands.REPARENT, this.affectedObjects, {
      parents: this.groupNode,
      shouldEmitEvent: false,
      isObjectSelected: false
    })

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.groupNode, {
        shouldEmitEvent: false,
        shouldGizmoUpdate: false
      })
    }

    CommandManager.instance.updateTransformRoots()

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.REPARENT, this.undoObjects, {
      parents: this.oldParents,
      befores: this.oldBefores,
      shouldEmitEvent: false,
      isObjectSelected: false
    })
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.groupNode, {
      deselectObject: false,
      shouldEmitEvent: false
    })
    CommandManager.instance.updateTransformRoots()
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection, {
      shouldGizmoUpdate: false
    })
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `GroupMultipleObjectsCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} groupParent: ${serializeObject3D(this.groupParent)} groupBefore: ${serializeObject3D(this.groupBefore)}`
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent && this.isSelected)
      CommandManager.instance.emitEvent(EditorEvents.BEFORE_SELECTION_CHANGED)
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      if (this.isSelected) {
        CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)
      }

      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }
}
