import type Volumetric from '@xrfoundation/volumetric/player'

import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export const VolumetricComponent = createMappedComponent<Volumetric>('VolumetricComponent')
