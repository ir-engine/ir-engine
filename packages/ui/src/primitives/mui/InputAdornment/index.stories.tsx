import React from 'react'

import FormControl from '@etherealengine/ui/src/primitives/mui/FormControl'
import InputBase from '@etherealengine/ui/src/primitives/mui/InputBase'
import InputLabel from '@etherealengine/ui/src/primitives/mui/InputLabel'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/InputAdornment',
  component: Component,
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
}

export const Primary = { args: Component.defaultProps }
