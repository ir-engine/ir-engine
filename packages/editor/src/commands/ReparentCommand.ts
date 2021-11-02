import i18n from 'i18next'
import Command, { CommandParams } from './Command'
import { serializeObject3DArray, serializeObject3D } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { Matrix4 } from 'three'
import { TreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'

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

    this.affectedObjects = Array.isArray(objects) ? objects : [objects]
    this.undoObjects = []
    this.newParents = Array.isArray(params.parents) ? params.parents : [params.parents]
    this.newBefores = Array.isArray(params.befores) ? params.befores : [params.befores]
    this.newPositions = params.positions
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
    this.reparent(this.affectedObjects, this.newParents, this.newBefores)
    CommandManager.instance.updateTransformRoots()
    this.emitAfterExecuteEvent()
  }

  undo() {
    this.isSelected = false
    this.reparent(this.undoObjects, this.oldParents, this.oldBefores)

    this.shouldEmitEvent = true
    this.isSelected = true

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
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

  reparent(objects?: TreeNode[], parents?: any, before?: any): void {
    const world = useWorld()

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      if (!object.parentNode) {
        throw new Error(i18n.t('editor:errors.noParent', { node: object.nodeName || object.type, name: object.name }))
      }

      const newParent = parents[i] ?? parents[0]

      if (!newParent) {
        throw new Error(i18n.t('editor:errors.undefinedParent'))
      }

      const obj3d = getComponent(object.eid, Object3DComponent)
      const parentObj3d = getComponent(newParent.eid, Object3DComponent)
      const parentObj = world.entityTree.rootNode === newParent
        ? Engine.scene
        : parentObj3d ? parentObj3d.value : obj3d.value.parent

      // If parent is different then maintain world position of the object when reparenting.
      if (newParent !== object.parentNode) {
        const tempMatrix1 = new Matrix4()
        tempMatrix1.copy(parentObj.matrixWorld).invert()

        obj3d.value.parent.updateMatrixWorld()
        tempMatrix1.multiply(obj3d.value.parent.matrixWorld)

        obj3d.value.applyMatrix4(tempMatrix1)
      }

      // Remove from parent in threejs scene
      const objectIndex = obj3d.value.parent.children.indexOf(obj3d.value)
      obj3d.value.parent.children.splice(objectIndex, 1)

      // Add to new parent in threejs scene
      const newBefore = Array.isArray(before) ? before[i] : before
      if (newBefore) {
        const beforeObj3d = getComponent(newBefore.eid, Object3DComponent)
        const index = parentObj.children.indexOf(beforeObj3d.value)
        parentObj.children.splice(index, 0, obj3d.value)
      } else {
        parentObj.children.push(obj3d.value)
      }

      // Reparent in Entity Tree
      const newObjectIndex = newBefore && newParent.children ? newParent.children.indexOf(newBefore) : undefined
      object.reparent(newParent, newObjectIndex)
      obj3d.value.parent = parentObj
    }

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, objects, {
        shouldEmitEvent: false,
        shouldGizmoUpdate: false
      })
    }
  }
}
