import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableSortLabel from './index'

const argTypes = {}

export default {
  title: 'MUI/TableSortLabel',
  component: TableSortLabel,
  parameters: {
    componentSubtitle: 'TableSortLabel',
    jest: 'TableSortLabel.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof TableSortLabel>

const Template: ComponentStory<typeof TableSortLabel> = (args) => <TableSortLabel {...args} />

export const Default = Template.bind({})
Default.args = TableSortLabel.defaultProps
