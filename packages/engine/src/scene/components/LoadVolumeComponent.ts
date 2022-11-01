import { EntityUUID } from '@xrengine/common/src/interfaces/EntityUUID'
import { ComponentJson, EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { createMappedComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

export type LoadVolumeComponentType = {
  targets: {
    uuid: EntityUUID
    componentJson: ComponentJson<any>[]
  }[]
}

export const LoadVolumeComponent = createMappedComponent<LoadVolumeComponentType>('LoadVolumeComponent')

export const SCENE_COMPONENT_LOAD_VOLUME = 'load-volume'
export const SCENE_COMPONENT_LOAD_VOLUME_DEFAULT_VALUES = {
  targets: [{ uuid: '' as EntityUUID, componentJson: [] }]
} as LoadVolumeComponentType
