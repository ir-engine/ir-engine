import React from 'react'

import Table from '../Table'
import TableBody from '../TableBody'
import TableRow from '../TableRow'
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
