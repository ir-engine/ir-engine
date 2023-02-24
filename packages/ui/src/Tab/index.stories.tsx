import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Tab from './index'

const argTypes = {}

export default {
  title: 'MUI/Tab',
  component: Tab,
  parameters: {
    componentSubtitle: 'Tab',
    jest: 'Tab.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Tab>

const Template: ComponentStory<typeof Tab> = (args) => <Tab {...args} />

export const Default = Template.bind({})
Default.args = Tab.defaultProps
