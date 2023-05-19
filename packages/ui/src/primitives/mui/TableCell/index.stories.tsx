import React from 'react'

import Table from '@etherealengine/ui/src/primitives/mui/Table'
import TableBody from '@etherealengine/ui/src/primitives/mui/TableBody'
import TableRow from '@etherealengine/ui/src/primitives/mui/TableRow'

import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TableCell',
  component: Component,
  parameters: {
    componentSubtitle: 'TableCell',
    jest: 'TableCell.test.tsx',
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
