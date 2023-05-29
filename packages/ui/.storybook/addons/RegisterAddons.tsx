import { addons, types } from '@storybook/addons'
import { RenderOptions } from '@storybook/addons'
// import { FORCE_RE_RENDER } from '@storybook/core-events';
import { useGlobals } from '@storybook/manager-api'
import React from 'react'

import SystemStatus from './SystemStatus'

addons.register('Ethereal Engine', () => {
  addons.add('Ethereal Engine', {
    title: 'Ethereal Engine',
    type: types.PANEL, // TAB, PANEL, TOOL, TOOLEXTRA, PREVIEW, NOTES_ELEMENT
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: ({ active }: RenderOptions) => {
      // const [globals, updateGlobals] = useGlobals()
      return <SystemStatus />
    }
  })
})
