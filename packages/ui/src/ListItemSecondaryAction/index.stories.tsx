import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItemSecondaryAction from './index'

const argTypes = {}

export default {
  title: 'Components/ListItemSecondaryAction',
  component: ListItemSecondaryAction,
  parameters: {
    componentSubtitle: 'ListItemSecondaryAction',
    jest: 'ListItemSecondaryAction.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof ListItemSecondaryAction>

const Template: ComponentStory<typeof ListItemSecondaryAction> = (args) => <ListItemSecondaryAction {...args} />

export const Default = Template.bind({})
Default.args = ListItemSecondaryAction.defaultProps
