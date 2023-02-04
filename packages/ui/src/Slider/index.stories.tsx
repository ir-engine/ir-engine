import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Slider from './index'

const argTypes = {}

export default {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    componentSubtitle: 'Slider',
    jest: 'Slider.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Slider>

const Template: ComponentStory<typeof Slider> = (args) => <Slider {...args} />

export const Default = Template.bind({})
Default.args = Slider.defaultProps
