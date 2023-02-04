import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableSortLabel from './index'

const argTypes = {}

export default {
  title: 'Components/TableSortLabel',
  component: TableSortLabel,
  parameters: {
    componentSubtitle: 'TableSortLabel',
    jest: 'TableSortLabel.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TableSortLabel>

const Template: ComponentStory<typeof TableSortLabel> = (args) => <TableSortLabel {...args} />

export const Default = Template.bind({})
Default.args = TableSortLabel.defaultProps
