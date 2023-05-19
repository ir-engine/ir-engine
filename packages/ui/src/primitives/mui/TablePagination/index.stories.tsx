import React from 'react'

import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'

import { Table, TableBody } from '@mui/material'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TablePagination',
  component: Component,
  parameters: {
    componentSubtitle: 'TablePagination',
    jest: 'TablePagination.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <TableRow>
            <Story />
          </TableRow>
        </TableBody>
      </Table>
    )
  ],
  argTypes
}

export const Primary = { args: Component.defaultProps }
