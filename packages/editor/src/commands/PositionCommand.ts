import Command, { CommandParams } from './Command'
import { TransformSpace } from '../constants/TransformSpace'
import { serializeVector3, serializeObject3D } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import { Matrix4, Vector3 } from 'three'
import EditorEvents from '../constants/EditorEvents'
import arrayShallowEqual from '../functions/arrayShallowEqual'

export interface PositionCommandParams extends CommandParams {
  position?: any

  space?: any
}

export default class PositionCommand extends Command {
  position: any

  space: any

  oldPositions: any

  constructor(objects?: any | any[], params?: PositionCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects
    this.position = params.position.clone()
    this.space = params.space
    this.oldPositions = objects.map((o) => o.position.clone())
  }

  execute() {
    this.updatePosition(this.affectedObjects, this.position, this.space)

    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand): boolean {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.objects)
  }

  update(command) {
    this.position = command.position.clone()
    this.updatePosition(this.affectedObjects, command.position, this.space)
  }

  undo() {
    this.updatePosition(this.affectedObjects, this.oldPositions, TransformSpace.Local)
  }

  toString() {
    return `SetPositionCommand id: ${this.id} object: ${serializeObject3D(this.affectedObjects)} position: ${serializeVector3(
      this.position
    )} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'position')
    }
  }

  updatePosition(objects: any[], position: any, space: any): void {
    const tempMatrix = new Matrix4()
    const tempVector = new Vector3()

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

      const pos = Array.isArray(position) ? position[i] : position

      if (space === TransformSpace.Local) {
        object.position.copy(pos)
      } else {
        object.updateMatrixWorld() // Update parent world matrices

        tempMatrix.copy(pos)

        let _spaceMatrix = space === TransformSpace.World ? object.parent.matrixWorld : spaceMatrix

        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        object.position.copy(tempVector)
      }

      object.updateMatrixWorld(true)

      object.onChange('position')
    }
  }
}
