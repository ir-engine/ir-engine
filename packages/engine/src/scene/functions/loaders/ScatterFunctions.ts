import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import { ScatterComponentType, ScatterMode, ScatterState } from '../../components/ScatterComponent'

export const SCENE_COMPONENT_SCATTER = 'scatter'
export const SCENE_COMPONENT_SCATTER_DEFAULT_VALUES = {
  count: 1000,
  surface: null,
  densityMap: '',
  mode: ScatterMode.GRASS,
  state: ScatterState.UNSTAGED
}

export const deserializeScatter: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ScatterComponentType>
) => {}
