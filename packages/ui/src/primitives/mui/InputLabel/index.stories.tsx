import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import InputLabel from './index'

const argTypes = {}

export default {
  title: 'MUI/InputLabel',
  component: InputLabel,
  parameters: {
    componentSubtitle: 'InputLabel',
    jest: 'InputLabel.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof InputLabel>

const Template: ComponentStory<typeof InputLabel> = (args) => <InputLabel {...args} />

export const Default = Template.bind({})
Default.args = InputLabel.defaultProps
