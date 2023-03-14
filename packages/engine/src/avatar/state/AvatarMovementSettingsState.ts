import { defineState } from '@etherealengine/hyperflux'

export const AvatarMovementSettingsState = defineState({
  name: 'AvatarMovementSettingsState',
  initial: () => ({
    // Speeds are same as animation's root motion - in meters per second
    walkSpeed: 1.6762927669761485,
    runSpeed: 3.769894125544925 * 1.5,
    jumpHeight: 2
  })
})
