import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../../scene/classes/Sky'

// TODO: WOrk in progress
export type SkyboxComponentProps = {
  obj3d: Sky
}

export class SkyboxComponentClass {
  static legacyComponentName = 'skybox'
  static nodeName = 'Skybox'

  constructor(props: SkyboxComponentProps) {
    this.obj3d = props.obj3d ?? new Sky()
  }

  obj3d: Sky
}

export const SkyboxComponent = createMappedComponent<SkyboxComponentClass>('SkyboxComponent')
