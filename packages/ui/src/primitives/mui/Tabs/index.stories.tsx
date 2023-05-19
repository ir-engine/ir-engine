import React from 'react'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/Tabs',
  component: Component,
  parameters: {
    componentSubtitle: 'Tabs',
    jest: 'Tabs.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        <div role="tabpanel" hidden={false}>
          Hello
        </div>
      </>
    )
  ],
  argTypes
}

export const Primary = { args: Component.defaultProps }
