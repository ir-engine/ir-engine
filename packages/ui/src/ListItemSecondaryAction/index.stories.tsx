import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItemSecondaryAction from './index'

const argTypes = {}

export default {
  title: 'MUI/ListItemSecondaryAction',
  component: ListItemSecondaryAction,
  parameters: {
    componentSubtitle: 'ListItemSecondaryAction',
    jest: 'ListItemSecondaryAction.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof ListItemSecondaryAction>

const Template: ComponentStory<typeof ListItemSecondaryAction> = (args) => <ListItemSecondaryAction {...args} />

export const Default = Template.bind({})
Default.args = ListItemSecondaryAction.defaultProps
