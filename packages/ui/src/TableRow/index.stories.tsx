import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableRow from './index'

const argTypes = {}

export default {
  title: 'Components/TableRow',
  component: TableRow,
  parameters: {
    componentSubtitle: 'TableRow',
    jest: 'TableRow.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TableRow>

const Template: ComponentStory<typeof TableRow> = (args) => <TableRow {...args} />

export const Default = Template.bind({})
Default.args = TableRow.defaultProps
