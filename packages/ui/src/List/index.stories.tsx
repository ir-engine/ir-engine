import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import List from './index'

const argTypes = {}

export default {
  title: 'Components/List',
  component: List,
  parameters: {
    componentSubtitle: 'List',
    jest: 'List.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof List>

const Template: ComponentStory<typeof List> = (args) => <List {...args} />

export const Default = Template.bind({})
Default.args = List.defaultProps
