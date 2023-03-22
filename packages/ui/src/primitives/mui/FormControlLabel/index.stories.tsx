import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormControlLabel from './index'

const argTypes = {}

export default {
  title: 'MUI/FormControlLabel',
  component: FormControlLabel,
  parameters: {
    componentSubtitle: 'FormControlLabel',
    jest: 'FormControlLabel.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof FormControlLabel>

const Template: ComponentStory<typeof FormControlLabel> = (args) => <FormControlLabel {...args} />

export const Default = Template.bind({})
Default.args = FormControlLabel.defaultProps
