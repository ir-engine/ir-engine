import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import InputBase from './index'

const argTypes = {}

export default {
  title: 'MUI/InputBase',
  component: InputBase,
  parameters: {
    componentSubtitle: 'InputBase',
    jest: 'InputBase.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof InputBase>

const Template: ComponentStory<typeof InputBase> = (args) => <InputBase {...args} />

export const Default = Template.bind({})
Default.args = InputBase.defaultProps
