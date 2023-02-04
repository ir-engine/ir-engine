import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import OutlinedInput from './index'

const argTypes = {}

export default {
  title: 'Components/OutlinedInput',
  component: OutlinedInput,
  parameters: {
    componentSubtitle: 'OutlinedInput',
    jest: 'OutlinedInput.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof OutlinedInput>

const Template: ComponentStory<typeof OutlinedInput> = (args) => <OutlinedInput {...args} />

export const Default = Template.bind({})
Default.args = OutlinedInput.defaultProps
