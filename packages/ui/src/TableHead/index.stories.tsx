import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import TableHead from './index'

const argTypes = {}

export default {
  title: 'Components/TableHead',
  component: TableHead,
  parameters: {
    componentSubtitle: 'TableHead',
    jest: 'TableHead.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof TableHead>

const Template: ComponentStory<typeof TableHead> = (args) => <TableHead {...args} />

export const Default = Template.bind({})
Default.args = TableHead.defaultProps
