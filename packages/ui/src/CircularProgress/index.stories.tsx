import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import CircularProgress from './index'

const argTypes = {}

export default {
  title: 'MUI/CircularProgress',
  component: CircularProgress,
  parameters: {
    componentSubtitle: 'CircularProgress',
    jest: 'CircularProgress.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof CircularProgress>

const Template: ComponentStory<typeof CircularProgress> = (args) => <CircularProgress {...args} />

export const Default = Template.bind({})
Default.args = CircularProgress.defaultProps
