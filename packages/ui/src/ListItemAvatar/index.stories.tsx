import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItemAvatar from './index'

const argTypes = {}

export default {
  title: 'MUI/ListItemAvatar',
  component: ListItemAvatar,
  parameters: {
    componentSubtitle: 'ListItemAvatar',
    jest: 'ListItemAvatar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ListItemAvatar>

const Template: ComponentStory<typeof ListItemAvatar> = (args) => <ListItemAvatar {...args} />

export const Default = Template.bind({})
Default.args = ListItemAvatar.defaultProps
