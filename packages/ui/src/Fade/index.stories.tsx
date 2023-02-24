import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Fade from './index'

const argTypes = {}

export default {
  title: 'MUI/Fade',
  component: Fade,
  parameters: {
    componentSubtitle: 'Fade',
    jest: 'Fade.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Fade>

const Template: ComponentStory<typeof Fade> = (args) => <Fade {...args} />

export const Default = Template.bind({})
Default.args = Fade.defaultProps
