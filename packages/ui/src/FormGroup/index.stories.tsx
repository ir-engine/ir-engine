import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormGroup from './index'

const argTypes = {}

export default {
  title: 'MUI/FormGroup',
  component: FormGroup,
  parameters: {
    componentSubtitle: 'FormGroup',
    jest: 'FormGroup.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof FormGroup>

const Template: ComponentStory<typeof FormGroup> = (args) => <FormGroup {...args} />

export const Default = Template.bind({})
Default.args = FormGroup.defaultProps
