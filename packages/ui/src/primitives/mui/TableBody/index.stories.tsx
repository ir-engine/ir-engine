import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Table from '../Table'
import TableBody from './index'

const argTypes = {}

export default {
  title: 'MUI/TableBody',
  component: TableBody,
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
} as ComponentMeta<typeof TableBody>

const Template: ComponentStory<typeof TableBody> = (args) => <TableBody {...args} />

export const Default = Template.bind({})

Default.args = TableBody.defaultProps
