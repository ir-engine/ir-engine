import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import CardMedia from './index'

const argTypes = {}

export default {
  title: 'MUI/CardMedia',
  component: CardMedia,
  parameters: {
    componentSubtitle: 'CardMedia',
    jest: 'CardMedia.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof CardMedia>

const Template: ComponentStory<typeof CardMedia> = (args) => <CardMedia {...args} />

export const Default = Template.bind({})
Default.args = CardMedia.defaultProps
