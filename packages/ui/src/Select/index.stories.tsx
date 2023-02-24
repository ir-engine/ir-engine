import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Select from './index'

const argTypes = {}

export default {
  title: 'MUI/Select',
  component: Select,
  parameters: {
    componentSubtitle: 'Select',
    jest: 'Select.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Select>

const Template: ComponentStory<typeof Select> = (args) => <Select {...args} />

export const Default = Template.bind({})
Default.args = Select.defaultProps
