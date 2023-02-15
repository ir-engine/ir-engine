import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import { Table, TableBody } from '@mui/material'

import TableRow from '../TableRow'
import TablePagination from './index'

const argTypes = {}

export default {
  title: 'MUI/TablePagination',
  component: TablePagination,
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
} as ComponentMeta<typeof TablePagination>

const Template: ComponentStory<typeof TablePagination> = (args) => <TablePagination {...args} />

export const Default = Template.bind({})
Default.args = TablePagination.defaultProps
