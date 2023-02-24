import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import AccordionDetails from './index'

const argTypes = {}

export default {
  title: 'MUI/AccordionDetails',
  component: AccordionDetails,
  parameters: {
    componentSubtitle: 'AccordionDetails',
    jest: 'AccordionDetails.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof AccordionDetails>

const Template: ComponentStory<typeof AccordionDetails> = (args) => <AccordionDetails {...args} />

export const Default = Template.bind({})
Default.args = AccordionDetails.defaultProps
