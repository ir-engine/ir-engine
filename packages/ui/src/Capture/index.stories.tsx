import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Capture from './index'

const argTypes = {}

export default {
  title: 'Experimental/Capture',
  component: Capture,
  parameters: {
    componentSubtitle: 'Capture',
    jest: 'Capture.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Capture>

const Template: ComponentStory<typeof Capture> = (args) => <Capture {...args} />

export const Default = Template.bind({})
Default.args = Capture.defaultProps
