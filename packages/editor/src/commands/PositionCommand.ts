import { Matrix4, Vector3 } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3D, serializeVector3 } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export interface PositionCommandParams extends CommandParams {
  positions: Vector3 | Vector3[]

  space?: TransformSpace

  addToPosition?: boolean
}

export default class PositionCommand extends Command {
  positions: Vector3[]

  addToPosition?: boolean

  space: TransformSpace

  oldPositions?: Vector3[]

  constructor(objects: EntityTreeNode[], params: PositionCommandParams) {
    super(objects, params)

    this.positions = Array.isArray(params.positions) ? params.positions : [params.positions]
    this.space = params.space ?? TransformSpace.Local
    this.addToPosition = params.addToPosition

    if (this.keepHistory) {
      this.oldPositions = objects.map((o) => getComponent(o.entity, TransformComponent)?.position.clone())
    }
  }

  execute() {
    this.updatePosition(this.affectedObjects, this.positions, this.space)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: PositionCommand): boolean {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
  }

  update(command: PositionCommand) {
    this.positions = command.positions
    this.execute()
  }

  undo() {
    if (!this.oldPositions) return

    this.updatePosition(this.affectedObjects, this.oldPositions, TransformSpace.Local, true)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetPositionCommand id: ${this.id} object: ${serializeObject3D(
      this.affectedObjects
    )} position: ${serializeVector3(this.positions)} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedObject(this.affectedObjects, 'position'))
    }
  }

  updatePosition(objects: EntityTreeNode[], positions: Vector3[], space: TransformSpace, isUndo?: boolean): void {
    const tempMatrix = new Matrix4()
    const tempVector = new Vector3()

    let obj3d
    let transformComponent
    let spaceMatrix

    const selectedEntities = accessSelectionState().selectedEntities.value

    if (space === TransformSpace.LocalSelection) {
      if (selectedEntities.length > 0) {
        const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
        obj3d = getComponent(lastSelectedEntity, Object3DComponent).value
        obj3d.updateMatrixWorld()
        spaceMatrix = obj3d.parent!.matrixWorld
      } else {
        spaceMatrix = tempMatrix.identity()
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      const pos = positions[i] ?? positions[0]

      transformComponent = getComponent(object.entity, TransformComponent)

      if (space === TransformSpace.Local) {
        if (this.addToPosition && !isUndo) transformComponent.position.add(pos)
        else transformComponent.position.copy(pos)
      } else {
        obj3d = getComponent(object.entity, Object3DComponent)?.value
        if (!obj3d) continue
        obj3d.updateMatrixWorld() // Update parent world matrices

        if (this.addToPosition && !isUndo) {
          tempVector.setFromMatrixPosition(obj3d.matrixWorld)
          tempVector.add(pos)
        }

        let _spaceMatrix = space === TransformSpace.World ? obj3d.parent.matrixWorld : spaceMatrix

        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        transformComponent.position.copy(tempVector)
      }
    }
  }
}
