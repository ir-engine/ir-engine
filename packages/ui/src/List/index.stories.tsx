import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import List from './index'

const argTypes = {}

export default {
  title: 'MUI/List',
  component: List,
  parameters: {
    componentSubtitle: 'List',
    jest: 'List.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof List>

const Template: ComponentStory<typeof List> = (args) => <List {...args} />

export const Default = Template.bind({})
Default.args = List.defaultProps
