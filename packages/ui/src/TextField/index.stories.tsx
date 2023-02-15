import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TextField from './index'

const argTypes = {}

export default {
  title: 'MUI/TextField',
  component: TextField,
  parameters: {
    componentSubtitle: 'TextField',
    jest: 'TextField.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof TextField>

const Template: ComponentStory<typeof TextField> = (args) => <TextField {...args} />

export const Default = Template.bind({})
Default.args = TextField.defaultProps
