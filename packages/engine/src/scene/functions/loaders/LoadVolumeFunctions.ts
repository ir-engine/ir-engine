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
  serializeComponent,
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
  LoadVolumeTargetType
} from '@xrengine/engine/src/scene/components/LoadVolumeComponent'

import { EntityTreeNode } from '../../../ecs/functions/EntityTree'

export const deserializeLoadVolume: ComponentDeserializeFunction = (entity: Entity, data) => {
  const props = parseLoadVolumeProperties(data)
  setComponent(entity, LoadVolumeComponent, props)
}

function parseLoadVolumeProperties(data: any) {
  if (data && Array.isArray(data.targets)) {
    return { targets: new Map(data.targets) } as LoadVolumeComponentType
  } else return { targets: new Map() } as LoadVolumeComponentType
}

export const serializeLoadVolume: ComponentSerializeFunction = (entity: Entity) => {
  const component = serializeComponent(entity, LoadVolumeComponent)
  const result: any = {}
  result.targets = [...component.targets.values()]
  return result
}
