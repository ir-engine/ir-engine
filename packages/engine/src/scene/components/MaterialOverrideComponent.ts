import { PatternTarget } from '@xrengine/engine/src/renderer/materials/MaterialParms'

import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type MaterialOverrideComponentType = {
  entity: Entity
  targetEntity: Entity
  materialID: string
  patternTarget: PatternTarget
  pattern: string | RegExp
}

export const MaterialOverrideComponent = createMappedComponent<MaterialOverrideComponentType>('material-override')
