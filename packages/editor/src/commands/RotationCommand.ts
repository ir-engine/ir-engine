import Command, { CommandParams } from './Command'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeEuler } from '../functions/debug'
import { Matrix4, Quaternion, Euler } from 'three'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

export interface RotationCommandParams extends CommandParams {
  rotations: Euler | Euler[]

  space?: any
}

export default class RotationCommand extends Command {
  rotations: Euler[]

  space: any

  oldRotations: Euler[]

  constructor(objects?: any | any[], params?: RotationCommandParams) {
    if (!params) return

    super(objects, params)

    if (!Array.isArray(objects)) objects = [objects]
    if (!Array.isArray(params.rotations)) params.rotations = [params.rotations]

    this.affectedObjects = objects.slice(0)
    this.rotations = params.rotations.map((r) => r.clone())
    this.space = params.space ?? TransformSpace.Local
    this.oldRotations = objects.map((o) => getComponent(o.entity, Object3DComponent).value.rotation.clone())
  }

  execute() {
    this.updateRotation(this.affectedObjects, this.rotations, this.space)

    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: RotationCommand) {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
  }

  update(command) {
    this.rotations = command.rotations
    this.updateRotation(this.affectedObjects, command.rotations, this.space)
    this.emitAfterExecuteEvent()
  }

  undo() {
    this.updateRotation(this.affectedObjects, this.oldRotations, this.space)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetRotationMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} rotation: ${serializeEuler(this.rotations)} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'rotation')
    }
  }

  updateRotation(objects: EntityTreeNode[], rotations: Euler[], space: any): void {
    const tempMatrix = new Matrix4()
    const tempQuaternion1 = new Quaternion()
    const tempQuaternion2 = new Quaternion()

    let spaceMatrix

    if (space === TransformSpace.LocalSelection) {
      if (CommandManager.instance.selected.length > 0) {
        const lastSelectedObject = CommandManager.instance.selected[CommandManager.instance.selected.length - 1]
        lastSelectedObject.updateMatrixWorld()
        spaceMatrix = lastSelectedObject.parent.matrixWorld
      } else {
        spaceMatrix = tempMatrix.identity()
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      let obj3d = getComponent(object.entity, Object3DComponent).value
      let transformComponent = getComponent(object.entity, TransformComponent)

      tempQuaternion1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        transformComponent.rotation.copy(tempQuaternion1)
      } else {
        obj3d.updateMatrixWorld() // Update parent world matrices

        let _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : spaceMatrix

        const inverseParentWorldQuaternion = tempQuaternion2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(tempQuaternion1)

        transformComponent.rotation.copy(newLocalQuaternion)
      }

      if ((object as any).onChange) (object as any).onChange('rotation')
    }
  }
}
