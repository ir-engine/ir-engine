import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableCell from './index'

const argTypes = {}

export default {
  title: 'Components/TableCell',
  component: TableCell,
  parameters: {
    componentSubtitle: 'TableCell',
    jest: 'TableCell.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TableCell>

const Template: ComponentStory<typeof TableCell> = (args) => <TableCell {...args} />

export const Default = Template.bind({})
Default.args = TableCell.defaultProps
