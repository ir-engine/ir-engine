import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Chip from './index'

const argTypes = {}

export default {
  title: 'MUI/Chip',
  component: Chip,
  parameters: {
    componentSubtitle: 'Chip',
    jest: 'Chip.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Chip>

const Template: ComponentStory<typeof Chip> = (args) => <Chip {...args} />

export const Default = Template.bind({})
Default.args = Chip.defaultProps
