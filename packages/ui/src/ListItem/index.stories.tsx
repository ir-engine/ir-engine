import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItem from './index'

const argTypes = {}

export default {
  title: 'MUI/ListItem',
  component: ListItem,
  parameters: {
    componentSubtitle: 'ListItem',
    jest: 'ListItem.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ListItem>

const Template: ComponentStory<typeof ListItem> = (args) => <ListItem {...args} />

export const Default = Template.bind({})
Default.args = ListItem.defaultProps
