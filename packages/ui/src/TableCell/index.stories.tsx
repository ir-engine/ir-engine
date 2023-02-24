import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Table from '../Table'
import TableBody from '../TableBody'
import TableRow from '../TableRow'
import TableCell from './index'

const argTypes = {}

export default {
  title: 'MUI/TableCell',
  component: TableCell,
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
} as ComponentMeta<typeof TableCell>

const Template: ComponentStory<typeof TableCell> = (args) => <TableCell {...args} />

export const Default = Template.bind({})
Default.args = TableCell.defaultProps
