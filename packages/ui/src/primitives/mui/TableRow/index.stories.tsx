import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Table from '../Table'
import TableBody from '../TableBody'
import TableRow from './index'

const argTypes = {}

export default {
  title: 'MUI/TableRow',
  component: TableRow,
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
} as ComponentMeta<typeof TableRow>

const Template: ComponentStory<typeof TableRow> = (args) => <TableRow {...args} />

export const Default = Template.bind({})
Default.args = TableRow.defaultProps
