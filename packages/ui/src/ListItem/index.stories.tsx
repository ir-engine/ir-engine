import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItem from './index'

const argTypes = {}

export default {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: {
    componentSubtitle: 'ListItem',
    jest: 'ListItem.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof ListItem>

const Template: ComponentStory<typeof ListItem> = (args) => <ListItem {...args} />

export const Default = Template.bind({})
Default.args = ListItem.defaultProps
