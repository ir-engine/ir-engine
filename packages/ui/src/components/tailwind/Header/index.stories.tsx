import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Header from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/Header',
  component: Header,
  parameters: {
    componentSubtitle: 'Header',
    jest: 'Header.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Header>

const Template: ComponentStory<typeof Header> = (args) => <Header {...args} />

export const Default = Template.bind({})
Default.args = Header.defaultProps
