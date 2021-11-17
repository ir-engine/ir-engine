import i18n from 'i18next'
import { Matrix4 } from 'three'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import Command, { CommandParams } from './Command'
import { serializeObject3DArray, serializeObject3D } from '../functions/debug'
import reverseDepthFirstTraverse from '../functions/reverseDepthFirstTraverse'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { TransformSpace } from '../constants/TransformSpace'

export interface ReparentCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: any

  /** Child object before which all objects will be added */
  befores?: any

  positions?: any
}

export default class ReparentCommand extends Command {
  undoObjects: any[]

  newParents: any

  newBefores: any

  newPositions: any

  oldParents: any[]

  oldBefores: any[]

  oldPositions: any[]

  constructor(objects?: any | any[], params?: ReparentCommandParams) {
    super(objects, params)

    this.affectedObjects = []
    this.undoObjects = []
    this.newParents = Array.isArray(params.parents) ? params.parents : [params.parents]
    this.newBefores = Array.isArray(params.befores) ? params.befores : [params.befores]
    this.newPositions = params.positions
    this.oldParents = []
    this.oldBefores = []
    this.oldSelection = CommandManager.instance.selected.slice(0)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.oldPositions = objects.map((o) => o.position.clone())

    Engine.scene.traverse((object) => {
      if (objects.indexOf(object) !== -1) {
        this.affectedObjects.push(object)
      }
    })

    // Sort objects, parents, and befores with a depth first search so that undo adds nodes in the correct order
    reverseDepthFirstTraverse(Engine.scene, (object) => {
      if (objects.indexOf(object) !== -1) {
        this.undoObjects.push(object)
        this.oldParents.push(object.parent)
        if (object.parent) {
          const siblings = object.parent.children
          const index = siblings.indexOf(object)
          if (index + 1 < siblings.length) {
            this.oldBefores.push(siblings[index + 1])
          } else {
            this.oldBefores.push(undefined)
          }
        }
      }
    })
  }

  execute() {
    this.emitBeforeExecuteEvent()

    this.reparent(this.affectedObjects, this.newParents, this.newBefores)

    if (this.newPositions) {
      CommandManager.instance.executeCommand(EditorCommands.POSITION, this.affectedObjects, {
        positions: this.newPositions,
        space: TransformSpace.Local
      })
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    this.isSelected = false
    this.shouldEmitEvent = false
    this.reparent(this.affectedObjects, this.oldParents, this.oldBefores)
    this.shouldEmitEvent = true
    this.isSelected = true

    if (this.newPositions) {
      CommandManager.instance.executeCommand(EditorCommands.POSITION, this.affectedObjects, {
        positions: this.oldPositions,
        space: TransformSpace.Local,
        shouldEmitEvent: false
      })
    }

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection, {
      shouldGizmoUpdate: false
    })

    CommandManager.instance.updateTransformRoots()
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `${this.constructor.name} id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} newParent: ${serializeObject3D(this.newParents)} newBefore: ${serializeObject3D(this.newBefores)}`
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

  reparent(objects?: any[], parents?: any, before?: any): void {
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      if (!object.parent) {
        throw new Error(i18n.t('editor:errors.noParent', { node: object.nodeName || object.type, name: object.name }))
      }

      const newParent = parents[i] ?? parents[0]

      if (!newParent) {
        throw new Error(i18n.t('editor:errors.undefinedParent'))
      }

      if (newParent !== object.parent) {
        // Maintain world position when reparenting.
        newParent.updateMatrixWorld()

        const tempMatrix1 = new Matrix4()
        tempMatrix1.copy(newParent.matrixWorld).invert()

        object.parent.updateMatrixWorld()
        tempMatrix1.multiply(object.parent.matrixWorld)

        object.applyMatrix(tempMatrix1)

        object.updateWorldMatrix(false, false)
      }

      const objectIndex = object.parent.children.indexOf(object)
      object.parent.children.splice(objectIndex, 1)

      const newBefore = Array.isArray(before) ? before[i] : before

      if (newBefore) {
        const newObjectIndex = newParent.children.indexOf(newBefore)
        newParent.children.splice(newObjectIndex, 0, object)
      } else {
        newParent.children.push(object)
      }

      object.parent = newParent

      object.updateMatrixWorld(true)
    }

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, objects, {
        shouldEmitEvent: false,
        shouldGizmoUpdate: false
      })
    }

    CommandManager.instance.updateTransformRoots()
  }
}
