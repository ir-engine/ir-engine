import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Toolbar from './index'

const argTypes = {}

export default {
  title: 'MUI/Toolbar',
  component: Toolbar,
  parameters: {
    componentSubtitle: 'Toolbar',
    jest: 'Toolbar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Toolbar>

const Template: ComponentStory<typeof Toolbar> = (args) => <Toolbar {...args} />

export const Default = Template.bind({})
Default.args = Toolbar.defaultProps
