import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Badge from './index'

const argTypes = {}

export default {
  title: 'MUI/Badge',
  component: Badge,
  parameters: {
    componentSubtitle: 'Badge',
    jest: 'Badge.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Badge>

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />

export const Default = Template.bind({})
Default.args = Badge.defaultProps
