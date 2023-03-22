import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Drawer from './index'

const argTypes = {}

export default {
  title: 'MUI/Drawer',
  component: Drawer,
  parameters: {
    componentSubtitle: 'Drawer',
    jest: 'Drawer.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Drawer>

const Template: ComponentStory<typeof Drawer> = (args) => <Drawer {...args} />

export const Default = Template.bind({})
Default.args = Drawer.defaultProps
