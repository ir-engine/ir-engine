import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormControl from './index'

const argTypes = {}

export default {
  title: 'Components/FormControl',
  component: FormControl,
  parameters: {
    componentSubtitle: 'FormControl',
    jest: 'FormControl.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof FormControl>

const Template: ComponentStory<typeof FormControl> = (args) => <FormControl {...args} />

export const Default = Template.bind({})
Default.args = FormControl.defaultProps
