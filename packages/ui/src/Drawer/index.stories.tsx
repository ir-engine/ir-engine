import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Drawer from './index'

const argTypes = {}

export default {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    componentSubtitle: 'Drawer',
    jest: 'Drawer.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Drawer>

const Template: ComponentStory<typeof Drawer> = (args) => <Drawer {...args} />

export const Default = Template.bind({})
Default.args = Drawer.defaultProps
