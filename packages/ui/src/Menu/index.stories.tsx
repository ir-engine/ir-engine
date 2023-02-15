import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Menu from './index'

const argTypes = {}

export default {
  title: 'MUI/Menu',
  component: Menu,
  parameters: {
    componentSubtitle: 'Menu',
    jest: 'Menu.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Menu>

const Template: ComponentStory<typeof Menu> = (args) => <Menu {...args} />

export const Default = Template.bind({})
Default.args = Menu.defaultProps
