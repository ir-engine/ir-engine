import React from 'react'

import Table from '../Table'
import TableBody from '../TableBody'
import Component from './index'

const argTypes = {}

export default {
  title: 'Primitives/MUI/TableRow',
  component: Component,
  parameters: {
    componentSubtitle: 'TableRow',
    jest: 'TableRow.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    )
  ],
  argTypes
}
export const Primary = { args: Component.defaultProps }
