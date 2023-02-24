import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Mediapipe from './index'

const argTypes = {}

export default {
  title: 'Expermiental/Mediapipe',
  component: Mediapipe,
  parameters: {
    componentSubtitle: 'Mediapipe',
    jest: 'Mediapipe.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Mediapipe>

const Template: ComponentStory<typeof Mediapipe> = (args) => <Mediapipe {...args} />

export const Default = Template.bind({})
Default.args = Mediapipe.defaultProps
