import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Divider from './index'

const argTypes = {}

export default {
  title: 'MUI/Divider',
  component: Divider,
  parameters: {
    componentSubtitle: 'Divider',
    jest: 'Divider.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Divider>

const Template: ComponentStory<typeof Divider> = (args) => <Divider {...args} />

export const Default = Template.bind({})
Default.args = Divider.defaultProps
