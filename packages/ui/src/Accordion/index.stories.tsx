import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Accordion from './index'

const argTypes = {}

export default {
  title: 'MUI/Accordion',
  component: Accordion,
  parameters: {
    componentSubtitle: 'Accordion',
    jest: 'Accordion.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Accordion>

const Template: ComponentStory<typeof Accordion> = (args) => <Accordion {...args} />

export const Default = Template.bind({})
Default.args = Accordion.defaultProps
