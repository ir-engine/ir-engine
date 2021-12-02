import { Color } from 'three'
import { isClient } from '../../common/functions/isClient'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { DisableTransformTagComponent } from '../../transform/components/DisableTransformTagComponent'
import { SkyboxComponent, SkyboxComponentType } from '../components/SkyboxComponent'

export const createSkybox = (entity, args: SkyboxComponentType) => {
  if (isClient) {
    args.dirty = true
    args.backgroundColor = new Color(args.backgroundColor)
    addComponent(entity, SkyboxComponent, args)
    addComponent(entity, DisableTransformTagComponent, {})
  }
}
