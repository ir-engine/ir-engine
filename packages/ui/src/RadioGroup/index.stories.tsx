import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import RadioGroup from './index'

const argTypes = {}

export default {
  title: 'MUI/RadioGroup',
  component: RadioGroup,
  parameters: {
    componentSubtitle: 'RadioGroup',
    jest: 'RadioGroup.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof RadioGroup>

const Template: ComponentStory<typeof RadioGroup> = (args) => <RadioGroup {...args} />

export const Default = Template.bind({})
Default.args = RadioGroup.defaultProps
