import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormControlLabel from './index'

const argTypes = {}

export default {
  title: 'Components/FormControlLabel',
  component: FormControlLabel,
  parameters: {
    componentSubtitle: 'FormControlLabel',
    jest: 'FormControlLabel.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof FormControlLabel>

const Template: ComponentStory<typeof FormControlLabel> = (args) => <FormControlLabel {...args} />

export const Default = Template.bind({})
Default.args = FormControlLabel.defaultProps
