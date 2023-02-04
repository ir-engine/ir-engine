import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Table from './index'

const argTypes = {}

export default {
  title: 'Components/Table',
  component: Table,
  parameters: {
    componentSubtitle: 'Table',
    jest: 'Table.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Table>

const Template: ComponentStory<typeof Table> = (args) => <Table {...args} />

export const Default = Template.bind({})
Default.args = Table.defaultProps
