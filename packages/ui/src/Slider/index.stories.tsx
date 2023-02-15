import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Slider from './index'

const argTypes = {}

export default {
  title: 'MUI/Slider',
  component: Slider,
  parameters: {
    componentSubtitle: 'Slider',
    jest: 'Slider.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Slider>

const Template: ComponentStory<typeof Slider> = (args) => <Slider {...args} />

export const Default = Template.bind({})
Default.args = Slider.defaultProps
