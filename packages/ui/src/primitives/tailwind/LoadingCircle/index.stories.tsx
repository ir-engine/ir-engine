import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import LoadingCircle from './index'

const argTypes = {}

export default {
  title: 'Tailwind/LoadingCircle',
  component: LoadingCircle,
  parameters: {
    componentSubtitle: 'LoadingCircle',
    jest: 'LoadingCircle.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof LoadingCircle>

const Template: ComponentStory<typeof LoadingCircle> = (args) => <LoadingCircle {...args} />

export const Default = Template.bind({})
Default.args = LoadingCircle.defaultProps
