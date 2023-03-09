import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Box from './index'

const argTypes = {}

export default {
  title: 'MUI/Box',
  component: Box,
  parameters: {
    componentSubtitle: 'Box',
    jest: 'Box.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Box>

const Template: ComponentStory<typeof Box> = (args) => <Box {...args} />

export const Default = Template.bind({})
Default.args = Box.defaultProps
