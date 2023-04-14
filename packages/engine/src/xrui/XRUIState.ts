import { Object3D, Ray } from 'three'

import { defineState } from '@etherealengine/hyperflux'

export const XRUIState = defineState({
  name: 'XRUIState',
  initial: () => ({
    pointerActive: false,
    interactionRays: [] as Array<Ray | Object3D>
  })
})
