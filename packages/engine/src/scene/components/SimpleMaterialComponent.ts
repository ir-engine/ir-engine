import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export class SimpleMaterialComponentClass {
  static legacyComponentName = 'simple-materials'
  static nodeName = 'Simple Materials'
}

export const SimpleMaterialComponent = createMappedComponent<SimpleMaterialComponentClass>('SimpleMaterialComponent')
