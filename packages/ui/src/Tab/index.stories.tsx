import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Tab from './index'

const argTypes = {}

export default {
  title: 'Components/Tab',
  component: Tab,
  parameters: {
    componentSubtitle: 'Tab',
    jest: 'Tab.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Tab>

const Template: ComponentStory<typeof Tab> = (args) => <Tab {...args} />

export const Default = Template.bind({})
Default.args = Tab.defaultProps
