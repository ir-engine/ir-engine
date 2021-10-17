import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../../scene/classes/Sky'

// TODO: WOrk in progress
export type SkyboxComponentProps = {
}

export class SkyboxComponentClass {
  static legacyComponentName = ComponentNames.SKYBOX

  constructor(obj3d: Sky, props: SkyboxComponentProps) {
    this.obj3d = obj3d
  }

  obj3d: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentClass>('SkyboxComponent')
