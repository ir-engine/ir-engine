import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import AccordionDetails from './index'

const argTypes = {}

export default {
  title: 'Components/AccordionDetails',
  component: AccordionDetails,
  parameters: {
    componentSubtitle: 'AccordionDetails',
    jest: 'AccordionDetails.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof AccordionDetails>

const Template: ComponentStory<typeof AccordionDetails> = (args) => <AccordionDetails {...args} />

export const Default = Template.bind({})
Default.args = AccordionDetails.defaultProps
