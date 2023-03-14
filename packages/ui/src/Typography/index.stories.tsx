import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Typography from './index'

const argTypes = {}

export default {
  title: 'MUI/Typography',
  component: Typography,
  parameters: {
    componentSubtitle: 'Typography',
    jest: 'Typography.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Typography>

const Template: ComponentStory<typeof Typography> = (args) => <Typography {...args} />

export const Default = Template.bind({})
Default.args = Typography.defaultProps
