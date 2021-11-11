import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { NodeManager } from '../managers/NodeManager'
import { TreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getAllComponents, getComponent, removeAllComponents, serializeComponents } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { ComponentData } from '@xrengine/engine/src/common/classes/ComponentData'
import { getShapeOfEntity } from '@xrengine/engine/src/common/constants/Object3DClassMap'

export interface RemoveObjectCommandParams extends CommandParams {
  /** Whether to deselect object or not */
  deselectObject?: boolean

  /** Whether to serialize all the component or not. serialized components will be used for undo operation */
  serializeComponent?: boolean
}

export default class RemoveObjectsCommand extends Command {
  undoObjects: any[]

  oldParents: any[]

  oldBefores: any[]

  deselectObject?: boolean

  serializeComponent?: boolean
  oldComponents?: any[]

  constructor(objects?: any | any[], params?: RemoveObjectCommandParams) {
    super(objects, params)

    this.affectedObjects = Array.isArray(objects) ? objects : [objects]
    this.oldParents = []
    this.oldBefores = []
    this.undoObjects = []
    this.oldSelection = CommandManager.instance.selected.slice(0)
    this.deselectObject = params.deselectObject
    this.serializeComponent = params.serializeComponent
    this.oldComponents = []

    for (let i = this.affectedObjects.length - 1; i >= 0; i--) {
      const object = this.affectedObjects[i]
      this.undoObjects.push(object)
      this.oldParents.push(object.parentNode)
      this.oldBefores.push(object.parentNode.children[object.parentNode.children.indexOf(object) + 1])

      if (this.serializeComponent) {
        this.oldComponents.push(serializeComponents(object.eid))
      }
    }
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const removeObjectsRoots = CommandManager.instance.getRootObjects(this.affectedObjects)

    for (let i = 0; i < removeObjectsRoots.length; i++) {
      const object = removeObjectsRoots[i] as TreeNode

      if (!object.parentNode) return  // Avoid deleting root object

      const obj3d = getComponent(object.eid, Object3DComponent)

      if (obj3d) {
        // obj3d.value.traverse((child: any) => {
        //   if (child.onRemove) child.onRemove()
        // })

        obj3d.value.parent.remove(obj3d.value)
      }

      removeAllComponents(object.eid)
      object.removeFromParent()

      if (this.deselectObject) {
        CommandManager.instance.executeCommand(EditorCommands.REMOVE_FROM_SELECTION, object, {
          shouldEmitEvent: this.shouldEmitEvent
        })
      }
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.undoObjects, {
      parents: this.oldParents,
      befores: this.oldBefores,
      isObjectSelected: this.isSelected,
      useUniqueName: false,
      componentData: this.oldComponents
    })

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `RemoveMultipleObjectsCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }
}
