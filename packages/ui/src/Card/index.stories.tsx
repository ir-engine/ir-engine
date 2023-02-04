import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Card from './index'

const argTypes = {}

export default {
  title: 'Components/Card',
  component: Card,
  parameters: {
    componentSubtitle: 'Card',
    jest: 'Card.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Card>

const Template: ComponentStory<typeof Card> = (args) => <Card {...args} />

export const Default = Template.bind({})
Default.args = Card.defaultProps
