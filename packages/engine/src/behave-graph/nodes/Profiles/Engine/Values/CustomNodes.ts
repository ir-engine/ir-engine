import { Engine } from '../../../../../ecs/classes/Engine'
import { Entity } from '../../../../../ecs/classes/Entity'
import { setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'
import { NodeCategory, makeFlowNodeDefinition } from '../../../Nodes/NodeDefinitions'
import { toQuat, toVector3 } from '../../Scene/buildScene'

export const teleportCamera = makeFlowNodeDefinition({
  typeName: 'engine/teleportCamera',
  category: NodeCategory.Action,
  label: 'Teleport Camera',
  in: {
    flow: 'flow',
    targetPosition: 'vec3',
    targetRotation: 'quat'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const position = toVector3(read('targetPosition'))
    const rotation = toQuat(read('targetRotation'))
    const camera = Engine.instance.cameraEntity
    setComponent(camera, TransformComponent, { position: position, rotation: rotation })
    commit('flow')
  }
})

export const teleportEntity = makeFlowNodeDefinition({
  typeName: 'engine/teleportEntity',
  category: NodeCategory.Action,
  label: 'Teleport Entity',
  in: {
    flow: 'flow',
    entity: 'entity',
    targetPosition: 'vec3',
    targetRotation: 'quat'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const position = toVector3(read('targetPosition'))
    const rotation = toQuat(read('targetRotation'))
    const entity = Number(read('entity')) as Entity
    setComponent(entity, TransformComponent, { position: position, rotation: rotation })
    commit('flow')
  }
})
