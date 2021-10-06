import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../classes/Sky'

// TODO: Work in progress
export type PostProcessingComponentProps = {
  obj3d: Sky
}

export class PostProcessingComponentClass {
  static legacyComponentName = 'postProcessing'
  static nodeName = 'PostProcessing'

  constructor(props: PostProcessingComponentProps) {
    this.obj3d = props.obj3d ?? new Sky()
  }

  obj3d: Sky
}

export const PostProcessingComponent = createMappedComponent<PostProcessingComponentClass>('PostProcessingComponent')
