import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import OutlinedInput from './index'

const argTypes = {}

export default {
  title: 'MUI/OutlinedInput',
  component: OutlinedInput,
  parameters: {
    componentSubtitle: 'OutlinedInput',
    jest: 'OutlinedInput.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof OutlinedInput>

const Template: ComponentStory<typeof OutlinedInput> = (args) => <OutlinedInput {...args} />

export const Default = Template.bind({})
Default.args = OutlinedInput.defaultProps
