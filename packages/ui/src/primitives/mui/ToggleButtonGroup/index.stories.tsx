import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ToggleButtonGroup from './index'

const argTypes = {}

export default {
  title: 'MUI/ToggleButtonGroup',
  component: ToggleButtonGroup,
  parameters: {
    componentSubtitle: 'ToggleButtonGroup',
    jest: 'ToggleButtonGroup.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ToggleButtonGroup>

const Template: ComponentStory<typeof ToggleButtonGroup> = (args) => <ToggleButtonGroup {...args} />

export const Default = Template.bind({})
Default.args = ToggleButtonGroup.defaultProps
