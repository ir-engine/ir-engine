import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import MenuItem from './index'

const argTypes = {}

export default {
  title: 'Components/MenuItem',
  component: MenuItem,
  parameters: {
    componentSubtitle: 'MenuItem',
    jest: 'MenuItem.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof MenuItem>

const Template: ComponentStory<typeof MenuItem> = (args) => <MenuItem {...args} />

export const Default = Template.bind({})
Default.args = MenuItem.defaultProps
