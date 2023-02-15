import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Table from '../Table'
import TableHead from './index'

const argTypes = {}

export default {
  title: 'MUI/TableHead',
  component: TableHead,
  parameters: {
    componentSubtitle: 'TableHead',
    jest: 'TableHead.test.tsx',
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
} as ComponentMeta<typeof TableHead>

const Template: ComponentStory<typeof TableHead> = (args) => <TableHead {...args} />

export const Default = Template.bind({})
Default.args = TableHead.defaultProps
