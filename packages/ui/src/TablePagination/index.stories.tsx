import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TablePagination from './index'

const argTypes = {}

export default {
  title: 'Components/TablePagination',
  component: TablePagination,
  parameters: {
    componentSubtitle: 'TablePagination',
    jest: 'TablePagination.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TablePagination>

const Template: ComponentStory<typeof TablePagination> = (args) => <TablePagination {...args} />

export const Default = Template.bind({})
Default.args = TablePagination.defaultProps
