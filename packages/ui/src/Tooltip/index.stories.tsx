import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Tooltip from './index'

const argTypes = {}

export default {
  title: 'MUI/Tooltip',
  component: Tooltip,
  parameters: {
    componentSubtitle: 'Tooltip',
    jest: 'Tooltip.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Tooltip>

const Template: ComponentStory<typeof Tooltip> = (args) => <Tooltip {...args} />

export const Default = Template.bind({})
Default.args = Tooltip.defaultProps
