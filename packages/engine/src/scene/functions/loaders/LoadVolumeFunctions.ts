import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { iterateEntityNode, removeEntityNodeFromParent } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { Physics } from '@xrengine/engine/src/physics/classes/Physics'
import { RigidBodyComponent } from '@xrengine/engine/src/physics/components/RigidBodyComponent'
import { CallbackComponent, setCallback } from '@xrengine/engine/src/scene/components/CallbackComponent'
import {
  LoadVolumeComponent,
  LoadVolumeComponentType,
  SCENE_COMPONENT_LOAD_VOLUME_DEFAULT_VALUES
} from '@xrengine/engine/src/scene/components/LoadVolumeComponent'
import { serializeEntity, serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import { updateSceneEntity } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'

import { EntityTreeNode } from '../../../ecs/functions/EntityTree'

export const deserializeLoadVolume: ComponentDeserializeFunction = (entity: Entity, data: LoadVolumeComponentType) => {
  const props = parseLoadVolumeProperties(data)
  addComponent(entity, LoadVolumeComponent, props)
}

function parseLoadVolumeProperties(data: LoadVolumeComponentType) {
  return { ...SCENE_COMPONENT_LOAD_VOLUME_DEFAULT_VALUES, ...data }
}

export const updateLoadVolume: ComponentUpdateFunction = (entity: Entity) => {
  const world = Engine.instance.currentWorld
  const nodeMap = world.entityTree.entityNodeMap
  const uuidMap = world.entityTree.uuidNodeMap
  const component = { ...getComponent(entity, LoadVolumeComponent) }
  component.targets = { ...component.targets }
  function finishUpdate() {
    component.targets?.map?.(({ uuid, componentJson }) => {
      if (uuidMap.has(uuid)) {
        const targetNode = uuidMap.get(uuid)!
        component.targets.push({ uuid, componentJson: serializeEntity(targetNode.entity) })
      }
    })
  }

  function doLoad() {
    component.targets.map(({ uuid, componentJson }) => {
      const loaded = updateSceneEntity(uuid, { name: uuid, components: componentJson })
    })
  }

  function doUnload() {
    const nuComponent = { ...component }
    nuComponent.targets = []
    component.targets.map(({ uuid }) => {
      if (uuidMap.has(uuid)) {
        const targetNode = uuidMap.get(uuid)!
        const targetEntity = targetNode.entity
        const componentJson = serializeEntity(targetEntity)
        nuComponent.targets.push({ uuid, componentJson })
        setComponent(entity, LoadVolumeComponent, nuComponent)
        const nodesToDelete: EntityTreeNode[] = []
        iterateEntityNode(targetNode, (node) => {
          nodesToDelete.push(node)
          node.children.filter((entity) => !nodeMap.has(entity)).map((entity) => removeEntity(entity))
          removeEntity(entity)
          removeEntityNodeFromParent(node)
        })
      }
    })
  }

  if (hasComponent(entity, CallbackComponent)) {
    removeComponent(entity, CallbackComponent)
  }

  setCallback(entity, 'doLoad', doLoad)
  setCallback(entity, 'doUnload', doUnload)

  if (!getEngineState().sceneLoaded) {
    matchActionOnce(EngineActions.sceneLoaded.matches, finishUpdate)
  } else finishUpdate()
}

export const serializeLoadVolume: ComponentSerializeFunction = (entity: Entity) => {
  const component = getComponent(entity, LoadVolumeComponent)
  if (!component) return
  const toSave = {
    ...component,
    targets: component.targets.map(({ uuid }) => ({ uuid, componentJson: [] }))
  }
  return toSave
}
