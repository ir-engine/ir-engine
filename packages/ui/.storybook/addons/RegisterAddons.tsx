import { addons, types } from '@storybook/addons'
import { RenderOptions } from '@storybook/addons'
// import { FORCE_RE_RENDER } from '@storybook/core-events';
import { useGlobals } from '@storybook/manager-api'
import React from 'react'

import SystemStatus from './SystemStatus'

addons.register('SystemStatus', () => {
  addons.add('SystemStatus', {
    title: 'Ethereal Engine - System Status',
    type: types.TOOL,
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: ({ active }: RenderOptions) => {
      const [globals, updateGlobals] = useGlobals()
      return <SystemStatus active={active} />
    }
  })
})
