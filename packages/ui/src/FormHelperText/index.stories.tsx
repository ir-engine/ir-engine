import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormHelperText from './index'

const argTypes = {}

export default {
  title: 'Components/FormHelperText',
  component: FormHelperText,
  parameters: {
    componentSubtitle: 'FormHelperText',
    jest: 'FormHelperText.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof FormHelperText>

const Template: ComponentStory<typeof FormHelperText> = (args) => <FormHelperText {...args} />

export const Default = Template.bind({})
Default.args = FormHelperText.defaultProps
