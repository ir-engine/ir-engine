import { defineState } from '@etherealengine/hyperflux'

/**
 * Popover state for tailwind routes
 */
export const PopoverState = defineState({
  name: 'ee.client.PopoverState',
  initial: {
    element: null as JSX.Element | null
  }
})
