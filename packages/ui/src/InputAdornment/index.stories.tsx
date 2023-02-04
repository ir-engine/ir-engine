import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import InputAdornment from './index'

const argTypes = {}

export default {
  title: 'Components/InputAdornment',
  component: InputAdornment,
  parameters: {
    componentSubtitle: 'InputAdornment',
    jest: 'InputAdornment.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof InputAdornment>

const Template: ComponentStory<typeof InputAdornment> = (args) => <InputAdornment {...args} />

export const Default = Template.bind({})
Default.args = InputAdornment.defaultProps
