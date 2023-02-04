import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ListItemIcon from './index'

const argTypes = {}

export default {
  title: 'Components/ListItemIcon',
  component: ListItemIcon,
  parameters: {
    componentSubtitle: 'ListItemIcon',
    jest: 'ListItemIcon.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof ListItemIcon>

const Template: ComponentStory<typeof ListItemIcon> = (args) => <ListItemIcon {...args} />

export const Default = Template.bind({})
Default.args = ListItemIcon.defaultProps
