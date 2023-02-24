import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ToggleButton from './index'

const argTypes = {}

export default {
  title: 'MUI/ToggleButton',
  component: ToggleButton,
  parameters: {
    componentSubtitle: 'ToggleButton',
    jest: 'ToggleButton.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ToggleButton>

const Template: ComponentStory<typeof ToggleButton> = (args) => <ToggleButton {...args} />

export const Default = Template.bind({})
Default.args = ToggleButton.defaultProps
