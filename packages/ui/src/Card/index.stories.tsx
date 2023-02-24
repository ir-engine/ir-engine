import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Card from './index'

const argTypes = {}

export default {
  title: 'MUI/Card',
  component: Card,
  parameters: {
    componentSubtitle: 'Card',
    jest: 'Card.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Card>

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />

export const Default = Template.bind({})
Default.args = Card.defaultProps
