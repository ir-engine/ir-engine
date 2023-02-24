import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FormControl from '../FormControl'
import InputBase from '../InputBase'
import InputLabel from '../InputLabel'
import InputAdornment from './index'

const argTypes = {}

export default {
  title: 'MUI/InputAdornment',
  component: InputAdornment,
  parameters: {
    componentSubtitle: 'InputAdornment',
    jest: 'InputAdornment.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <FormControl variant="standard">
        <InputLabel htmlFor="input-with-icon-adornment">I'm an icon adornment</InputLabel>
        <InputBase startAdornment={<Story />} />
      </FormControl>
    )
  ],
  argTypes
} as ComponentMeta<typeof InputAdornment>

const Template: ComponentStory<typeof InputAdornment> = ({ children, ...args }) => <InputAdornment {...args} />

export const Default = Template.bind({})
Default.args = InputAdornment.defaultProps
