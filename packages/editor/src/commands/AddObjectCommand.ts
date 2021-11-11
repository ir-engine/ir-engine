import Command, { CommandParams } from './Command'
import { serializeObject3D } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import getDetachedObjectsRoots from '../functions/getDetachedObjectsRoots'
import makeUniqueName from '../functions/makeUniqueName'
import { SceneManager } from '../managers/SceneManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { DefautSceneEntityShape, getShapeOfEntity } from '@xrengine/engine/src/common/constants/Object3DClassMap'

export interface AddObjectCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: any

  /** Child object before which all objects will be added */
  befores?: any

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  /** ComponentData */
  componentData?: any[]
}

export default class AddObjectCommand extends Command {
  /** Parent object which will hold objects being added by this command */
  parents: any

  /** Child object before which all objects will be added */
  befores: any

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  duplicateObjects?: any[]

  /** ComponentData */
  componentData?: any[]

  constructor(objects?: any | any[], params?: AddObjectCommandParams) {
    super(objects, params)

    this.affectedObjects = Array.isArray(objects) ? objects : [objects]
    this.parents = Array.isArray(params.parents) ? params.parents : [params.parents]
    this.befores = Array.isArray(params.befores) ? params.befores : [params.befores]
    this.useUniqueName = params.useUniqueName ?? true
    this.oldSelection = CommandManager.instance.selected.slice(0)
    this.componentData = params.componentData
  }

  execute(): void {
    this.emitBeforeExecuteEvent()

    this.addObject(this.affectedObjects, this.parents, this.befores)

    this.emitAfterExecuteEvent()
  }

  undo(): void {
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.affectedObjects, {
      deselectObject: false
    })
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString(): string {
    return `AddObjectCommand id: ${this.id} object: ${serializeObject3D(
      this.affectedObjects
    )} parent: ${serializeObject3D(this.parents)} before: ${serializeObject3D(this.befores)}`
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

  addObject(objects: TreeNode[], parents: TreeNode[], befores: TreeNode[]): void {
    const rootObjects = getDetachedObjectsRoots(objects) as TreeNode[]
    const world = useWorld()

    for (let i = 0; i < rootObjects.length; i++) {
      const object = rootObjects[i]
      const parent = parents ? parents[i] ?? parents[0] : undefined
      const before = befores ? befores[i] ?? befores[0] : undefined

      const obj3d = getComponent(object.eid, Object3DComponent)

      if (parent) {
        const index = before ? parent.children.indexOf(before) : undefined
        object.reparent(parent, index)

        const parentObj3d = getComponent(parent.eid, Object3DComponent)
        if (parentObj3d) {
          const beforeObj3d = getComponent(before.eid, Object3DComponent)
          const sceneIndex = beforeObj3d ? parentObj3d.value.children.indexOf(beforeObj3d.value) : -1

          if (sceneIndex === -1) {
            parentObj3d.value.children.push(obj3d.value)
          } else {
            parentObj3d.value.children.splice(sceneIndex, 0, obj3d.value)
          }

          // obj3d.value.traverse((child: any) => {
          //   if (child.onAdd) child.onAdd()
          // })

          obj3d.parent = parentObj3d
        }
      } else if (object !== world.entityTree.rootNode) {
        SceneManager.instance.scene.add(obj3d.value)
        object.reparent(world.entityTree.rootNode)
      }

      if (this.useUniqueName) makeUniqueName(object, world.entityTree)

      const compData = this.componentData ? this.componentData[i] : undefined

      if (compData) {
        const entityShape = getShapeOfEntity(Object.keys(compData))

        if (entityShape) entityShape.create(object.eid, compData, { sceneProperty: { isEditor: true } })
        else DefautSceneEntityShape.create(object.eid, compData)
      }
    }

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.affectedObjects, {
        shouldEmitEvent: false
      })
    }
  }
}
