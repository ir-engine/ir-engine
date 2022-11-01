import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction
} from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { serializeComponent, setComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { LoadVolumeComponent, LoadVolumeComponentType } from '@xrengine/engine/src/scene/components/LoadVolumeComponent'

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
