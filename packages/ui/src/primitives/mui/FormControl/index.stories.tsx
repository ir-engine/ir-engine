import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormControl from './index'

const argTypes = {}

export default {
  title: 'MUI/FormControl',
  component: FormControl,
  parameters: {
    componentSubtitle: 'FormControl',
    jest: 'FormControl.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof FormControl>

const Template: ComponentStory<typeof FormControl> = (args) => <FormControl {...args} />

export const Default = Template.bind({})
Default.args = FormControl.defaultProps
