import React from 'react'

import Table from '@etherealengine/ui/src/primitives/mui/Table'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TableBody',
  component: Component,
  parameters: {
    componentSubtitle: 'TableBody',
    jest: 'TableBody.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <Table>
        <Story />
      </Table>
    )
  ],
  argTypes
}

export const Primary = { args: Component.defaultProps }
