import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Radio from './index'

const argTypes = {}

export default {
  title: 'MUI/Radio',
  component: Radio,
  parameters: {
    componentSubtitle: 'Radio',
    jest: 'Radio.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Radio>

const Template: ComponentStory<typeof Radio> = (args) => <Radio {...args} />

export const Default = Template.bind({})
Default.args = Radio.defaultProps
