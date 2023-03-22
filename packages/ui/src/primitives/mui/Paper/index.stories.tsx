import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Paper from './index'

const argTypes = {}

export default {
  title: 'MUI/Paper',
  component: Paper,
  parameters: {
    componentSubtitle: 'Paper',
    jest: 'Paper.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Paper>

const Template: ComponentStory<typeof Paper> = (args) => <Paper {...args} />

export const Default = Template.bind({})
Default.args = Paper.defaultProps
