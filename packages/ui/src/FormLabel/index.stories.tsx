import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormLabel from './index'

const argTypes = {}

export default {
  title: 'MUI/FormLabel',
  component: FormLabel,
  parameters: {
    componentSubtitle: 'FormLabel',
    jest: 'FormLabel.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof FormLabel>

const Template: ComponentStory<typeof FormLabel> = (args) => <FormLabel {...args} />

export const Default = Template.bind({})
Default.args = FormLabel.defaultProps
