import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import AccordionSummary from './index'

const argTypes = {}

export default {
  title: 'MUI/AccordionSummary',
  component: AccordionSummary,
  parameters: {
    componentSubtitle: 'AccordionSummary',
    jest: 'AccordionSummary.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof AccordionSummary>

const Template: ComponentStory<typeof AccordionSummary> = (args) => <AccordionSummary {...args} />

export const Default = Template.bind({})
Default.args = AccordionSummary.defaultProps
