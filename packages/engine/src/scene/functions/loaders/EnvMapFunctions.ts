import { getState } from '@etherealengine/hyperflux'

import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { isClient } from '../../../common/functions/isClient'
import { Entity } from '../../../ecs/classes/Entity'
import { SceneState } from '../../../ecs/classes/Scene'
import { ComponentType, setComponent } from '../../../ecs/functions/ComponentFunctions'
import { EnvmapComponent } from '../../components/EnvmapComponent'

export const deserializeEnvMap: ComponentDeserializeFunction = (
  entity: Entity,
  data: ComponentType<typeof EnvmapComponent>
) => {
  if (!isClient) return
  if (entity === getState(SceneState).sceneEntity) return
  setComponent(entity, EnvmapComponent, data)
}
