import { Color } from 'three'
import { isClient } from '../../common/functions/isClient'
import { EnvmapComponent, EnvmapComponentType } from '../components/EnvmapComponent'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { EnvMapTextureType } from '../constants/EnvMapEnum'

export const setEnvMap = (entity: Entity, args: EnvmapComponentType) => {
  if (!isClient) return

  addComponent(entity, EnvmapComponent, {
    ...args,
    envMapSourceColor: args.envMapSourceColor ? new Color(args.envMapSourceColor) : undefined,
    envMapTextureType: args.envMapTextureType ?? EnvMapTextureType.Cubemap,
    dirty: true
  })
}
