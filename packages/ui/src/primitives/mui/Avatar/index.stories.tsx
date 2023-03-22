import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Avatar from './index'

const argTypes = {}

export default {
  title: 'MUI/Avatar',
  component: Avatar,
  parameters: {
    componentSubtitle: 'Avatar',
    jest: 'Avatar.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Avatar>

const Template: ComponentStory<typeof Avatar> = (args) => <Avatar {...args} />

export const Default = Template.bind({})
Default.args = Avatar.defaultProps
