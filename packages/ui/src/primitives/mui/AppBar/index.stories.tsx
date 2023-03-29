import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import AppBar from './index'

const argTypes = {}

export default {
  title: 'MUI/AppBar',
  component: AppBar,
  parameters: {
    componentSubtitle: 'AppBar',
    jest: 'AppBar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof AppBar>

const Template: ComponentStory<typeof AppBar> = (args) => <AppBar {...args} />

export const Default = Template.bind({})
Default.args = AppBar.defaultProps
