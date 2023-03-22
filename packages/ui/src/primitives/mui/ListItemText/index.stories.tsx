import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItemText from './index'

const argTypes = {}

export default {
  title: 'MUI/ListItemText',
  component: ListItemText,
  parameters: {
    componentSubtitle: 'ListItemText',
    jest: 'ListItemText.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ListItemText>

const Template: ComponentStory<typeof ListItemText> = (args) => <ListItemText {...args} />

export const Default = Template.bind({})
Default.args = ListItemText.defaultProps
